'use client';
import { useState } from 'react';
import Link from 'next/link';
import { CheckCircle2 } from 'lucide-react';

export default function RegisterPage() {
  const [salonName, setSalonName] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [plan, setPlan] = useState<'light' | 'standard'>('light');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ salonName, name, email, password, plan }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || '登録に失敗しました');
        setLoading(false);
        return;
      }
      // Stripe Checkout へリダイレクト (または demo mode)
      window.location.href = data.redirectUrl;
    } catch {
      setError('通信エラー');
      setLoading(false);
    }
  }

  return (
    <div className="w-full max-w-4xl">
      <div className="grid md:grid-cols-2 gap-6">
        {/* 左: 登録フォーム */}
        <div className="card-box">
          <h1 className="text-2xl font-bold text-stone-900 mb-1">新規登録</h1>
          <p className="text-sm text-stone-500 mb-6">プランを選択して決済後、すぐに利用開始できます</p>

          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700">
              {error}
            </div>
          )}

          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-stone-700 mb-1">店舗名</label>
              <input type="text" required className="input" value={salonName} onChange={(e) => setSalonName(e.target.value)} placeholder="Nail Salon LUMIÈRE" />
            </div>
            <div>
              <label className="block text-xs font-medium text-stone-700 mb-1">お名前（オーナー）</label>
              <input type="text" required className="input" value={name} onChange={(e) => setName(e.target.value)} placeholder="佐藤 ゆかり" />
            </div>
            <div>
              <label className="block text-xs font-medium text-stone-700 mb-1">メールアドレス</label>
              <input type="email" required className="input" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="owner@example.com" />
            </div>
            <div>
              <label className="block text-xs font-medium text-stone-700 mb-1">パスワード (8文字以上)</label>
              <input type="password" required minLength={8} className="input" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
            </div>

            <div>
              <label className="block text-xs font-medium text-stone-700 mb-2">プラン選択</label>
              <div className="grid grid-cols-2 gap-2">
                <PlanPicker label="Light" price="¥3,980" selected={plan === 'light'} onClick={() => setPlan('light')} />
                <PlanPicker label="Standard" price="¥7,980" selected={plan === 'standard'} onClick={() => setPlan('standard')} />
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn-brand w-full justify-center py-2.5">
              {loading ? '処理中...' : '決済画面へ進む →'}
            </button>

            <p className="text-[11px] text-stone-500 text-center">
              ご登録には決済が必要です。次画面で Stripe のセキュアな決済ページに移動します。
            </p>
          </form>

          <div className="mt-6 pt-6 border-t border-stone-100 text-center text-sm text-stone-600">
            既にアカウントをお持ちの方は{' '}
            <Link href="/login" className="brand-text font-semibold">ログイン</Link>
          </div>
        </div>

        {/* 右: 特典説明 */}
        <div className="space-y-4">
          <div className="card-box brand-light-bg border-pink-200">
            <h2 className="font-bold text-stone-900 mb-3">選ばれる理由</h2>
            <ul className="space-y-3 text-sm">
              <Benefit text="月額 ¥3,980〜 業界最安クラス" />
              <Benefit text="初期費用 ¥0 / いつでも解約可能" />
              <Benefit text="LINE連携・クーポン配信・分析が全て込み" />
              <Benefit text="HPB→自社移行率を可視化（独自機能）" />
              <Benefit text="100名のペルソナで検証済み" />
            </ul>
          </div>

          <div className="card-box text-xs text-stone-600 space-y-2">
            <div className="font-semibold text-stone-900 text-sm mb-1">お支払いについて</div>
            <p>・クレジットカード決済（Stripe）</p>
            <p>・月額サブスクリプション / 日割りなし</p>
            <p>・決済完了後、即座にご利用開始いただけます</p>
            <p>・データはPostgreSQLで永続化され、更新時も失われません</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function PlanPicker({ label, price, selected, onClick }: { label: string; price: string; selected: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`p-3 rounded-lg border-2 text-left transition-all ${selected ? 'brand-border brand-light-bg' : 'border-stone-200 bg-white'}`}
    >
      <div className="font-semibold text-sm">{label}</div>
      <div className={`text-lg font-bold mt-1 ${selected ? 'brand-text' : 'text-stone-700'}`}>{price}</div>
      <div className="text-[10px] text-stone-500">/月(税別)</div>
    </button>
  );
}

function Benefit({ text }: { text: string }) {
  return (
    <li className="flex items-start gap-2">
      <CheckCircle2 className="w-4 h-4 brand-text mt-0.5 flex-shrink-0" />
      <span className="text-stone-700">{text}</span>
    </li>
  );
}
