import Link from 'next/link';
import { Sparkles, ArrowLeft } from 'lucide-react';
import type { ReactNode } from 'react';

export default function LegalLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-white text-stone-900">
      <header className="border-b border-stone-200 sticky top-0 bg-white/95 backdrop-blur z-50">
        <div className="max-w-3xl mx-auto px-5 md:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white" style={{ background: 'linear-gradient(135deg, #633f5a 0%, #2a1a26 100%)' }}>
              <Sparkles className="w-4 h-4" />
            </div>
            <div className="leading-tight">
              <div className="font-semibold text-[15px]">SalonLink</div>
              <div className="text-[9px] tracking-[0.18em] uppercase text-stone-500">for Nail Salons</div>
            </div>
          </Link>
          <Link href="/" className="text-[12px] text-stone-500 hover:text-stone-900 transition inline-flex items-center gap-1.5">
            <ArrowLeft className="w-3.5 h-3.5" />
            トップに戻る
          </Link>
        </div>
      </header>
      <main className="max-w-3xl mx-auto px-5 md:px-8 py-16 md:py-24">
        {children}
      </main>
      <footer className="border-t border-stone-200 py-10 mt-16">
        <div className="max-w-3xl mx-auto px-5 md:px-8 flex flex-wrap items-center justify-between gap-4 text-[11px] text-stone-500">
          <div>© 2026 SalonLink. All rights reserved.</div>
          <div className="flex gap-4">
            <Link href="/legal/terms" className="hover:text-stone-900">利用規約</Link>
            <Link href="/legal/privacy" className="hover:text-stone-900">プライバシーポリシー</Link>
            <Link href="/legal/tokushoho" className="hover:text-stone-900">特商法表記</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
