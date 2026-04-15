'use client';
import { useState } from 'react';
import Link from 'next/link';

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
      window.location.href = data.redirectUrl;
    } catch {
      setError('通信エラーが発生しました');
      setLoading(false);
    }
  }

  return (
    <div className="w-full max-w-5xl">
      <div className="text-center mb-12">
        <p className="text-xs tracking-[0.3em] mb-3" style={{ color: '#633f5a' }}>REGISTRATION</p>
        <h1 className="text-2xl md:text-3xl font-bold leading-[1.7]" style={{ color: '#2a1a26' }}>
          新規ご登録
        </h1>
        <p className="text-sm mt-4 leading-[2.0]" style={{ color: '#4a3a44' }}>
          プランをお選びいただき、決済完了後すぐにご利用いただけます。
        </p>
      </div>

      <div className="grid md:grid-cols-[1.2fr_1fr] gap-10">
        {/* 左: 登録フォーム */}
        <div className="bg-white p-10" style={{ border: '1px solid #e8dfd9' }}>
          {error && (
            <div className="mb-5 p-3 text-xs leading-relaxed" style={{ background: '#fdf2f2', border: '1px solid #f0c8c8', color: '#8b2b2b' }}>
              {error}
            </div>
          )}

          <form onSubmit={onSubmit} className="space-y-5">
            <FormField label="店舗名" required>
              <input
                type="text"
                required
                value={salonName}
                onChange={(e) => setSalonName(e.target.value)}
                placeholder="Nail Salon LUMIÈRE"
                className="w-full px-4 py-3 text-sm bg-transparent focus:outline-none"
                style={{ border: '1px solid #e8dfd9' }}
              />
            </FormField>
            <FormField label="お名前(オーナー)" required>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="佐藤 ゆかり"
                className="w-full px-4 py-3 text-sm bg-transparent focus:outline-none"
                style={{ border: '1px solid #e8dfd9' }}
              />
            </FormField>
            <FormField label="メールアドレス" required>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="owner@example.com"
                className="w-full px-4 py-3 text-sm bg-transparent focus:outline-none"
                style={{ border: '1px solid #e8dfd9' }}
              />
            </FormField>
            <FormField label="パスワード(8文字以上)" required>
              <input
                type="password"
                required
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-3 text-sm bg-transparent focus:outline-none"
                style={{ border: '1px solid #e8dfd9' }}
              />
            </FormField>

            <div>
              <label className="block text-[10px] tracking-[0.15em] uppercase mb-3" style={{ color: '#8a7a82' }}>プラン</label>
              <div className="grid grid-cols-2 gap-3">
                <PlanPicker label="Light" price="3,980" selected={plan === 'light'} onClick={() => setPlan('light')} />
                <PlanPicker label="Standard" price="7,980" selected={plan === 'standard'} onClick={() => setPlan('standard')} />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 text-xs tracking-[0.2em] mt-4 disabled:opacity-50"
              style={{ background: '#1a1a1a', color: 'white' }}
            >
              {loading ? '処理中...' : '決済画面へ進む'}
            </button>

            <p className="text-[10px] text-center leading-[1.8]" style={{ color: '#8a7a82' }}>
              ご登録には決済が必要です。次画面で Stripe のセキュアな決済ページに移動いたします。
            </p>
          </form>

          <div className="mt-8 pt-8 text-center text-xs" style={{ borderTop: '1px solid #e8dfd9', color: '#4a3a44' }}>
            既にアカウントをお持ちの方は{' '}
            <Link href="/login" className="underline underline-offset-4" style={{ color: '#633f5a' }}>ログイン</Link>
          </div>
        </div>

        {/* 右: 特典説明 */}
        <div className="space-y-6">
          <div className="p-8" style={{ background: '#f5efec' }}>
            <p className="text-[10px] tracking-[0.2em] uppercase mb-4" style={{ color: '#633f5a' }}>BENEFITS</p>
            <h2 className="font-bold mb-5 leading-[1.8]" style={{ color: '#2a1a26' }}>選ばれている理由</h2>
            <ul className="space-y-4 text-sm leading-[1.9]" style={{ color: '#4a3a44' }}>
              <Benefit text="月額 3,980 円から、業界最安クラス" />
              <Benefit text="初期費用 0 円、いつでも解約可能" />
              <Benefit text="LINE連携・クーポン配信・分析が全て込み" />
              <Benefit text="ホットペッパー→自社への移行率を可視化" />
              <Benefit text="データは PostgreSQL で永続化" />
            </ul>
          </div>

          <div className="p-8 text-xs leading-[2.0]" style={{ border: '1px solid #e8dfd9', color: '#4a3a44' }}>
            <p className="text-[10px] tracking-[0.2em] uppercase mb-4" style={{ color: '#633f5a' }}>PAYMENT</p>
            <div className="space-y-2">
              <p>クレジットカード決済(Stripe)</p>
              <p>月額サブスクリプション / 日割りなし</p>
              <p>決済完了後、すぐにご利用いただけます</p>
              <p>データは更新時も失われません</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function FormField({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-[10px] tracking-[0.15em] uppercase mb-2" style={{ color: '#8a7a82' }}>
        {label}
        {required && <span className="ml-1" style={{ color: '#633f5a' }}>*</span>}
      </label>
      {children}
    </div>
  );
}

function PlanPicker({ label, price, selected, onClick }: { label: string; price: string; selected: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="p-4 text-left transition-all"
      style={selected ? { background: '#f5efec', border: '1px solid #633f5a' } : { border: '1px solid #e8dfd9', background: 'white' }}
    >
      <div className="text-xs font-bold" style={{ color: selected ? '#633f5a' : '#2a1a26' }}>{label}</div>
      <div className="mt-2">
        <span className="text-[10px] align-top" style={{ color: '#4a3a44' }}>¥</span>
        <span className="text-xl font-bold" style={{ color: selected ? '#633f5a' : '#2a1a26' }}>{price}</span>
        <span className="text-[10px] ml-1" style={{ color: '#8a7a82' }}>/月</span>
      </div>
    </button>
  );
}

function Benefit({ text }: { text: string }) {
  return (
    <li className="flex items-start gap-3">
      <span className="mt-2" style={{ color: '#633f5a', fontSize: '8px' }}>●</span>
      <span>{text}</span>
    </li>
  );
}
