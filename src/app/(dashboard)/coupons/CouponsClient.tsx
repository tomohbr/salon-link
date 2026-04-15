'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Ticket, Users, Calendar, Plus, Edit, Trash2 } from 'lucide-react';
import Modal, { Field } from '@/components/shared/Modal';
import { yen, fmtDate } from '@/lib/utils/format';
import type { Coupon } from '@prisma/client';

const EMPTY = {
  id: '', title: '', description: '', discountType: 'percent' as 'percent' | 'amount',
  discountValue: '', minPurchase: '', validFrom: '', validUntil: '', maxUses: '',
  targetSegment: 'all', code: '', isActive: true,
};

const segmentLabel = (s: string) => ({ all: '全顧客', new: '新規顧客', dormant: '休眠顧客', line_friend: 'LINE友だち', vip: 'VIP顧客' }[s] || s);

export default function CouponsClient({ coupons }: { coupons: Coupon[] }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<typeof EMPTY>(EMPTY);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  function openCreate() { setEditing(EMPTY); setError(''); setOpen(true); }
  function openEdit(c: Coupon) {
    setEditing({
      id: c.id,
      title: c.title,
      description: c.description || '',
      discountType: c.discountType as 'percent' | 'amount',
      discountValue: String(c.discountValue),
      minPurchase: String(c.minPurchase),
      validFrom: c.validFrom || '',
      validUntil: c.validUntil || '',
      maxUses: c.maxUses ? String(c.maxUses) : '',
      targetSegment: c.targetSegment,
      code: c.code || '',
      isActive: c.isActive,
    });
    setError('');
    setOpen(true);
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const url = editing.id ? `/api/coupons/${editing.id}` : '/api/coupons';
      const method = editing.id ? 'PATCH' : 'POST';
      const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(editing) });
      const data = await res.json();
      if (!res.ok) { setError(data.error || '保存に失敗しました'); return; }
      setOpen(false);
      router.refresh();
    } catch { setError('通信エラー'); } finally { setLoading(false); }
  }

  async function del(id: string) {
    if (!confirm('このクーポンを削除しますか？')) return;
    try {
      const res = await fetch(`/api/coupons/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) { alert(data.error); return; }
      router.refresh();
    } catch { alert('通信エラー'); }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-stone-900">クーポン管理</h1>
          <p className="text-sm text-stone-500 mt-1">稼働中 {coupons.filter((c) => c.isActive).length}件</p>
        </div>
        <button onClick={openCreate} className="btn-brand"><Plus className="w-3 h-3" />新規クーポン</button>
      </div>

      {coupons.length === 0 ? (
        <div className="card-box text-center py-10">
          <p className="text-sm text-stone-500 mb-4">クーポンがまだ作成されていません。</p>
          <button onClick={openCreate} className="btn-brand">最初のクーポンを作成</button>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4">
          {coupons.map((c) => (
            <div key={c.id} className="card-box border-l-4" style={{ borderLeftColor: '#633f5a' }}>
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Ticket className="w-4 h-4 brand-text" />
                  <h3 className="font-semibold text-stone-900">{c.title}</h3>
                </div>
                {c.isActive ? <span className="badge badge-green">配信中</span> : <span className="badge badge-gray">停止</span>}
              </div>
              <p className="text-xs text-stone-500 mb-3">{c.description}</p>
              <div className="flex items-baseline gap-2 mb-3">
                <span className="text-2xl font-bold brand-text">{c.discountType === 'percent' ? `${c.discountValue}%` : yen(c.discountValue)}</span>
                <span className="text-xs text-stone-500">OFF</span>
                {c.minPurchase > 0 && <span className="text-xs text-stone-400 ml-auto">{yen(c.minPurchase)}以上</span>}
              </div>
              <div className="grid grid-cols-3 gap-2 text-xs">
                <div className="flex items-center gap-1 text-stone-500"><Users className="w-3 h-3" />{segmentLabel(c.targetSegment)}</div>
                <div className="flex items-center gap-1 text-stone-500"><Calendar className="w-3 h-3" />{c.validUntil ? fmtDate(c.validUntil) : '無期限'}</div>
                <div className="text-stone-500 text-right">利用 {c.usedCount}/{c.maxUses || '∞'}</div>
              </div>
              <div className="mt-3 pt-3 border-t border-stone-100 flex gap-2">
                <button onClick={() => openEdit(c)} className="btn-ghost text-xs flex-1 border border-stone-200"><Edit className="w-3 h-3" />編集</button>
                <button onClick={() => del(c.id)} className="btn-ghost text-xs text-red-500 border border-red-200"><Trash2 className="w-3 h-3" /></button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal open={open} onClose={() => setOpen(false)} title={editing.id ? 'クーポンを編集' : '新規クーポンを作成'}>
        {error && <div className="mb-4 p-3 text-xs" style={{ background: '#fdf2f2', border: '1px solid #f0c8c8', color: '#8b2b2b' }}>{error}</div>}
        <form onSubmit={submit} className="space-y-4">
          <Field label="クーポン名" required>
            <input className="input" required value={editing.title} onChange={(e) => setEditing({ ...editing, title: e.target.value })} placeholder="初回ご来店20%OFF" />
          </Field>
          <Field label="説明文">
            <textarea className="input" rows={2} value={editing.description} onChange={(e) => setEditing({ ...editing, description: e.target.value })} />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="割引タイプ" required>
              <select className="input" value={editing.discountType} onChange={(e) => setEditing({ ...editing, discountType: e.target.value as 'percent' | 'amount' })}>
                <option value="percent">パーセント(%)</option>
                <option value="amount">金額(円)</option>
              </select>
            </Field>
            <Field label="割引値" required>
              <input type="number" className="input" required value={editing.discountValue} onChange={(e) => setEditing({ ...editing, discountValue: e.target.value })} />
            </Field>
          </div>
          <Field label="最低購入金額(円)">
            <input type="number" className="input" value={editing.minPurchase} onChange={(e) => setEditing({ ...editing, minPurchase: e.target.value })} placeholder="0" />
          </Field>
          <Field label="対象セグメント">
            <select className="input" value={editing.targetSegment} onChange={(e) => setEditing({ ...editing, targetSegment: e.target.value })}>
              <option value="all">全顧客</option>
              <option value="new">新規顧客</option>
              <option value="dormant">休眠顧客</option>
              <option value="line_friend">LINE友だち</option>
              <option value="vip">VIP顧客</option>
            </select>
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="利用可能開始日">
              <input type="date" className="input" value={editing.validFrom} onChange={(e) => setEditing({ ...editing, validFrom: e.target.value })} />
            </Field>
            <Field label="利用期限">
              <input type="date" className="input" value={editing.validUntil} onChange={(e) => setEditing({ ...editing, validUntil: e.target.value })} />
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="最大利用回数">
              <input type="number" className="input" value={editing.maxUses} onChange={(e) => setEditing({ ...editing, maxUses: e.target.value })} placeholder="無制限" />
            </Field>
            <Field label="クーポンコード">
              <input className="input" value={editing.code} onChange={(e) => setEditing({ ...editing, code: e.target.value })} placeholder="WELCOME20" />
            </Field>
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={editing.isActive} onChange={(e) => setEditing({ ...editing, isActive: e.target.checked })} />
            <span>配信を有効にする</span>
          </label>
          <button type="submit" disabled={loading} className="w-full py-3 text-xs tracking-[0.2em]" style={{ background: '#1a1a1a', color: 'white' }}>
            {loading ? '保存中...' : editing.id ? '変更を保存' : 'クーポンを作成'}
          </button>
        </form>
      </Modal>
    </div>
  );
}
