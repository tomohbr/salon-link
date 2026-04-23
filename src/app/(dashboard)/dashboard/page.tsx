// ダッシュボード - KPI sparkline + JST 基準
import { getCurrentSalon } from '@/lib/salonData';
import { prisma } from '@/lib/db';
import { getJstMonthBounds, jstDate, listMonthDays } from '@/lib/jst';
import { yen, pct, sourceLabel } from '@/lib/utils/format';
import { TrendingUp, TrendingDown, Users, Calendar, AlertTriangle, MessageCircle } from 'lucide-react';

export default async function DashboardPage() {
  const { salon } = await getCurrentSalon();
  const today = new Date();
  const todayStr = jstDate(today);
  const m = getJstMonthBounds(today);
  const prev = getJstMonthBounds(new Date(m.start.getTime() - 24 * 60 * 60 * 1000));

  const [completedThis, completedPrev, customers, upcomingRes] = await Promise.all([
    prisma.reservation.findMany({
      where: {
        salonId: salon.id,
        OR: [
          { status: 'completed', date: { gte: m.startStr, lt: m.endStr } },
          { paidAt: { gte: m.start, lt: m.end } },
        ],
      },
    }),
    prisma.reservation.findMany({
      where: {
        salonId: salon.id,
        OR: [
          { status: 'completed', date: { gte: prev.startStr, lt: prev.endStr } },
          { paidAt: { gte: prev.start, lt: prev.end } },
        ],
      },
    }),
    prisma.customer.findMany({ where: { salonId: salon.id } }),
    prisma.reservation.findMany({
      where: { salonId: salon.id, status: { in: ['confirmed', 'pending'] }, date: { gte: todayStr } },
      orderBy: [{ date: 'asc' }, { startTime: 'asc' }],
      take: 6,
      include: { customer: true },
    }),
  ]);

  const sumOf = (rs: typeof completedThis) =>
    rs.reduce((s, r) => s + (r.paidAmount ?? r.menuPrice ?? 0) + (r.retailAmount ?? 0) + (r.tip ?? 0), 0);

  const revenueThis = sumOf(completedThis);
  const revenuePrev = sumOf(completedPrev);
  const delta = revenuePrev > 0 ? (revenueThis - revenuePrev) / revenuePrev : 0;

  // 当月日別 (sparkline 用)
  const days = listMonthDays(today);
  const dailyMap = new Map<string, number>(days.map((d) => [d, 0]));
  for (const r of completedThis) {
    const day = r.paidAt ? jstDate(r.paidAt) : r.date;
    if (dailyMap.has(day)) {
      dailyMap.set(day, (dailyMap.get(day) ?? 0) + (r.paidAmount ?? r.menuPrice ?? 0));
    }
  }
  const sparkline = Array.from(dailyMap.values());

  const totalCustomers = customers.length;
  const lineCustomers = customers.filter((c) => c.isLineFriend).length;
  const lineRate = totalCustomers > 0 ? lineCustomers / totalCustomers : 0;
  const hpbCustomers = customers.filter((c) => c.source === 'hotpepper').length;
  const repeaters = customers.filter((c) => c.visitCount >= 2).length;
  const repeatRate = totalCustomers > 0 ? repeaters / totalCustomers : 0;
  const dormant = customers.filter((c) => {
    if (!c.lastVisitDate || !c.isLineFriend || c.visitCount < 1) return false;
    const days = Math.floor((today.getTime() - new Date(c.lastVisitDate).getTime()) / 86400000);
    return days >= 28; // ネイル: 28日基準
  }).length;

  // HPB→自社移行
  const hpbMigrated = customers.filter((c) => {
    if (c.source !== 'hotpepper' || c.visitCount < 2) return false;
    return true;
  }).length;
  const hpbMigrationRate = hpbCustomers > 0 ? hpbMigrated / hpbCustomers : 0;

  return (
    <div className="space-y-6">
      <div className="flex items-baseline justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight" style={{ color: 'var(--gray-900)' }}>ダッシュボード</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--gray-500)' }}>{salon.name}</p>
        </div>
        <div className="text-xs" style={{ color: 'var(--gray-500)' }}>
          {new Date().toLocaleDateString('ja-JP')} (JST)
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KpiCard
          label="今月売上"
          value={yen(revenueThis)}
          delta={delta}
          sub={`施術 ${completedThis.length}件`}
          sparkline={sparkline}
        />
        <KpiCard label="顧客数" value={`${totalCustomers}名`} sub={`LINE登録 ${lineCustomers}名 (${pct(lineRate)})`} />
        <KpiCard label="HPB→自社" value={pct(hpbMigrationRate)} sub={`HPB流入 ${hpbCustomers}名中`} highlight />
        <KpiCard label="リピート率" value={pct(repeatRate)} sub={`予約残 ${upcomingRes.length}件`} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="card-box">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="w-4 h-4" style={{ color: '#d97706' }} />
            <h3 className="font-bold" style={{ color: 'var(--gray-900)' }}>離反リスクアラート</h3>
          </div>
          <p className="text-sm mb-3" style={{ color: 'var(--gray-700)' }}>
            最終来店から28日以上経過の LINE 友だちが <span className="font-bold tabular" style={{ color: 'var(--brand)' }}>{dormant}名</span> います
          </p>
          <p className="text-xs" style={{ color: 'var(--gray-500)' }}>
            ネイルは 4 週サイクルが標準です。少し早めの一言が、戻ってこられる理由になります。
          </p>
        </div>
        <div className="card-box">
          <div className="flex items-center gap-2 mb-3">
            <MessageCircle className="w-4 h-4" style={{ color: '#16a34a' }} />
            <h3 className="font-bold" style={{ color: 'var(--gray-900)' }}>配信のおすすめ</h3>
          </div>
          <p className="text-sm mb-3" style={{ color: 'var(--gray-700)' }}>VIP・リピーター層への新作デザイン案内が効果的です</p>
          <p className="text-xs" style={{ color: 'var(--gray-500)' }}>送りすぎないこと。月に1〜2回が、ちょうどいい距離感です。</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card-box md:col-span-2">
          <h3 className="font-bold mb-4" style={{ color: 'var(--gray-900)' }}>当月の施術リズム</h3>
          <Sparkline data={sparkline} />
          <div className="flex items-baseline justify-between mt-4 text-xs" style={{ color: 'var(--gray-500)' }}>
            <span>1日</span>
            <span>15日</span>
            <span>{m.endStr.slice(8) === '01' ? new Date(m.end.getTime() - 1).getDate() : '末日'}</span>
          </div>
        </div>
        <div className="card-box">
          <h3 className="font-bold mb-4" style={{ color: 'var(--gray-900)' }}>今後の予約</h3>
          <div className="space-y-2">
            {upcomingRes.length === 0 ? (
              <p className="text-sm py-4 text-center" style={{ color: 'var(--gray-500)' }}>予約はありません</p>
            ) : (
              upcomingRes.map((r) => (
                <div key={r.id} className="flex items-center gap-3 py-2" style={{ borderBottom: '1px solid var(--gray-100)' }}>
                  <div className="text-xs tabular w-14" style={{ color: 'var(--gray-500)' }}>{r.date.slice(5)}</div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate" style={{ color: 'var(--gray-900)' }}>{r.customer?.name || '—'}</div>
                    <div className="text-xs truncate" style={{ color: 'var(--gray-500)' }}>{r.menuName}</div>
                  </div>
                  <span className="badge" style={{ background: r.source === 'line' ? '#dcfce7' : 'var(--gray-100)', color: r.source === 'line' ? '#166534' : 'var(--gray-600)' }}>
                    {sourceLabel(r.source)}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function KpiCard({ label, value, delta, sub, sparkline, highlight }: { label: string; value: string; delta?: number; sub?: string; sparkline?: number[]; highlight?: boolean }) {
  return (
    <div
      className="card-box"
      style={highlight ? { border: '1px solid var(--brand)', background: 'var(--brand-warm)' } : {}}
    >
      <div className="text-[10px] tracking-[0.15em] uppercase mb-2" style={{ color: 'var(--gray-500)' }}>{label}</div>
      <div className="text-2xl font-bold tabular" style={{ color: highlight ? 'var(--brand)' : 'var(--gray-900)' }}>{value}</div>
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
      {sparkline && sparkline.length > 0 && (
        <div className="flex items-end gap-0.5 h-8 mt-3">
          {sparkline.map((v, i) => {
            const max = Math.max(...sparkline, 1);
            const h = v > 0 ? Math.max(4, (v / max) * 100) : 4;
            return (
              <div
                key={i}
                className="flex-1 rounded-sm"
                style={{ height: `${h}%`, background: v > 0 ? (highlight ? 'var(--brand)' : 'var(--brand)') : 'var(--gray-200)', opacity: v > 0 ? 1 : 0.5 }}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}

function Sparkline({ data }: { data: number[] }) {
  const max = Math.max(...data, 1);
  return (
    <div className="flex items-end gap-1 h-32">
      {data.map((v, i) => (
        <div
          key={i}
          className="flex-1 rounded-t transition-opacity"
          style={{
            height: v > 0 ? `${Math.max(4, (v / max) * 100)}%` : '4%',
            background: 'var(--brand)',
            opacity: v > 0 ? 1 : 0.15,
          }}
        />
      ))}
    </div>
  );
}
