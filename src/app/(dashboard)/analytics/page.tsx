import { getCurrentSalon, computeSalonKpis } from '@/lib/salonData';
import { prisma } from '@/lib/db';
import { yen, pct, sourceLabel } from '@/lib/utils/format';

export default async function AnalyticsPage() {
  const { salon } = await getCurrentSalon();
  const kpi = await computeSalonKpis(salon.id);
  const customers = await prisma.customer.findMany({ where: { salonId: salon.id } });

  const segments = ['hpb_new_repeat', 'hpb_new_churn', 'hpb_new_dormant', 'own_repeater', 'line_heavy', 'coupon_reactive', 'vip'];
  const segmentStats = segments.map(seg => {
    const custs = customers.filter(c => c.tags.includes(seg));
    const ltv = custs.reduce((sum, c) => sum + c.totalSpent, 0);
    const avgLtv = custs.length > 0 ? Math.floor(ltv / custs.length) : 0;
    const avgVisits = custs.length > 0 ? custs.reduce((s, c) => s + c.visitCount, 0) / custs.length : 0;
    return { seg, count: custs.length, ltv, avgLtv, avgVisits };
  }).filter(s => s.count > 0);

  const segLabel: Record<string, string> = {
    hpb_new_repeat: 'HPB→定着',
    hpb_new_churn: 'HPB→離脱',
    hpb_new_dormant: 'HPB→休眠',
    own_repeater: '自社リピ',
    line_heavy: 'LINEヘビー',
    coupon_reactive: 'クーポン反応',
    vip: 'VIP',
  };

  const maxRevenue = Math.max(...kpi.daily.map(d => d.revenue), 1);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-stone-900">分析</h1>
        <p className="text-sm text-stone-500 mt-1">SalonLink独自指標でマーケティングを最適化</p>
      </div>

      <div className="card-box border-2 brand-border">
        <div className="flex items-start gap-3 mb-4">
          <div className="w-10 h-10 rounded-lg brand-bg flex items-center justify-center text-white font-bold">HPB</div>
          <div className="flex-1">
            <h2 className="font-bold text-stone-900">ホットペッパー→自社移行率</h2>
            <p className="text-xs text-stone-500 mt-0.5">他社SaaSにはないSalonLink独自の重要指標</p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold brand-text">{pct(kpi.hpbMigrationRate)}</div>
            <div className="text-xs text-stone-500">HPB流入 {kpi.hpbCustomers}名中</div>
          </div>
        </div>
        <div className="grid grid-cols-4 gap-3 mt-4">
          <MetricBox label="HPB新規来店数" value={`${kpi.hpbCustomers}名`} />
          <MetricBox label="LINE登録率" value={pct(kpi.lineRate)} />
          <MetricBox label="リピート率" value={pct(kpi.repeatRate)} />
          <MetricBox label="離反リスク" value={`${kpi.dormantRisk}名`} />
        </div>
      </div>

      <div className="card-box">
        <h2 className="font-semibold text-stone-900 mb-4">日別売上（直近30日）</h2>
        <div className="flex items-end gap-1 h-48">
          {kpi.daily.map((d, i) => (
            <div key={i} className="flex-1 flex flex-col items-center">
              <div
                className="w-full brand-bg rounded-t transition-all hover:opacity-80"
                style={{ height: `${(d.revenue / maxRevenue) * 100}%` }}
                title={`${d.date}: ${yen(d.revenue)}`}
              />
              {i % 5 === 0 && <div className="text-[9px] text-stone-400 mt-1">{d.date}</div>}
            </div>
          ))}
        </div>
      </div>

      {segmentStats.length > 0 && (
        <div className="card-box">
          <h2 className="font-semibold text-stone-900 mb-4">顧客セグメント別 LTV分析</h2>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-stone-500 border-b border-stone-200">
                <th className="py-2">セグメント</th>
                <th className="py-2 text-right">人数</th>
                <th className="py-2 text-right">平均来店回数</th>
                <th className="py-2 text-right">平均LTV</th>
                <th className="py-2 text-right">合計売上</th>
              </tr>
            </thead>
            <tbody>
              {segmentStats.map(s => (
                <tr key={s.seg} className="border-b border-stone-100">
                  <td className="py-3"><span className="badge badge-brand">{segLabel[s.seg]}</span></td>
                  <td className="py-3 text-right font-medium">{s.count}名</td>
                  <td className="py-3 text-right">{s.avgVisits.toFixed(1)}回</td>
                  <td className="py-3 text-right font-semibold">{yen(s.avgLtv)}</td>
                  <td className="py-3 text-right">{yen(s.ltv)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="card-box">
        <h2 className="font-semibold text-stone-900 mb-4">流入元別売上</h2>
        <div className="space-y-3">
          {Object.entries(kpi.sourceRevenue).sort((a, b) => b[1] - a[1]).map(([src, amt]) => {
            const total = Object.values(kpi.sourceRevenue).reduce((a, b) => a + b, 0);
            const ratio = total > 0 ? amt / total : 0;
            return (
              <div key={src}>
                <div className="flex justify-between text-sm mb-1">
                  <span>{sourceLabel(src)}</span>
                  <span className="font-medium">{yen(amt)} ({pct(ratio)})</span>
                </div>
                <div className="h-2 bg-stone-100 rounded-full overflow-hidden">
                  <div className="h-full brand-bg" style={{ width: `${ratio * 100}%` }} />
                </div>
              </div>
            );
          })}
          {Object.keys(kpi.sourceRevenue).length === 0 && (
            <p className="text-sm text-stone-500 py-4 text-center">データがありません</p>
          )}
        </div>
      </div>
    </div>
  );
}

function MetricBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-stone-50 rounded-lg p-3">
      <div className="text-xs text-stone-500">{label}</div>
      <div className="text-lg font-bold text-stone-900 mt-1">{value}</div>
    </div>
  );
}
