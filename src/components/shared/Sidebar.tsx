'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard, CalendarDays, Users, ListOrdered, Ticket,
  MessageSquare, Image as ImageIcon, BarChart3, Settings,
  TrendingUp, Box, LogOut, Sparkles,
} from 'lucide-react';

const allNav = [
  { href: '/dashboard', label: 'ダッシュボード', icon: LayoutDashboard, roles: ['admin', 'staff'] },
  { href: '/reservations', label: '予約', icon: CalendarDays, roles: ['admin', 'staff'] },
  { href: '/customers', label: '顧客', icon: Users, roles: ['admin', 'staff'] },
  { href: '/menus', label: 'メニュー', icon: ListOrdered, roles: ['admin', 'staff'] },
  { href: '/sales', label: '売上', icon: TrendingUp, roles: ['admin'] },
  { href: '/products', label: '在庫', icon: Box, roles: ['admin'] },
  { href: '/coupons', label: 'クーポン', icon: Ticket, roles: ['admin'] },
  { href: '/messages', label: 'メッセージ配信', icon: MessageSquare, roles: ['admin'] },
  { href: '/designs', label: 'デザインギャラリー', icon: ImageIcon, roles: ['admin'] },
  { href: '/analytics', label: '分析', icon: BarChart3, roles: ['admin'] },
  { href: '/settings', label: '設定', icon: Settings, roles: ['admin'] },
];

export default function Sidebar({ userName, userRole, salonName, plan }: { userName: string; userRole: string; salonName: string; plan: string }) {
  const path = usePathname();
  const nav = allNav.filter((n) => n.roles.includes(userRole));

  return (
    <aside
      className="hidden md:flex flex-col h-screen sticky top-0 bg-white"
      style={{ width: '236px', borderRight: '1px solid var(--gray-200)' }}
    >
      {/* ブランドマーク (グラデーション) */}
      <div className="px-5 py-5" style={{ borderBottom: '1px solid var(--gray-200)' }}>
        <Link href="/" className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center text-white"
            style={{
              background: 'linear-gradient(135deg, #633f5a 0%, #2a1a26 100%)',
              boxShadow: 'var(--elev-2)',
            }}
          >
            <Sparkles className="w-5 h-5" strokeWidth={2.2} />
          </div>
          <div className="min-w-0">
            <div className="font-bold text-sm" style={{ color: 'var(--gray-900)' }}>SalonLink</div>
            <div className="text-[10px] tracking-[0.15em] uppercase" style={{ color: 'var(--gray-500)' }}>WORKSPACE</div>
          </div>
        </Link>
        <div className="mt-3 text-xs truncate" style={{ color: 'var(--gray-600)' }}>
          {salonName}
        </div>
      </div>

      {/* ナビ (左アクセントバーでアクティブ表示) */}
      <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
        {nav.map((item) => {
          const active = path === item.href || (item.href !== '/dashboard' && path?.startsWith(item.href));
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className="relative flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-all"
              style={{
                color: active ? 'var(--brand)' : 'var(--gray-700)',
                background: active ? 'var(--brand-warm)' : 'transparent',
              }}
            >
              {active && (
                <span
                  aria-hidden
                  className="absolute left-0 top-1.5 bottom-1.5 w-0.5 rounded-full"
                  style={{ background: 'var(--brand)' }}
                />
              )}
              <Icon className="w-4 h-4" strokeWidth={active ? 2.2 : 1.8} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* フッター: ユーザー情報 + プラン + ログアウト */}
      <div className="p-4 space-y-3" style={{ borderTop: '1px solid var(--gray-200)' }}>
        <div className="flex items-center gap-2.5">
          <div
            className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0"
            style={{ background: 'var(--brand-warm)', color: 'var(--brand)' }}
          >
            {userName.charAt(0)}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xs font-medium truncate" style={{ color: 'var(--gray-900)' }}>
              {userName}
            </div>
            <div className="text-[10px]" style={{ color: 'var(--gray-500)' }}>
              {userRole === 'admin' ? '管理者' : 'スタッフ'}
            </div>
          </div>
        </div>
        <div className="flex items-center justify-between text-[10px]" style={{ color: 'var(--gray-500)' }}>
          <span>プラン</span>
          <span
            className="px-2 py-0.5 rounded-full font-bold uppercase tracking-wider text-[9px]"
            style={{ background: 'var(--brand)', color: 'white' }}
          >
            {plan}
          </span>
        </div>
        <form action="/api/auth/logout" method="POST">
          <button
            type="submit"
            className="w-full flex items-center justify-center gap-2 py-2 text-xs rounded-md transition-colors"
            style={{ color: 'var(--gray-600)', border: '1px solid var(--gray-200)' }}
          >
            <LogOut className="w-3.5 h-3.5" />ログアウト
          </button>
        </form>
      </div>
    </aside>
  );
}
