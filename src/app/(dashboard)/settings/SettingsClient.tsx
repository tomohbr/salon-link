'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Store, MessageCircle, CreditCard, Users, Save } from 'lucide-react';
import { Field } from '@/components/shared/Modal';
import type { Salon, Staff } from '@prisma/client';

export default function SettingsClient({ salon, staff }: { salon: Salon; staff: Staff[] }) {
  const router = useRouter();
  const [info, setInfo] = useState({
    name: salon.name,
    address: salon.address || '',
    phone: salon.phone || '',
    description: salon.description || '',
  });
  const [line, setLine] = useState({
    lineChannelId: salon.lineChannelId || '',
    lineChannelSecret: salon.lineChannelSecret || '',
    lineAccessToken: salon.lineAccessToken || '',
    lineLiffId: salon.lineLiffId || '',
  });
  const [loading, setLoading] = useState<'info' | 'line' | null>(null);
  const [msg, setMsg] = useState('');

  async function save(section: 'info' | 'line', data: object) {
    setLoading(section);
    setMsg('');
    try {
      const res = await fetch('/api/salon/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const result = await res.json();
      if (!res.ok) {
        setMsg(result.error || '保存に失敗しました');
        return;
      }
      setMsg('✓ 保存しました');
      router.refresh();
      setTimeout(() => setMsg(''), 3000);
    } catch {
      setMsg('通信エラー');
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-stone-900">設定</h1>
        <p className="text-sm text-stone-500 mt-1">店舗情報・LINE連携・プラン管理</p>
      </div>

      {msg && (
        <div className="p-3 text-sm" style={{ background: msg.startsWith('✓') ? '#ecfdf5' : '#fdf2f2', border: '1px solid', borderColor: msg.startsWith('✓') ? '#a7f3d0' : '#f0c8c8', color: msg.startsWith('✓') ? '#065f46' : '#8b2b2b' }}>
          {msg}
        </div>
      )}

      <div className="grid grid-cols-2 gap-6">
        {/* 店舗情報 */}
        <div className="card-box">
          <div className="flex items-center gap-2 mb-4">
            <Store className="w-5 h-5 brand-text" />
            <h2 className="font-semibold text-stone-900">店舗情報</h2>
          </div>
          <form onSubmit={(e) => { e.preventDefault(); save('info', info); }} className="space-y-3">
            <Field label="店舗名" required>
              <input className="input" required value={info.name} onChange={(e) => setInfo({ ...info, name: e.target.value })} />
            </Field>
            <Field label="住所">
              <input className="input" value={info.address} onChange={(e) => setInfo({ ...info, address: e.target.value })} />
            </Field>
            <Field label="電話番号">
              <input className="input" value={info.phone} onChange={(e) => setInfo({ ...info, phone: e.target.value })} />
            </Field>
            <Field label="紹介文">
              <textarea className="input" rows={3} value={info.description} onChange={(e) => setInfo({ ...info, description: e.target.value })} />
            </Field>
            <div className="text-xs" style={{ color: '#8a7a82' }}>予約ページURL: /book/{salon.slug}</div>
            <button type="submit" disabled={loading === 'info'} className="btn-brand w-full justify-center py-2.5">
              <Save className="w-4 h-4" />
              {loading === 'info' ? '保存中...' : '店舗情報を保存'}
            </button>
          </form>
        </div>

        {/* LINE連携 */}
        <div className="card-box">
          <div className="flex items-center gap-2 mb-4">
            <MessageCircle className="w-5 h-5 text-emerald-500" />
            <h2 className="font-semibold text-stone-900">LINE連携</h2>
            <span className={`badge ${salon.lineAccessToken ? 'badge-green' : 'badge-gray'} ml-auto`}>
              {salon.lineAccessToken ? '接続済' : '未接続'}
            </span>
          </div>
          <form onSubmit={(e) => { e.preventDefault(); save('line', line); }} className="space-y-3">
            <Field label="Channel ID" hint="LINE Developers Console から取得">
              <input className="input" value={line.lineChannelId} onChange={(e) => setLine({ ...line, lineChannelId: e.target.value })} />
            </Field>
            <Field label="Channel Secret">
              <input type="password" className="input" value={line.lineChannelSecret} onChange={(e) => setLine({ ...line, lineChannelSecret: e.target.value })} />
            </Field>
            <Field label="Channel Access Token (長期)">
              <input type="password" className="input" value={line.lineAccessToken} onChange={(e) => setLine({ ...line, lineAccessToken: e.target.value })} />
            </Field>
            <Field label="LIFF ID" hint="LIFF アプリを作成した場合">
              <input className="input" value={line.lineLiffId} onChange={(e) => setLine({ ...line, lineLiffId: e.target.value })} />
            </Field>
            <div className="text-xs p-2" style={{ background: '#f5efec', color: '#4a3a44' }}>
              Webhook URL: <code className="text-xs">/api/line/webhook</code>
            </div>
            <button type="submit" disabled={loading === 'line'} className="btn-brand w-full justify-center py-2.5">
              <Save className="w-4 h-4" />
              {loading === 'line' ? '保存中...' : 'LINE連携を保存'}
            </button>
          </form>
        </div>

        {/* プラン */}
        <div className="card-box">
          <div className="flex items-center gap-2 mb-4">
            <CreditCard className="w-5 h-5 text-blue-500" />
            <h2 className="font-semibold text-stone-900">現在のプラン</h2>
          </div>
          <div className="p-4 brand-light-bg">
            <div className="flex items-center justify-between">
              <div>
                <span className="font-semibold text-lg">{salon.plan === 'free' ? 'Free' : salon.plan === 'light' ? 'Light' : 'Standard'}</span>
                <span className="badge badge-green ml-2">利用中</span>
              </div>
              <span className="font-bold">
                {salon.plan === 'free' ? '¥0' : salon.plan === 'light' ? '¥3,980' : '¥7,980'}
                <span className="text-xs">/月</span>
              </span>
            </div>
          </div>
          <div className="mt-4 text-xs" style={{ color: '#8a7a82' }}>
            プランの変更・解約はお問い合わせください。
          </div>
        </div>

        {/* スタッフ */}
        <div className="card-box">
          <div className="flex items-center gap-2 mb-4">
            <Users className="w-5 h-5 text-purple-500" />
            <h2 className="font-semibold text-stone-900">スタッフ ({staff.length}名)</h2>
          </div>
          <div className="space-y-2">
            {staff.length === 0 ? (
              <p className="text-sm text-stone-500 py-4 text-center">スタッフがまだ登録されていません</p>
            ) : (
              staff.map((s) => (
                <div key={s.id} className="flex items-center gap-3 p-2 rounded hover:bg-stone-50">
                  <div className="w-10 h-10 rounded-full brand-light-bg flex items-center justify-center brand-text font-bold">{s.name.charAt(0)}</div>
                  <div className="flex-1">
                    <div className="font-medium text-sm">{s.name}</div>
                    <div className="text-xs text-stone-500">{s.role} {s.bio && `· ${s.bio}`}</div>
                  </div>
                  {s.isActive ? <span className="badge badge-green">active</span> : <span className="badge badge-gray">off</span>}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
