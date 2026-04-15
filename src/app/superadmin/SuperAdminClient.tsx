'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus } from 'lucide-react';
import Modal, { Field } from '@/components/shared/Modal';

export default function SuperAdminClient() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [salonName, setSalonName] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [plan, setPlan] = useState<'free' | 'light' | 'standard'>('light');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [created, setCreated] = useState<{ email: string; password: string; salonName: string } | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/superadmin/create-salon', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ salonName, ownerName, email, password, plan }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || '作成に失敗しました');
        return;
      }
      setCreated({ email, password, salonName });
      setSalonName('');
      setOwnerName('');
      setEmail('');
      setPassword('');
      router.refresh();
    } catch {
      setError('通信エラー');
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <button
        onClick={() => { setOpen(true); setCreated(null); setError(''); }}
        className="btn-brand text-xs"
      >
        <Plus className="w-3 h-3" />新規店舗を追加(決済スキップ)
      </button>
      <Modal open={open} onClose={() => setOpen(false)} title="新規店舗を追加">
        {created ? (
          <div>
            <div className="mb-5 p-4" style={{ background: '#f5efec', border: '1px solid #e8dfd9' }}>
              <p className="text-xs font-bold mb-3" style={{ color: '#633f5a' }}>✓ 店舗を作成しました</p>
              <p className="text-xs mb-2" style={{ color: '#4a3a44' }}>以下の情報を知り合いにお伝えください:</p>
              <div className="mt-3 bg-white p-3 text-xs font-mono" style={{ border: '1px solid #e8dfd9', color: '#2a1a26' }}>
                <div><span style={{ color: '#8a7a82' }}>店舗:</span> {created.salonName}</div>
                <div><span style={{ color: '#8a7a82' }}>Email:</span> {created.email}</div>
                <div><span style={{ color: '#8a7a82' }}>Password:</span> {created.password}</div>
              </div>
            </div>
            <button
              onClick={() => { setCreated(null); setOpen(false); }}
              className="w-full py-3 text-xs tracking-[0.2em]"
              style={{ background: '#1a1a1a', color: 'white' }}
            >
              閉じる
            </button>
          </div>
        ) : (
          <form onSubmit={onSubmit} className="space-y-4">
            <p className="text-[11px] mb-3 leading-[1.9]" style={{ color: '#8a7a82' }}>
              決済をスキップして店舗を直接作成します。<br />
              知り合いへの招待等にご利用ください。
            </p>
            {error && <div className="p-3 text-xs" style={{ background: '#fdf2f2', border: '1px solid #f0c8c8', color: '#8b2b2b' }}>{error}</div>}
            <Field label="店舗名" required>
              <input className="input" required value={salonName} onChange={(e) => setSalonName(e.target.value)} placeholder="Nail Salon LUMIÈRE" />
            </Field>
            <Field label="オーナー名" required>
              <input className="input" required value={ownerName} onChange={(e) => setOwnerName(e.target.value)} placeholder="佐藤 ゆかり" />
            </Field>
            <Field label="オーナーのメールアドレス" required>
              <input className="input" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
            </Field>
            <Field label="初期パスワード(8文字以上)" required hint="後でオーナー本人が変更できるようにしてください">
              <input className="input" required minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} />
            </Field>
            <Field label="プラン">
              <select className="input" value={plan} onChange={(e) => setPlan(e.target.value as 'free' | 'light' | 'standard')}>
                <option value="free">Free</option>
                <option value="light">Light</option>
                <option value="standard">Standard</option>
              </select>
            </Field>
            <button type="submit" disabled={loading} className="w-full py-3 text-xs tracking-[0.2em] mt-4 disabled:opacity-50" style={{ background: '#1a1a1a', color: 'white' }}>
              {loading ? '作成中...' : '店舗を作成'}
            </button>
          </form>
        )}
      </Modal>
    </>
  );
}
