// 現在ログイン中のユーザーの店舗データを取得
import { prisma } from './db';
import { getSession } from './auth';
import { redirect } from 'next/navigation';

export async function getCurrentSalon() {
  const session = await getSession();
  if (!session) redirect('/login');
  if (session.role === 'superadmin') redirect('/superadmin');
  if (!session.salonId) redirect('/login');

  const salon = await prisma.salon.findUnique({
    where: { id: session.salonId },
  });
  if (!salon) redirect('/login');
  return { salon, session };
}

export async function getSalonData() {
  const { salon, session } = await getCurrentSalon();

  const [staff, customers, menus, reservations, treatments, coupons, messages, designs] = await Promise.all([
    prisma.staff.findMany({ where: { salonId: salon.id }, orderBy: { sortOrder: 'asc' } }),
    prisma.customer.findMany({ where: { salonId: salon.id }, orderBy: { totalSpent: 'desc' } }),
    prisma.menu.findMany({ where: { salonId: salon.id }, orderBy: { sortOrder: 'asc' } }),
    prisma.reservation.findMany({ where: { salonId: salon.id } }),
    prisma.treatmentRecord.findMany({ where: { salonId: salon.id }, orderBy: { date: 'desc' } }),
    prisma.coupon.findMany({ where: { salonId: salon.id }, orderBy: { createdAt: 'desc' } }),
    prisma.message.findMany({ where: { salonId: salon.id }, orderBy: { createdAt: 'desc' } }),
    prisma.nailDesign.findMany({ where: { salonId: salon.id }, orderBy: { createdAt: 'desc' } }),
  ]);

  return { salon, session, staff, customers, menus, reservations, treatments, coupons, messages, designs };
}

export type SalonData = Awaited<ReturnType<typeof getSalonData>>;

// パブリック予約ページ用（認証なし、slug で店舗取得）
export async function getPublicSalonBySlug(slug: string) {
  const salon = await prisma.salon.findUnique({
    where: { slug },
    include: {
      menus: { where: { isActive: true }, orderBy: { sortOrder: 'asc' } },
      coupons: { where: { isActive: true } },
      designs: { where: { isPublished: true }, orderBy: { createdAt: 'desc' }, take: 12 },
      staff: { where: { isActive: true } },
    },
  });
  if (!salon || salon.status !== 'active') return null;
  return salon;
}

// KPI計算（DB版）
export async function computeSalonKpis(salonId: string) {
  const [customers, reservations] = await Promise.all([
    prisma.customer.findMany({ where: { salonId } }),
    prisma.reservation.findMany({ where: { salonId } }),
  ]);

  const today = new Date();
  const thirtyDaysAgo = new Date(today);
  thirtyDaysAgo.setDate(today.getDate() - 30);
  const sixtyDaysAgo = new Date(today);
  sixtyDaysAgo.setDate(today.getDate() - 60);

  const completedThis = reservations.filter(
    r => r.status === 'completed' && new Date(r.date) >= thirtyDaysAgo
  );
  const completedPrev = reservations.filter(
    r => r.status === 'completed' && new Date(r.date) >= sixtyDaysAgo && new Date(r.date) < thirtyDaysAgo
  );

  const revenueThis = completedThis.reduce((s, r) => s + (r.menuPrice || 0), 0);
  const revenuePrev = completedPrev.reduce((s, r) => s + (r.menuPrice || 0), 0);

  const totalCustomers = customers.length;
  const lineCustomers = customers.filter(c => c.isLineFriend).length;
  const hpbCustomers = customers.filter(c => c.source === 'hotpepper').length;

  const hpbMigrated = customers.filter(c => {
    if (c.source !== 'hotpepper' || c.visitCount < 2) return false;
    const rs = reservations.filter(r => r.customerId === c.id && r.status === 'completed');
    return rs.slice(1).some(r => r.source === 'line' || r.source === 'web');
  }).length;

  const repeatRate = totalCustomers > 0 ? customers.filter(c => c.visitCount >= 2).length / totalCustomers : 0;

  const dormantRisk = customers.filter(c => {
    if (!c.lastVisitDate) return false;
    const days = Math.floor((today.getTime() - new Date(c.lastVisitDate).getTime()) / 86400000);
    return days >= 90 && c.isLineFriend && c.visitCount >= 1;
  }).length;

  const todayStr = today.toISOString().slice(0, 10);
  const upcomingRes = reservations.filter(
    r => (r.status === 'confirmed' || r.status === 'pending') && r.date >= todayStr
  ).length;

  const sourceRevenue: Record<string, number> = {};
  reservations.filter(r => r.status === 'completed').forEach(r => {
    sourceRevenue[r.source] = (sourceRevenue[r.source] || 0) + (r.menuPrice || 0);
  });

  const daily: { date: string; revenue: number }[] = [];
  for (let i = 29; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const ds = d.toISOString().slice(0, 10);
    const rev = reservations.filter(r => r.date === ds && r.status === 'completed').reduce((s, r) => s + (r.menuPrice || 0), 0);
    daily.push({ date: ds.slice(5), revenue: rev });
  }

  return {
    revenueThis,
    revenuePrev,
    revenueDelta: revenuePrev > 0 ? (revenueThis - revenuePrev) / revenuePrev : 0,
    totalCustomers,
    lineCustomers,
    lineRate: totalCustomers > 0 ? lineCustomers / totalCustomers : 0,
    hpbCustomers,
    hpbMigrationRate: hpbCustomers > 0 ? hpbMigrated / hpbCustomers : 0,
    repeatRate,
    dormantRisk,
    upcomingRes,
    sourceRevenue,
    daily,
    completedCount: completedThis.length,
  };
}
