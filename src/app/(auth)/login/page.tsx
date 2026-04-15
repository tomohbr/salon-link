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
      setError('通信エラーが発生しました');
      setLoading(false);
    }
  }

  return (
    <div className="w-full max-w-md">
      <div className="text-center mb-10">
        <p className="text-xs tracking-[0.3em] mb-3" style={{ color: '#633f5a' }}>LOGIN</p>
        <h1 className="text-2xl font-bold" style={{ color: '#2a1a26' }}>おかえりなさい</h1>
        <p className="text-sm mt-3" style={{ color: '#8a7a82' }}>SalonLink にログインします</p>
      </div>

      <div className="bg-white p-10" style={{ border: '1px solid #e8dfd9' }}>
        {error && (
          <div className="mb-5 p-3 text-xs leading-relaxed" style={{ background: '#fdf2f2', border: '1px solid #f0c8c8', color: '#8b2b2b' }}>
            {error}
          </div>
        )}

        <form onSubmit={onSubmit} className="space-y-5">
          <div>
            <label className="block text-[10px] tracking-[0.15em] uppercase mb-2" style={{ color: '#8a7a82' }}>メールアドレス</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="owner@example.com"
              className="w-full px-4 py-3 text-sm bg-transparent focus:outline-none"
              style={{ border: '1px solid #e8dfd9', color: '#2a1a26' }}
            />
          </div>
          <div>
            <label className="block text-[10px] tracking-[0.15em] uppercase mb-2" style={{ color: '#8a7a82' }}>パスワード</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-3 text-sm bg-transparent focus:outline-none"
              style={{ border: '1px solid #e8dfd9', color: '#2a1a26' }}
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 text-xs tracking-[0.2em] mt-2 disabled:opacity-50"
            style={{ background: '#1a1a1a', color: 'white' }}
          >
            {loading ? 'ログイン中...' : 'ログイン'}
          </button>
        </form>

        <div className="mt-8 pt-8 text-center text-xs" style={{ borderTop: '1px solid #e8dfd9', color: '#4a3a44' }}>
          はじめての方はこちらから{' '}
          <Link href="/register" className="underline underline-offset-4" style={{ color: '#633f5a' }}>新規ご登録</Link>
        </div>
      </div>

      <div className="mt-8 p-6 text-xs leading-[2.0]" style={{ background: '#f5efec', color: '#4a3a44' }}>
        <div className="font-bold mb-3 text-[10px] tracking-[0.15em] uppercase" style={{ color: '#633f5a' }}>ロール別ログイン</div>
        <ul className="space-y-1.5">
          <li>・管理者(店舗オーナー)は全機能をご利用いただけます</li>
          <li>・スタッフは予約・顧客・カルテ・メニューのみ</li>
          <li>・SaaS 運営者は /superadmin で全店舗を管理</li>
        </ul>
      </div>
    </div>
  );
}
