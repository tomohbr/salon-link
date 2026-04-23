'use client';
// Command Palette (⌘K / Ctrl+K)
// Navigate / Create / Account の 3 グループでファジー検索。
// モバイルは FAB として表示。

import { useState, useEffect, useRef, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  LayoutDashboard, CalendarDays, Users, ListOrdered, Ticket, MessageSquare,
  Image as ImageIcon, BarChart3, Settings, TrendingUp, Box,
  Plus, LogOut, Search, Command,
} from 'lucide-react';

interface Cmd {
  id: string;
  label: string;
  group: 'navigate' | 'create' | 'account';
  icon: React.ComponentType<{ className?: string }>;
  keywords?: string;
  action: () => void;
}

export default function CommandPalette() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState('');
  const [selIdx, setSelIdx] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const commands: Cmd[] = useMemo(() => [
    { id: 'go-dash', label: 'ダッシュボード', group: 'navigate', icon: LayoutDashboard, keywords: 'home dashboard', action: () => router.push('/dashboard') },
    { id: 'go-res', label: '予約管理', group: 'navigate', icon: CalendarDays, keywords: 'reservations calendar', action: () => router.push('/reservations') },
    { id: 'go-cust', label: '顧客', group: 'navigate', icon: Users, keywords: 'customers', action: () => router.push('/customers') },
    { id: 'go-menu', label: 'メニュー', group: 'navigate', icon: ListOrdered, keywords: 'menus', action: () => router.push('/menus') },
    { id: 'go-sales', label: '売上', group: 'navigate', icon: TrendingUp, keywords: 'sales revenue', action: () => router.push('/sales') },
    { id: 'go-prod', label: '在庫', group: 'navigate', icon: Box, keywords: 'products stock inventory', action: () => router.push('/products') },
    { id: 'go-coup', label: 'クーポン', group: 'navigate', icon: Ticket, keywords: 'coupons', action: () => router.push('/coupons') },
    { id: 'go-msg', label: 'メッセージ配信', group: 'navigate', icon: MessageSquare, keywords: 'messages line', action: () => router.push('/messages') },
    { id: 'go-des', label: 'デザインギャラリー', group: 'navigate', icon: ImageIcon, keywords: 'designs gallery', action: () => router.push('/designs') },
    { id: 'go-anal', label: '分析', group: 'navigate', icon: BarChart3, keywords: 'analytics', action: () => router.push('/analytics') },
    { id: 'go-set', label: '設定', group: 'navigate', icon: Settings, keywords: 'settings', action: () => router.push('/settings') },
    { id: 'create-cust', label: '新規顧客を追加', group: 'create', icon: Plus, keywords: 'add customer new', action: () => router.push('/customers?new=1') },
    { id: 'create-res', label: '新規予約を追加', group: 'create', icon: Plus, keywords: 'add reservation new', action: () => router.push('/reservations?new=1') },
    { id: 'create-menu', label: '新規メニューを追加', group: 'create', icon: Plus, keywords: 'add menu new', action: () => router.push('/menus?new=1') },
    { id: 'logout', label: 'ログアウト', group: 'account', icon: LogOut, action: () => { const form = document.createElement('form'); form.method = 'POST'; form.action = '/api/auth/logout'; document.body.appendChild(form); form.submit(); } },
  ], [router]);

  // ⌘K / Ctrl+K で開閉
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setOpen((o) => !o);
      }
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  useEffect(() => {
    if (open) {
      setQ('');
      setSelIdx(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  const filtered = useMemo(() => {
    if (!q.trim()) return commands;
    const q2 = q.toLowerCase();
    return commands.filter((c) =>
      c.label.toLowerCase().includes(q2) || (c.keywords || '').toLowerCase().includes(q2)
    );
  }, [commands, q]);

  const groups: { name: string; key: string; items: Cmd[] }[] = [
    { name: '移動', key: 'navigate', items: filtered.filter((c) => c.group === 'navigate') },
    { name: '作成', key: 'create', items: filtered.filter((c) => c.group === 'create') },
    { name: 'アカウント', key: 'account', items: filtered.filter((c) => c.group === 'account') },
  ].filter((g) => g.items.length > 0);

  function handleKey(e: React.KeyboardEvent) {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelIdx((i) => Math.min(i + 1, filtered.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelIdx((i) => Math.max(i - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const cmd = filtered[selIdx];
      if (cmd) {
        setOpen(false);
        cmd.action();
      }
    }
  }

  return (
    <>
      {/* モバイル FAB */}
      <button
        onClick={() => setOpen(true)}
        className="md:hidden fixed bottom-20 right-4 z-30 w-12 h-12 rounded-full flex items-center justify-center"
        style={{ background: 'var(--gray-900)', color: 'white', boxShadow: 'var(--elev-4)' }}
        aria-label="コマンドパレットを開く"
      >
        <Command className="w-5 h-5" />
      </button>

      {open && (
        <div className="fixed inset-0 z-[60] flex items-start justify-center pt-[10vh] px-4" style={{ background: 'rgba(12,10,9,0.5)' }} onClick={() => setOpen(false)}>
          <div
            className="w-full max-w-xl overflow-hidden"
            style={{ background: 'white', borderRadius: 'var(--r-lg)', boxShadow: 'var(--elev-5)' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-2 px-4 py-3 border-b" style={{ borderColor: 'var(--gray-200)' }}>
              <Search className="w-4 h-4" style={{ color: 'var(--gray-400)' }} />
              <input
                ref={inputRef}
                type="text"
                value={q}
                onChange={(e) => { setQ(e.target.value); setSelIdx(0); }}
                onKeyDown={handleKey}
                placeholder="コマンドを検索..."
                className="flex-1 outline-none text-sm bg-transparent"
                style={{ color: 'var(--gray-900)' }}
              />
              <kbd className="hidden md:inline text-[10px] px-1.5 py-0.5 rounded" style={{ background: 'var(--gray-100)', color: 'var(--gray-500)' }}>ESC</kbd>
            </div>
            <div className="max-h-[60vh] overflow-y-auto p-2">
              {filtered.length === 0 ? (
                <div className="p-6 text-center text-sm" style={{ color: 'var(--gray-500)' }}>該当するコマンドがありません</div>
              ) : (
                groups.map((g) => (
                  <div key={g.key} className="mb-3">
                    <div className="px-3 py-1.5 text-[10px] tracking-[0.15em] uppercase font-bold" style={{ color: 'var(--gray-400)' }}>{g.name}</div>
                    {g.items.map((c) => {
                      const idx = filtered.indexOf(c);
                      const Icon = c.icon;
                      const active = idx === selIdx;
                      return (
                        <button
                          key={c.id}
                          onMouseEnter={() => setSelIdx(idx)}
                          onClick={() => { setOpen(false); c.action(); }}
                          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm text-left transition-colors"
                          style={{ background: active ? 'var(--brand-warm)' : 'transparent', color: active ? 'var(--brand)' : 'var(--gray-700)' }}
                        >
                          <Icon className="w-4 h-4 flex-shrink-0" />
                          {c.label}
                        </button>
                      );
                    })}
                  </div>
                ))
              )}
            </div>
            <div className="px-4 py-2 border-t text-[10px] flex items-center justify-between" style={{ borderColor: 'var(--gray-200)', color: 'var(--gray-400)', background: 'var(--gray-50)' }}>
              <span>↑↓ 選択 · Enter 実行</span>
              <span>⌘K で開閉</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
