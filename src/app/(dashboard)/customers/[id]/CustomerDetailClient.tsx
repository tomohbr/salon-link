'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Phone, Mail, Calendar, Edit, Trash2, Plus } from 'lucide-react';
import Modal, { Field } from '@/components/shared/Modal';
import { yen, fmtDate, sourceLabel } from '@/lib/utils/format';

type Customer = {
  id: string;
  name: string;
  nameKana: string | null;
  phone: string | null;
  email: string | null;
  source: string;
  firstVisitDate: string | null;
  lastVisitDate: string | null;
  visitCount: number;
  totalSpent: number;
  tags: string[];
  notes: string | null;
  isLineFriend: boolean;
};
type Treatment = {
  id: string;
  date: string;
  menuName: string;
  totalPrice: number;
  durationMinutes: number;
  notes: string | null;
  satisfactionScore: number | null;
  staff: { name: string } | null;
};

export default function CustomerDetailClient({ customer: initialCustomer, treatments }: { customer: Customer; treatments: Treatment[] }) {
  const router = useRouter();
  const customer = initialCustomer;
  const [editOpen, setEditOpen] = useState(false);
  const [treatmentOpen, setTreatmentOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [editForm, setEditForm] = useState({
    name: customer.name,
    nameKana: customer.nameKana || '',
    phone: customer.phone || '',
    email: customer.email || '',
    source: customer.source,
    notes: customer.notes || '',
    isLineFriend: customer.isLineFriend,
  });

  const [tr, setTr] = useState({
    date: new Date().toISOString().slice(0, 10),
    menuName: '',
    totalPrice: '',
    durationMinutes: '60',
    notes: '',
    satisfactionScore: '5',
  });

  const avgSpend = customer.visitCount > 0 ? Math.floor(customer.totalSpent / customer.visitCount) : 0;
  const daysSinceLastVisit = customer.lastVisitDate
    ? Math.floor((Date.now() - new Date(customer.lastVisitDate).getTime()) / 86400000)
    : null;

  async function saveEdit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch(`/api/customers/${customer.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || '更新に失敗しました');
        return;
      }
      setEditOpen(false);
      router.refresh();
    } catch {
      setError('通信エラー');
    } finally {
      setLoading(false);
    }
  }

  async function addTreatment(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/treatments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customerId: customer.id, ...tr }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || '追加に失敗しました');
        return;
      }
      setTreatmentOpen(false);
      setTr({ date: new Date().toISOString().slice(0, 10), menuName: '', totalPrice: '', durationMinutes: '60', notes: '', satisfactionScore: '5' });
      router.refresh();
    } catch {
      setError('通信エラー');
    } finally {
      setLoading(false);
    }
  }

  async function deleteCustomer() {
    if (!confirm('この顧客を削除しますか？施術履歴も含めて削除されます。')) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/customers/${customer.id}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || '削除に失敗しました');
        return;
      }
      router.push('/customers');
    } catch {
      alert('通信エラー');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <Link href="/customers" className="text-sm text-stone-500 hover:text-stone-700 inline-flex items-center gap-1">
        <ArrowLeft className="w-4 h-4" /> 顧客一覧に戻る
      </Link>

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-1 space-y-4">
          <div className="card-box">
            <div className="w-20 h-20 rounded-full brand-light-bg flex items-center justify-center text-3xl brand-text font-bold mb-4">
              {customer.name.charAt(0)}
            </div>
            <h1 className="text-xl font-bold text-stone-900">{customer.name}</h1>
            <p className="text-sm text-stone-500">{customer.nameKana}</p>
            <div className="mt-4 space-y-2 text-sm">
              {customer.phone && (
                <div className="flex items-center gap-2 text-stone-700"><Phone className="w-4 h-4 text-stone-400" />{customer.phone}</div>
              )}
              {customer.email && (
                <div className="flex items-center gap-2 text-stone-700"><Mail className="w-4 h-4 text-stone-400" />{customer.email}</div>
              )}
              <div className="flex items-center gap-2 text-stone-700">
                <Calendar className="w-4 h-4 text-stone-400" />初回: {customer.firstVisitDate ? fmtDate(customer.firstVisitDate) : '—'}
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-stone-100 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-stone-500">流入元</span>
                <span className="badge badge-brand">{sourceLabel(customer.source)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-stone-500">LINE</span>
                {customer.isLineFriend ? <span className="badge badge-green">登録済</span> : <span className="badge badge-gray">未登録</span>}
              </div>
            </div>
          </div>
          <div className="space-y-2">
            <button onClick={() => setEditOpen(true)} className="w-full btn-ghost justify-center text-sm border border-stone-300">
              <Edit className="w-4 h-4" />顧客情報を編集
            </button>
            <button onClick={deleteCustomer} className="w-full btn-ghost justify-center text-sm text-red-600 border border-red-200 hover:bg-red-50">
              <Trash2 className="w-4 h-4" />顧客を削除
            </button>
          </div>
        </div>

        <div className="col-span-2 space-y-4">
          <div className="grid grid-cols-3 gap-3">
            <Stat label="来店回数" value={`${customer.visitCount}回`} />
            <Stat label="累計売上" value={yen(customer.totalSpent)} />
            <Stat label="平均単価" value={yen(avgSpend)} />
          </div>

          {daysSinceLastVisit !== null && daysSinceLastVisit >= 90 && (
            <div className="card-box bg-amber-50 border-amber-200">
              <div className="text-sm text-amber-900 font-semibold">⚠ 離反リスク</div>
              <div className="text-xs text-amber-700 mt-1">
                最終来店から{daysSinceLastVisit}日経過。復帰クーポンの送信を検討してください。
              </div>
            </div>
          )}

          <div className="card-box">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-stone-900">施術履歴 ({treatments.length}件)</h3>
              <button onClick={() => setTreatmentOpen(true)} className="btn-brand text-xs">
                <Plus className="w-3 h-3" />カルテを追加
              </button>
            </div>
            <div className="space-y-3">
              {treatments.length === 0 ? (
                <p className="text-sm text-stone-500 py-4 text-center">施術履歴はありません</p>
              ) : (
                treatments.map((t) => (
                  <div key={t.id} className="flex gap-4 py-3 border-b border-stone-100 last:border-0">
                    <div className="w-16 text-center">
                      <div className="text-xs text-stone-500">{t.date.slice(5, 10)}</div>
                      <div className="text-xs text-stone-400">{t.date.slice(0, 4)}</div>
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-sm">{t.menuName}</div>
                      <div className="text-xs text-stone-500 mt-0.5">担当: {t.staff?.name || '—'} / {t.durationMinutes}分</div>
                      {t.notes && <div className="text-xs text-stone-600 mt-1">{t.notes}</div>}
                    </div>
                    <div className="text-right">
                      <div className="font-medium">{yen(t.totalPrice)}</div>
                      <div className="text-xs text-amber-500">{t.satisfactionScore ? '★'.repeat(t.satisfactionScore) : ''}</div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {customer.notes && (
            <div className="card-box">
              <h3 className="font-semibold text-stone-900 mb-2">メモ</h3>
              <p className="text-sm text-stone-600 whitespace-pre-wrap">{customer.notes}</p>
            </div>
          )}
        </div>
      </div>

      {/* 編集モーダル */}
      <Modal open={editOpen} onClose={() => setEditOpen(false)} title="顧客情報を編集">
        {error && <div className="mb-4 p-3 text-xs" style={{ background: '#fdf2f2', border: '1px solid #f0c8c8', color: '#8b2b2b' }}>{error}</div>}
        <form onSubmit={saveEdit} className="space-y-4">
          <Field label="お名前" required>
            <input className="input" required value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} />
          </Field>
          <Field label="ふりがな">
            <input className="input" value={editForm.nameKana} onChange={(e) => setEditForm({ ...editForm, nameKana: e.target.value })} />
          </Field>
          <Field label="電話番号">
            <input className="input" value={editForm.phone} onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })} />
          </Field>
          <Field label="メールアドレス">
            <input type="email" className="input" value={editForm.email} onChange={(e) => setEditForm({ ...editForm, email: e.target.value })} />
          </Field>
          <Field label="流入元">
            <select className="input" value={editForm.source} onChange={(e) => setEditForm({ ...editForm, source: e.target.value })}>
              <option value="web">自社Web</option>
              <option value="hotpepper">ホットペッパー</option>
              <option value="line">LINE</option>
              <option value="instagram">Instagram</option>
              <option value="referral">紹介</option>
              <option value="walk_in">飛び込み</option>
              <option value="other">その他</option>
            </select>
          </Field>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={editForm.isLineFriend} onChange={(e) => setEditForm({ ...editForm, isLineFriend: e.target.checked })} />
            <span>LINE 友だち登録済み</span>
          </label>
          <Field label="メモ">
            <textarea className="input" rows={3} value={editForm.notes} onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })} />
          </Field>
          <button type="submit" disabled={loading} className="w-full py-3 text-xs tracking-[0.2em]" style={{ background: '#1a1a1a', color: 'white' }}>
            {loading ? '保存中...' : '変更を保存'}
          </button>
        </form>
      </Modal>

      {/* カルテ追加モーダル */}
      <Modal open={treatmentOpen} onClose={() => setTreatmentOpen(false)} title="カルテ(施術記録)を追加">
        {error && <div className="mb-4 p-3 text-xs" style={{ background: '#fdf2f2', border: '1px solid #f0c8c8', color: '#8b2b2b' }}>{error}</div>}
        <form onSubmit={addTreatment} className="space-y-4">
          <Field label="施術日" required>
            <input type="date" className="input" required value={tr.date} onChange={(e) => setTr({ ...tr, date: e.target.value })} />
          </Field>
          <Field label="メニュー名" required>
            <input className="input" required value={tr.menuName} onChange={(e) => setTr({ ...tr, menuName: e.target.value })} placeholder="ワンカラージェル" />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="金額(円)" required>
              <input type="number" className="input" required value={tr.totalPrice} onChange={(e) => setTr({ ...tr, totalPrice: e.target.value })} />
            </Field>
            <Field label="所要時間(分)">
              <input type="number" className="input" value={tr.durationMinutes} onChange={(e) => setTr({ ...tr, durationMinutes: e.target.value })} />
            </Field>
          </div>
          <Field label="満足度(1〜5)">
            <select className="input" value={tr.satisfactionScore} onChange={(e) => setTr({ ...tr, satisfactionScore: e.target.value })}>
              <option value="5">★★★★★</option>
              <option value="4">★★★★</option>
              <option value="3">★★★</option>
              <option value="2">★★</option>
              <option value="1">★</option>
            </select>
          </Field>
          <Field label="備考">
            <textarea className="input" rows={3} value={tr.notes} onChange={(e) => setTr({ ...tr, notes: e.target.value })} placeholder="爪の状態・使用カラー等" />
          </Field>
          <button type="submit" disabled={loading} className="w-full py-3 text-xs tracking-[0.2em]" style={{ background: '#1a1a1a', color: 'white' }}>
            {loading ? '追加中...' : 'カルテを追加'}
          </button>
        </form>
      </Modal>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="card-box">
      <div className="text-xs text-stone-500">{label}</div>
      <div className="text-xl font-bold text-stone-900 mt-1">{value}</div>
    </div>
  );
}
