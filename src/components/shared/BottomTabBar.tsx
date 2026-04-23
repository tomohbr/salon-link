'use client';
// iOS ネイティブ風のボトムタブバー (mobile only)
// 「ホーム / 予約 / 顧客 / 売上 / 設定」の 5 本
// safe-area-inset-bottom で iPhone のホームバー回避

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, CalendarDays, Users, TrendingUp, Settings } from 'lucide-react';

const TABS = [
  { href: '/dashboard', label: 'ホーム', icon: Home },
  { href: '/reservations', label: '予約', icon: CalendarDays },
  { href: '/customers', label: '顧客', icon: Users },
  { href: '/sales', label: '売上', icon: TrendingUp },
  { href: '/settings', label: '設定', icon: Settings },
];

export default function BottomTabBar() {
  const pathname = usePathname() || '';

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t md:hidden bottom-tab-bar"
      style={{ borderColor: 'var(--gray-200)' }}
    >
      <div className="grid grid-cols-5 h-14">
        {TABS.map((tab) => {
          const active = pathname === tab.href || (tab.href !== '/dashboard' && pathname.startsWith(tab.href));
          const Icon = tab.icon;
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className="flex flex-col items-center justify-center gap-0.5 transition-colors"
              style={{ color: active ? 'var(--brand)' : 'var(--gray-500)' }}
            >
              <Icon className="w-5 h-5" strokeWidth={active ? 2.4 : 1.8} />
              <span className="text-[10px] tracking-wide">{tab.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
