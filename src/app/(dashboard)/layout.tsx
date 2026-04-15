import Sidebar from '@/components/shared/Sidebar';
import { getCurrentSalon } from '@/lib/salonData';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { salon, session } = await getCurrentSalon();
  return (
    <div className="flex min-h-screen bg-stone-50">
      <Sidebar userName={session.name} userRole={session.role} salonName={salon.name} plan={salon.plan} />
      <main className="flex-1 overflow-x-hidden">
        <div className="max-w-7xl mx-auto p-8">{children}</div>
      </main>
    </div>
  );
}
