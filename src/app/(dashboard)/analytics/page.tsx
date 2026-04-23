// 分析ページ (拡張版)
// ・コホート分析: 初回月ごとに 1 / 2 / 3 / 4 / 5 ヶ月後の継続率
// ・スタッフ別業績 (当月)
// ・メニュー別売上 (当月)
// ・HPB 転換ファネル
// ・CSV エクスポート導線

import { getCurrentSalon } from '@/lib/salonData';
import { prisma } from '@/lib/db';
import { getJstMonthBounds, jstDate } from '@/lib/jst';
import { yen, pct } from '@/lib/utils/format';
import Link from 'next/link';
import { Download, Users, Sparkles, Palette, TrendingUp } from 'lucide-react';

export default async function AnalyticsPage() {
  const { salon } = await getCurrentSalon();

  const [customers, reservations] = await Promise.all([
    prisma.customer.findMany({ where: { salonId: salon.id } }),
    prisma.reservation.findMany({
      where: { salonId: salon.id, status: 'completed' },
      include: { staff: true, menu: true },
    }),
  ]);

  const today = new Date();
  const m = getJstMonthBounds(today);
  const thisMonth = reservations.filter((r) => r.date >= m.startStr && r.date < m.endStr);
  const monthRev = thisMonth.reduce((s, r) => s + (r.paidAmount ?? r.menuPrice ?? 0) + (r.retailAmount ?? 0), 0);

  // HPB 転換ファネル
  const hpbCustomers = customers.filter((c) => c.source === 'hotpepper');
  const hpbLineLinked = hpbCustomers.filter((c) => c.isLineFriend).length;
  const hpbRevisited = hpbCustomers.filter((c) => c.visitCount >= 2).length;
  const hpbReservedNonHpb = hpbCustomers.filter((c) => {
    const rs = reservations.filter((r) => r.customerId === c.id);
    return rs.some((r) => r.source !== 'hotpepper');
  }).length;

  // コホート分析 (初回来店月 → N ヶ月後に再来店しているか)
  const cohortMap = new Map<string, { first: number; alive: number[] }>();
  for (const c of customers) {
    if (!c.firstVisitDate) continue;
    const month = c.firstVisitDate.slice(0, 7);
    if (!cohortMap.has(month)) cohortMap.set(month, { first: 0, alive: [0, 0, 0, 0, 0] });
    const bucket = cohortMap.get(month)!;
    bucket.first++;
    const custRes = reservations.filter((r) => r.customerId === c.id && r.date > c.firstVisitDate!);
    for (let n = 1; n <= 5; n++) {
      const start = addMonths(c.firstVisitDate, n - 1);
      const end = addMonths(c.firstVisitDate, n);
      if (custRes.some((r) => r.date >= start && r.date < end)) bucket.alive[n - 1]++;
    }
  }
  const cohorts = Array.from(cohortMap.entries())
    .filter(([, v]) => v.first >= 3)
    .sort((a, b) => b[0].localeCompare(a[0]))
    .slice(0, 6);

  // スタッフ別業績 (当月)
  const staffMap = new Map<string, { name: string; count: number; revenue: number }>();
  for (const r of thisMonth) {
    const key = r.staffId || 'none';
    const name = r.staff?.name || '(未指定)';
    if (!staffMap.has(key)) staffMap.set(key, { name, count: 0, revenue: 0 });
    const b = staffMap.get(key)!;
    b.count++;
    b.revenue += (r.paidAmount ?? r.menuPrice ?? 0) + (r.retailAmount ?? 0) + (r.designationFee ?? 0);
  }
  const staffStats = Array.from(staffMap.values()).sort((a, b) => b.revenue - a.revenue);

  // メニュー別売上 (当月)
  const menuMap = new Map<string, { name: string; count: number; revenue: number }>();
  for (const r of thisMonth) {
    const name = r.menuName || '(名称なし)';
    if (!menuMap.has(name)) menuMap.set(name, { name, count: 0, revenue: 0 });
    const b = menuMap.get(name)!;
    b.count++;
    b.revenue += r.paidAmount ?? r.menuPrice ?? 0;
  }
  const menuStats = Array.from(menuMap.values()).sort((a, b) => b.revenue - a.revenue).slice(0, 10);

  return (
    <div className="space-y-8">
      <div className="flex items-end justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--gray-900)' }}>分析</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--gray-500)' }}>
            {jstDate().slice(0, 7)} 月 · JST
          </p>
        </div>
        <div className="flex gap-2">
          <Link
            href="/api/export/customers"
            className="btn-ghost text-xs border inline-flex items-center gap-1 px-3 py-2"
            style={{ color: 'var(--gray-700)', borderColor: 'var(--gray-300)', background: 'white' }}
          >
            <Download className="w-3 h-3" /> 顧客CSV
          </Link>
          <Link
            href="/api/export/reservations"
            className="btn-ghost text-xs border inline-flex items-center gap-1 px-3 py-2"
            style={{ color: 'var(--gray-700)', borderColor: 'var(--gray-300)', background: 'white' }}
          >
            <Download className="w-3 h-3" /> 予約CSV (当月)
          </Link>
        </div>
      </div>

      <Section icon={<TrendingUp className="w-4 h-4" />} title="HPB→自社 転換ファネル" hint="ホットペッパー新規客が自社リピーターに育つまでの流れ">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Funnel label="HPB 新規" value={hpbCustomers.length} />
          <Funnel label="LINE 連携" value={hpbLineLinked} base={hpbCustomers.length} />
          <Funnel label="2回目以降来店" value={hpbRevisited} base={hpbCustomers.length} />
          <Funnel label="自社チャネル経由で再予約" value={hpbReservedNonHpb} base={hpbCustomers.length} highlight />
        </div>
      </Section>

      <Section icon={<Users className="w-4 h-4" />} title="コホート分析 (継続率)" hint="初回来店月の顧客が、N ヶ月後にご来店いただいている割合">
        {cohorts.length === 0 ? (
          <p className="text-sm py-6 text-center" style={{ color: 'var(--gray-500)' }}>まだ分析するに足りる顧客データがありません</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr style={{ borderBottom: '1px solid var(--gray-200)' }}>
                  <th className="text-left py-2 px-2" style={{ color: 'var(--gray-500)' }}>初回月</th>
                  <th className="text-right py-2 px-2" style={{ color: 'var(--gray-500)' }}>初回人数</th>
                  {[1, 2, 3, 4, 5].map((n) => (
                    <th key={n} className="text-right py-2 px-2" style={{ color: 'var(--gray-500)' }}>+{n}ヶ月</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {cohorts.map(([month, data]) => (
                  <tr key={month} style={{ borderBottom: '1px solid var(--gray-100)' }}>
                    <td className="py-2 px-2 font-medium tabular">{month}</td>
                    <td className="py-2 px-2 text-right tabular">{data.first}</td>
                    {data.alive.map((cnt, i) => {
                      const r = data.first > 0 ? cnt / data.first : 0;
                      return (
                        <td
                          key={i}
                          className="py-2 px-2 text-right tabular"
                          style={{
                            color: r >= 0.5 ? 'var(--color-success)' : r >= 0.2 ? 'var(--color-warn)' : 'var(--gray-500)',
                            background: `rgba(99,63,90,${Math.min(r, 0.8) * 0.18})`,
                            fontWeight: r > 0 ? 600 : 400,
                          }}
                        >
                          {cnt > 0 ? `${pct(r)} (${cnt})` : '—'}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Section>

      <Section icon={<Sparkles className="w-4 h-4" />} title="スタッフ別業績" hint={`${jstDate().slice(0, 7)} 月 · 合計 ${yen(monthRev)}`}>
        {staffStats.length === 0 ? (
          <p className="text-sm py-6 text-center" style={{ color: 'var(--gray-500)' }}>当月の施術データがありません</p>
        ) : (
          <div className="space-y-3">
            {staffStats.map((s, i) => (
              <Row key={i} name={s.name} count={s.count} revenue={s.revenue} maxRevenue={staffStats[0].revenue} />
            ))}
          </div>
        )}
      </Section>

      <Section icon={<Palette className="w-4 h-4" />} title="メニュー別売上 (上位10)" hint={`${jstDate().slice(0, 7)} 月`}>
        {menuStats.length === 0 ? (
          <p className="text-sm py-6 text-center" style={{ color: 'var(--gray-500)' }}>当月の施術データがありません</p>
        ) : (
          <div className="space-y-3">
            {menuStats.map((m, i) => (
              <Row key={i} name={m.name} count={m.count} revenue={m.revenue} maxRevenue={menuStats[0].revenue} />
            ))}
          </div>
        )}
      </Section>
    </div>
  );
}

function Section({ icon, title, hint, children }: { icon: React.ReactNode; title: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="card-box">
      <div className="flex items-baseline gap-2 mb-5 flex-wrap">
        <span style={{ color: 'var(--brand)' }}>{icon}</span>
        <h2 className="font-bold" style={{ color: 'var(--gray-900)' }}>{title}</h2>
        {hint && <span className="text-xs ml-auto" style={{ color: 'var(--gray-500)' }}>{hint}</span>}
      </div>
      {children}
    </div>
  );
}

function Funnel({ label, value, base, highlight }: { label: string; value: number; base?: number; highlight?: boolean }) {
  const ratio = base && base > 0 ? value / base : null;
  return (
    <div
      className="p-4"
      style={{
        background: highlight ? 'var(--brand-warm)' : 'var(--gray-50)',
        border: `1px solid ${highlight ? 'var(--brand)' : 'var(--gray-200)'}`,
        borderRadius: 'var(--r-md)',
      }}
    >
      <div className="text-[10px] tracking-wider uppercase mb-2" style={{ color: 'var(--gray-500)' }}>{label}</div>
      <div className="text-2xl font-bold tabular" style={{ color: highlight ? 'var(--brand)' : 'var(--gray-900)' }}>
        {value}<span className="text-xs ml-1 font-normal" style={{ color: 'var(--gray-500)' }}>名</span>
      </div>
      {ratio !== null && (
        <div className="text-[10px] mt-1 tabular" style={{ color: 'var(--gray-500)' }}>
          転換率 {pct(ratio)}
        </div>
      )}
    </div>
  );
}

function Row({ name, count, revenue, maxRevenue }: { name: string; count: number; revenue: number; maxRevenue: number }) {
  const ratio = maxRevenue > 0 ? revenue / maxRevenue : 0;
  return (
    <div>
      <div className="flex items-baseline justify-between text-sm mb-1.5">
        <span style={{ color: 'var(--gray-800)' }}>
          {name}
          <span className="text-xs ml-2" style={{ color: 'var(--gray-400)' }}>({count}件)</span>
        </span>
        <span className="font-bold tabular" style={{ color: 'var(--gray-900)' }}>{yen(revenue)}</span>
      </div>
      <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--gray-100)' }}>
        <div className="h-full rounded-full transition-all" style={{ width: `${ratio * 100}%`, background: 'var(--brand)' }} />
      </div>
    </div>
  );
}

function addMonths(ymd: string, n: number): string {
  const d = new Date(`${ymd}T00:00:00+09:00`);
  d.setMonth(d.getMonth() + n);
  return d.toISOString().slice(0, 10);
}
