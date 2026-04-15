'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'ログインに失敗しました');
        setLoading(false);
        return;
      }
      router.push(data.redirectUrl || '/dashboard');
      router.refresh();
    } catch {
      setError('通信エラー');
      setLoading(false);
    }
  }

  return (
    <div className="w-full max-w-md">
      <div className="card-box">
        <h1 className="text-2xl font-bold text-stone-900 mb-1">ログイン</h1>
        <p className="text-sm text-stone-500 mb-6">SalonLink にログインします</p>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-stone-700 mb-1">メールアドレス</label>
            <input
              type="email"
              required
              className="input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="owner@example.com"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-stone-700 mb-1">パスワード</label>
            <input
              type="password"
              required
              className="input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />
          </div>
          <button type="submit" disabled={loading} className="btn-brand w-full justify-center py-2.5">
            {loading ? 'ログイン中...' : 'ログイン'}
          </button>
        </form>

        <div className="mt-6 pt-6 border-t border-stone-100 text-center text-sm text-stone-600">
          アカウントをお持ちでない方は{' '}
          <Link href="/register" className="brand-text font-semibold">新規登録</Link>
        </div>
      </div>

      <div className="mt-4 p-4 rounded-lg bg-stone-100 text-xs text-stone-600">
        <div className="font-semibold mb-2">💡 ロール別ログイン</div>
        <ul className="space-y-1">
          <li>・<b>管理者（店舗オーナー）</b>: 全機能にアクセス可</li>
          <li>・<b>スタッフ</b>: 予約・顧客・カルテ・メニューのみ</li>
          <li>・<b>SaaS運営者</b>: /superadmin で全店舗を管理</li>
        </ul>
      </div>
    </div>
  );
}
