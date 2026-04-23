// 売上ページ - JST 基準で当月の日別売上を可視化
// Railway は UTC で動くため getJstMonthBounds() で正しい月境界を計算する。
// 完了判定は status='completed' or paidAt!=null (どちらかが満たされていれば集計対象)。

import { getCurrentSalon } from '@/lib/salonData';
import { prisma } from '@/lib/db';
import { getJstMonthBounds, listMonthDays, jstDate, fmtJstShort } from '@/lib/jst';
import { yen } from '@/lib/utils/format';
import { TrendingUp, TrendingDown, Banknote, CreditCard, QrCode, Coins, Gift, MoreHorizontal } from 'lucide-react';

const METHOD_LABELS: Record<string, { label: string; icon: React.ComponentType<{ className?: string }> }> = {
  cash: { label: '現金', icon: Banknote },
  credit: { label: 'クレジット', icon: CreditCard },
  qr: { label: 'QR決済', icon: QrCode },
  coin: { label: 'COIN+', icon: Coins },
  point: { label: 'HPBポイント', icon: Gift },
  other: { label: 'その他', icon: MoreHorizontal },
};

export default async function SalesPage() {
  const { salon } = await getCurrentSalon();
  const today = new Date();
  const todayStr = jstDate(today);
  const month = getJstMonthBounds(today);
  const prevMonth = getJstMonthBounds(new Date(month.start.getTime() - 24 * 60 * 60 * 1000));

  // 当月分: status='completed' OR paidAt!=null
  const completedReservations = await prisma.reservation.findMany({
    where: {
      salonId: salon.id,
      OR: [
        { status: 'completed', date: { gte: month.startStr, lt: month.endStr } },
        { paidAt: { gte: month.start, lt: month.end } },
      ],
    },
  });

  // 前月分 (比較)
  const prevCompleted = await prisma.reservation.findMany({
    where: {
      salonId: salon.id,
      OR: [
        { status: 'completed', date: { gte: prevMonth.startStr, lt: prevMonth.endStr } },
        { paidAt: { gte: prevMonth.start, lt: prevMonth.end } },
      ],
    },
  });

  const sumOf = (rs: typeof completedReservations) =>
    rs.reduce((s, r) => s + (r.paidAmount ?? r.menuPrice ?? 0) + (r.retailAmount ?? 0) + (r.tip ?? 0) + (r.designationFee ?? 0), 0);

  const monthRevenue = sumOf(completedReservations);
  const prevRevenue = sumOf(prevCompleted);
  const delta = prevRevenue > 0 ? (monthRevenue - prevRevenue) / prevRevenue : 0;

  const visitsCount = completedReservations.length;
  const avgTicket = visitsCount > 0 ? Math.round(monthRevenue / visitsCount) : 0;
  const retailRev = completedReservations.reduce((s, r) => s + (r.retailAmount ?? 0), 0);

  // 日別集計 (JST)
  const days = listMonthDays(today);
  const dailyMap = new Map<string, number>();
  for (const d of days) dailyMap.set(d, 0);
  for (const r of completedReservations) {
    // paidAt があれば JST 日付、なければ date フィールド
    const day = r.paidAt ? jstDate(r.paidAt) : r.date;
    if (dailyMap.has(day)) dailyMap.set(day, (dailyMap.get(day) ?? 0) + (r.paidAmount ?? r.menuPrice ?? 0) + (r.retailAmount ?? 0) + (r.tip ?? 0) + (r.designationFee ?? 0));
  }
  const dailyArr = days.map((d) => ({ date: d, value: dailyMap.get(d) ?? 0 }));
  const maxDaily = Math.max(...dailyArr.map((d) => d.value), 1);

  // 支払方法別
  const methodMap = new Map<string, { count: number; total: number }>();
  for (const r of completedReservations) {
    if (!r.paymentMethod) continue;
    const cur = methodMap.get(r.paymentMethod) ?? { count: 0, total: 0 };
    cur.count++;
    cur.total += (r.paidAmount ?? 0) + (r.retailAmount ?? 0) + (r.tip ?? 0) + (r.designationFee ?? 0);
    methodMap.set(r.paymentMethod, cur);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold" style={{ color: 'var(--gray-900)' }}>売上</h1>
        <p className="text-sm mt-1" style={{ color: 'var(--gray-500)' }}>
          {month.startStr.slice(0, 7).replace('-', '年')}月 (JST)
        </p>
      </div>

      {/* KPI カード */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KpiCard label="今月売上" value={yen(monthRevenue)} delta={delta} sub={`前月 ${yen(prevRevenue)}`} />
        <KpiCard label="施術件数" value={`${visitsCount}件`} sub={`平均 ${yen(avgTicket)}/件`} />
        <KpiCard label="店販売上" value={yen(retailRev)} sub={`構成比 ${monthRevenue > 0 ? Math.round((retailRev / monthRevenue) * 1000) / 10 : 0}%`} />
        <KpiCard label="本日" value={yen(dailyMap.get(todayStr) ?? 0)} sub={fmtJstShort(todayStr)} highlight />
      </div>

      {/* 日別売上チャート */}
      <div className="card-box">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="font-bold" style={{ color: 'var(--gray-900)' }}>日別売上</h2>
            <p className="text-xs mt-0.5" style={{ color: 'var(--gray-500)' }}>当月 1日 〜 本日まで全日表示</p>
          </div>
          <div className="flex items-center gap-3 text-[10px]" style={{ color: 'var(--gray-500)' }}>
            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-sm" style={{ background: 'var(--brand)' }} />通常日</span>
            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-sm" style={{ background: 'var(--brand-gold)' }} />本日</span>
          </div>
        </div>
        <div className="flex items-end gap-1 h-48">
          {dailyArr.map((d) => {
            const isToday = d.date === todayStr;
            const isFuture = d.date > todayStr;
            const h = d.value > 0 ? Math.max(2, (d.value / maxDaily) * 100) : 2;
            return (
              <div key={d.date} className="flex-1 flex flex-col items-center group relative">
                <div
                  className="w-full rounded-t transition-opacity"
                  style={{
                    height: `${h}%`,
                    background: isFuture ? 'var(--gray-100)' : isToday ? 'var(--brand-gold)' : 'var(--brand)',
                    opacity: d.value === 0 && !isFuture ? 0.3 : 1,
                  }}
                  title={`${d.date}: ${yen(d.value)}`}
                />
                {(d.date.endsWith('-01') || d.date.endsWith('-15') || isToday) && (
                  <div className="text-[9px] mt-1 tabular" style={{ color: isToday ? 'var(--brand)' : 'var(--gray-400)', fontWeight: isToday ? 700 : 400 }}>
                    {Number(d.date.slice(8, 10))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* 支払方法別 */}
      <div className="card-box">
        <h2 className="font-bold mb-4" style={{ color: 'var(--gray-900)' }}>支払い方法別</h2>
        {methodMap.size === 0 ? (
          <p className="text-sm py-6 text-center" style={{ color: 'var(--gray-500)' }}>
            支払い実績がまだありません
          </p>
        ) : (
          <div className="space-y-3">
            {Array.from(methodMap.entries())
              .sort((a, b) => b[1].total - a[1].total)
              .map(([method, info]) => {
                const meta = METHOD_LABELS[method] || { label: method, icon: MoreHorizontal };
                const Icon = meta.icon;
                const ratio = monthRevenue > 0 ? info.total / monthRevenue : 0;
                return (
                  <div key={method}>
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--gray-700)' }}>
                        <Icon className="w-4 h-4" />
                        <span>{meta.label}</span>
                        <span className="text-xs" style={{ color: 'var(--gray-400)' }}>({info.count}件)</span>
                      </div>
                      <span className="font-bold tabular" style={{ color: 'var(--gray-900)' }}>{yen(info.total)}</span>
                    </div>
                    <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--gray-100)' }}>
                      <div className="h-full rounded-full" style={{ width: `${ratio * 100}%`, background: 'var(--brand)' }} />
                    </div>
                  </div>
                );
              })}
          </div>
        )}
      </div>
    </div>
  );
}

function KpiCard({ label, value, delta, sub, highlight }: { label: string; value: string; delta?: number; sub?: string; highlight?: boolean }) {
  return (
    <div
      className="card-box"
      style={highlight ? { border: '1px solid var(--brand-gold)', background: 'var(--brand-gold-light)' } : {}}
    >
      <div className="text-[10px] tracking-[0.15em] uppercase mb-2" style={{ color: 'var(--gray-500)' }}>{label}</div>
      <div className="text-2xl font-bold tabular" style={{ color: 'var(--gray-900)' }}>{value}</div>
      {delta !== undefined && (
        <div
          className="inline-flex items-center gap-0.5 text-[10px] font-bold px-1.5 py-0.5 rounded-full mt-1.5"
          style={{
            background: delta >= 0 ? 'var(--color-success-bg)' : 'var(--color-danger-bg)',
            color: delta >= 0 ? 'var(--color-success)' : 'var(--color-danger)',
          }}
        >
          {delta >= 0 ? <TrendingUp className="w-2.5 h-2.5" /> : <TrendingDown className="w-2.5 h-2.5" />}
          {delta >= 0 ? '+' : ''}{(delta * 100).toFixed(1)}%
        </div>
      )}
      {sub && <div className="text-xs mt-1.5" style={{ color: 'var(--gray-500)' }}>{sub}</div>}
    </div>
  );
}
