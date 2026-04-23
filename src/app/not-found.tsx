import Link from 'next/link';
import { Home, Search } from 'lucide-react';

export default function NotFound() {
  return (
    <div
      className="min-h-screen flex items-center justify-center px-5"
      style={{ background: 'var(--gray-0)' }}
    >
      <div className="max-w-md w-full text-center">
        <div
          className="text-7xl md:text-8xl font-bold tabular mb-4"
          style={{
            background: 'linear-gradient(135deg, #633f5a 0%, #c9a96e 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}
        >
          404
        </div>
        <h1 className="text-xl md:text-2xl font-bold mb-3" style={{ color: 'var(--gray-900)' }}>
          お探しのページが見つかりませんでした
        </h1>
        <p className="text-sm leading-relaxed mb-8" style={{ color: 'var(--gray-600)' }}>
          URL が変更されたか、削除された可能性がございます。
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/"
            className="px-6 py-3 text-xs tracking-[0.2em] font-bold inline-flex items-center justify-center gap-2"
            style={{ background: 'var(--gray-900)', color: 'white', borderRadius: 'var(--r-md)' }}
          >
            <Home className="w-3.5 h-3.5" />トップへ戻る
          </Link>
          <Link
            href="/dashboard"
            className="px-6 py-3 text-xs tracking-[0.2em] font-bold inline-flex items-center justify-center gap-2"
            style={{ color: 'var(--gray-900)', border: '1px solid var(--gray-900)', borderRadius: 'var(--r-md)' }}
          >
            <Search className="w-3.5 h-3.5" />ダッシュボードへ
          </Link>
        </div>
      </div>
    </div>
  );
}
