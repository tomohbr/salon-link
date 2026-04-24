import Sidebar from '@/components/shared/Sidebar';
import BottomTabBar from '@/components/shared/BottomTabBar';
import CommandPalette from '@/components/shared/CommandPalette';
import { getCurrentSalon } from '@/lib/salonData';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { salon, session } = await getCurrentSalon();
  return (
    <div className="flex min-h-screen" style={{ background: 'var(--gray-50)' }}>
      {/* Skip link (Tab で最初に現れる) */}
      <a href="#main-content" className="sr-only sr-only-focusable">メインコンテンツへスキップ</a>

      <Sidebar userName={session.name} userRole={session.role} salonName={salon.name} plan={salon.plan} />
      <main id="main-content" role="main" className="flex-1 overflow-x-hidden pb-16 md:pb-0">
        <div className="max-w-7xl mx-auto p-4 md:p-8">{children}</div>
      </main>
      <BottomTabBar />
      <CommandPalette />
    </div>
  );
}
