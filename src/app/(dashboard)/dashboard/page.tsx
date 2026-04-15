import { getCurrentSalon, computeSalonKpis } from '@/lib/salonData';
import { prisma } from '@/lib/db';
import { yen, pct, sourceLabel } from '@/lib/utils/format';
import { TrendingUp, TrendingDown, Users, Calendar, AlertTriangle, MessageCircle } from 'lucide-react';

export default async function DashboardPage() {
  const { salon } = await getCurrentSalon();
  const kpi = await computeSalonKpis(salon.id);
  const todayStr = new Date().toISOString().slice(0, 10);

  const upcomingRes = await prisma.reservation.findMany({
    where: {
      salonId: salon.id,
      status: { in: ['confirmed', 'pending'] },
      date: { gte: todayStr },
    },
    orderBy: [{ date: 'asc' }, { startTime: 'asc' }],
    take: 6,
    include: { customer: true },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-baseline justify-between">
        <div>
          <h1 className="text-2xl font-bold text-stone-900">ダッシュボード</h1>
          <p className="text-sm text-stone-500 mt-1">{salon.name}</p>
        </div>
        <div className="text-xs text-stone-500">本日 {new Date().toLocaleDateString('ja-JP')}</div>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <KpiCard label="今月の売上" value={yen(kpi.revenueThis)} delta={kpi.revenueDelta} sub={`施術 ${kpi.completedCount}件`} icon={<TrendingUp className="w-5 h-5" />} />
        <KpiCard label="顧客数" value={`${kpi.totalCustomers}名`} sub={`LINE登録 ${kpi.lineCustomers}名 (${pct(kpi.lineRate)})`} icon={<Users className="w-5 h-5" />} />
        <KpiCard label="HPB→自社移行率" value={pct(kpi.hpbMigrationRate)} sub={`HPB流入 ${kpi.hpbCustomers}名中`} icon={<TrendingUp className="w-5 h-5" />} highlight />
        <KpiCard label="リピート率" value={pct(kpi.repeatRate)} sub={`予約残 ${kpi.upcomingRes}件`} icon={<Calendar className="w-5 h-5" />} />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="card-box">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="w-4 h-4 text-amber-500" />
            <h3 className="font-semibold text-stone-900">離反リスクアラート</h3>
          </div>
          <p className="text-sm text-stone-600 mb-3">
            90日以上ご来店のない顧客が <span className="brand-text font-bold">{kpi.dormantRisk}名</span> います
          </p>
          <div className="text-xs text-stone-500">💡 休眠復帰クーポンの配信で呼び戻しを検討しましょう</div>
        </div>
        <div className="card-box">
          <div className="flex items-center gap-2 mb-3">
            <MessageCircle className="w-4 h-4 text-emerald-500" />
            <h3 className="font-semibold text-stone-900">LINE配信おすすめ</h3>
          </div>
          <p className="text-sm text-stone-600 mb-3">反応の良いVIP・リピーター層への個別配信がおすすめです</p>
          <div className="text-xs text-stone-500">AI分析による推奨タイミング</div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="card-box col-span-2">
          <h3 className="font-semibold text-stone-900 mb-4">流入元別 売上構成</h3>
          <div className="space-y-3">
            {Object.entries(kpi.sourceRevenue).sort((a, b) => b[1] - a[1]).map(([src, amount]) => {
              const total = Object.values(kpi.sourceRevenue).reduce((a, b) => a + b, 0);
              const ratio = total > 0 ? amount / total : 0;
              return (
                <div key={src}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-stone-700">{sourceLabel(src)}</span>
                    <span className="font-medium">{yen(amount)} ({pct(ratio)})</span>
                  </div>
                  <div className="h-2 bg-stone-100 rounded-full overflow-hidden">
                    <div className="h-full brand-bg rounded-full transition-all" style={{ width: `${ratio * 100}%` }} />
                  </div>
                </div>
              );
            })}
            {Object.keys(kpi.sourceRevenue).length === 0 && (
              <p className="text-sm text-stone-500 py-4 text-center">データがありません</p>
            )}
          </div>
        </div>
        <div className="card-box">
          <h3 className="font-semibold text-stone-900 mb-4">今後の予約</h3>
          <div className="space-y-2">
            {upcomingRes.length === 0 ? (
              <p className="text-sm text-stone-500 py-4 text-center">予約はありません</p>
            ) : (
              upcomingRes.map((r) => (
                <div key={r.id} className="flex items-center gap-3 py-2 border-b border-stone-100 last:border-0">
                  <div className="text-xs font-mono text-stone-500 w-14">{r.date.slice(5)}</div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate">{r.customer?.name || '—'}</div>
                    <div className="text-xs text-stone-500 truncate">{r.menuName}</div>
                  </div>
                  <span className={`badge ${r.source === 'line' ? 'badge-green' : 'badge-gray'}`}>{sourceLabel(r.source)}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function KpiCard({ label, value, delta, sub, icon, highlight }: { label: string; value: string; delta?: number; sub?: string; icon?: React.ReactNode; highlight?: boolean }) {
  return (
    <div className={`card-box ${highlight ? 'brand-border border-2' : ''}`}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs text-stone-500 font-medium">{label}</span>
        <span className="text-stone-400">{icon}</span>
      </div>
      <div className="text-2xl font-bold text-stone-900">{value}</div>
      {delta !== undefined && (
        <div className={`text-xs mt-1 flex items-center gap-1 ${delta >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
          {delta >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
          前月比 {delta >= 0 ? '+' : ''}{(delta * 100).toFixed(1)}%
        </div>
      )}
      {sub && <div className="text-xs text-stone-500 mt-1">{sub}</div>}
    </div>
  );
}
