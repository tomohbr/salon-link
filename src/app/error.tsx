'use client';
import { useEffect } from 'react';
import Link from 'next/link';
import { AlertCircle, Home, RefreshCw } from 'lucide-react';

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error('[App Error]', error);
  }, [error]);

  return (
    <div
      className="min-h-screen flex items-center justify-center px-5"
      style={{ background: 'var(--gray-0)' }}
    >
      <div className="max-w-md w-full text-center">
        <div
          className="w-14 h-14 rounded-full mx-auto mb-6 flex items-center justify-center"
          style={{ background: 'var(--color-danger-bg)' }}
        >
          <AlertCircle className="w-7 h-7" style={{ color: 'var(--color-danger)' }} />
        </div>
        <h1 className="text-2xl font-bold mb-3" style={{ color: 'var(--gray-900)' }}>
          予期せぬエラーが発生しました
        </h1>
        <p className="text-sm leading-relaxed mb-6" style={{ color: 'var(--gray-600)' }}>
          大変申し訳ございません。しばらく時間をおいてから、再度お試しください。
        </p>
        {error.digest && (
          <p
            className="text-[10px] tabular mb-8 p-2 rounded"
            style={{ background: 'var(--gray-50)', color: 'var(--gray-400)', fontFamily: 'monospace' }}
          >
            error: {error.digest}
          </p>
        )}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={reset}
            className="px-6 py-3 text-xs tracking-[0.2em] font-bold inline-flex items-center justify-center gap-2"
            style={{ background: 'var(--gray-900)', color: 'white', borderRadius: 'var(--r-md)' }}
          >
            <RefreshCw className="w-3.5 h-3.5" />
            もう一度試す
          </button>
          <Link
            href="/"
            className="px-6 py-3 text-xs tracking-[0.2em] font-bold inline-flex items-center justify-center gap-2"
            style={{ color: 'var(--gray-900)', border: '1px solid var(--gray-900)', borderRadius: 'var(--r-md)' }}
          >
            <Home className="w-3.5 h-3.5" />
            トップへ戻る
          </Link>
        </div>
      </div>
    </div>
  );
}
