import { prisma } from '@/lib/db';
import { requireRole } from '@/lib/auth';
import { yen, fmtDate } from '@/lib/utils/format';
import { Sparkles, Building2, Users, TrendingUp } from 'lucide-react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import SuperAdminClient from './SuperAdminClient';

export default async function SuperAdminPage() {
  try {
    await requireRole(['superadmin']);
  } catch {
    redirect('/login');
  }

  const salons = await prisma.salon.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      _count: {
        select: { customers: true, reservations: true, users: true },
      },
    },
  });

  const totalSalons = salons.length;
  const activeSalons = salons.filter(s => s.status === 'active').length;
  const pendingSalons = salons.filter(s => s.status === 'pending_payment').length;
  const mrr = salons
    .filter(s => s.status === 'active')
    .reduce((sum, s) => sum + (s.plan === 'standard' ? 7980 : s.plan === 'light' ? 3980 : 0), 0);

  return (
    <div className="min-h-screen bg-stone-50">
      <header className="bg-white border-b border-stone-200 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-lg brand-bg flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="font-bold text-stone-900">SalonLink SuperAdmin</div>
              <div className="text-[10px] text-stone-500">SaaS運営管理画面</div>
            </div>
          </div>
          <form action="/api/auth/logout" method="POST">
            <button type="submit" className="btn-ghost text-sm">ログアウト</button>
          </form>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-stone-900">全店舗管理</h1>
          <SuperAdminClient />
        </div>

        {/* KPI */}
        <div className="grid grid-cols-4 gap-4">
          <KpiCard icon={<Building2 />} label="総店舗数" value={`${totalSalons}`} />
          <KpiCard icon={<TrendingUp />} label="稼働店舗" value={`${activeSalons}`} sub={`待機 ${pendingSalons}`} />
          <KpiCard icon={<Users />} label="MRR" value={yen(mrr)} sub="月間定期収益" highlight />
          <KpiCard icon={<TrendingUp />} label="ARR試算" value={yen(mrr * 12)} />
        </div>

        {/* 店舗一覧 */}
        <div className="card-box">
          <h2 className="font-semibold text-stone-900 mb-4">店舗一覧</h2>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-stone-500 border-b border-stone-200">
                <th className="py-2">店舗名</th>
                <th className="py-2">オーナー</th>
                <th className="py-2">プラン</th>
                <th className="py-2">ステータス</th>
                <th className="py-2 text-right">顧客数</th>
                <th className="py-2 text-right">予約数</th>
                <th className="py-2">登録日</th>
              </tr>
            </thead>
            <tbody>
              {salons.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-stone-500">まだ登録された店舗はありません</td>
                </tr>
              ) : (
                salons.map(s => (
                  <tr key={s.id} className="border-b border-stone-100">
                    <td className="py-3 font-medium">{s.name}</td>
                    <td className="py-3 text-stone-600">{s.ownerEmail}</td>
                    <td className="py-3">
                      <span className="badge badge-brand">{s.plan}</span>
                    </td>
                    <td className="py-3">
                      <span className={`badge ${s.status === 'active' ? 'badge-green' : s.status === 'pending_payment' ? 'badge-yellow' : 'badge-red'}`}>
                        {s.status === 'active' ? '稼働中' : s.status === 'pending_payment' ? '決済待ち' : '停止'}
                      </span>
                    </td>
                    <td className="py-3 text-right">{s._count.customers}</td>
                    <td className="py-3 text-right">{s._count.reservations}</td>
                    <td className="py-3 text-stone-500 text-xs">{fmtDate(s.createdAt)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}

function KpiCard({ icon, label, value, sub, highlight }: { icon: React.ReactNode; label: string; value: string; sub?: string; highlight?: boolean }) {
  return (
    <div className={`card-box ${highlight ? 'border-2 brand-border' : ''}`}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs text-stone-500 font-medium">{label}</span>
        <span className="text-stone-400">{icon}</span>
      </div>
      <div className="text-2xl font-bold text-stone-900">{value}</div>
      {sub && <div className="text-xs text-stone-500 mt-1">{sub}</div>}
    </div>
  );
}
