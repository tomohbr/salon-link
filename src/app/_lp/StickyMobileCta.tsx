'use client';
// スクロール 600px で下部にスライドイン
import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function StickyMobileCta() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 600);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div
      className="fixed bottom-0 left-0 right-0 md:hidden z-40 transition-transform"
      style={{
        transform: visible ? 'translateY(0)' : 'translateY(100%)',
        paddingBottom: 'env(safe-area-inset-bottom, 12px)',
      }}
    >
      <div
        className="mx-3 my-3 p-1 flex gap-2"
        style={{
          background: 'white',
          borderRadius: 'var(--r-lg)',
          boxShadow: 'var(--elev-4)',
          border: '1px solid var(--gray-200)',
        }}
      >
        <Link
          href="/login"
          className="flex-1 text-center py-3 text-xs font-bold"
          style={{ color: 'var(--gray-700)' }}
        >
          ログイン
        </Link>
        <Link
          href="/register"
          className="flex-1 text-center py-3 text-xs font-bold tracking-wider"
          style={{ background: 'var(--gray-900)', color: 'white', borderRadius: 'var(--r-md)' }}
        >
          無料で試す
        </Link>
      </div>
    </div>
  );
}
