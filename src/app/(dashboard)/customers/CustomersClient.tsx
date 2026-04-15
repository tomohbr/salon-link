'use client';
import { useState, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Search, Plus } from 'lucide-react';
import Modal, { Field } from '@/components/shared/Modal';
import { yen, fmtDate, sourceLabel } from '@/lib/utils/format';
import type { Customer } from '@prisma/client';

export default function CustomersClient({ customers }: { customers: Customer[] }) {
  const router = useRouter();
  const [q, setQ] = useState('');
  const [source, setSource] = useState('all');
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    name: '', nameKana: '', phone: '', email: '', source: 'web', notes: '', isLineFriend: false,
  });

  const filtered = useMemo(() => {
    return customers.filter((c) => {
      if (source !== 'all' && c.source !== source) return false;
      if (q) {
        const q2 = q.toLowerCase();
        return (
          c.name.toLowerCase().includes(q2) ||
          (c.nameKana || '').toLowerCase().includes(q2) ||
          (c.phone || '').includes(q) ||
          (c.email || '').toLowerCase().includes(q2)
        );
      }
      return true;
    });
  }, [customers, q, source]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/customers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || '作成に失敗しました');
        return;
      }
      setOpen(false);
      setForm({ name: '', nameKana: '', phone: '', email: '', source: 'web', notes: '', isLineFriend: false });
      router.refresh();
    } catch {
      setError('通信エラー');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-stone-900">顧客管理</h1>
        <p className="text-sm text-stone-500 mt-1">
          全 {customers.length}名 {filtered.length !== customers.length && `(${filtered.length}件表示)`}
        </p>
      </div>

      <div className="card-box">
        <div className="flex gap-3 mb-4">
          <div className="flex-1 relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
            <input
              className="input pl-9"
              placeholder="名前・電話番号・メールで検索..."
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
          </div>
          <select className="input max-w-xs" value={source} onChange={(e) => setSource(e.target.value)}>
            <option value="all">すべての流入元</option>
            <option value="hotpepper">ホットペッパー</option>
            <option value="line">LINE</option>
            <option value="instagram">Instagram</option>
            <option value="referral">紹介</option>
            <option value="web">自社Web</option>
            <option value="walk_in">飛び込み</option>
            <option value="other">その他</option>
          </select>
          <button onClick={() => setOpen(true)} className="btn-brand"><Plus className="w-3 h-3" />新規顧客</button>
        </div>

        {filtered.length === 0 ? (
          <p className="text-sm text-stone-500 py-8 text-center">
            {customers.length === 0 ? '顧客がまだ登録されていません。最初の顧客を追加しましょう。' : '該当する顧客がありません'}
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-stone-500 border-b border-stone-200">
                  <th className="py-3 px-2">顧客名</th>
                  <th className="py-3 px-2">流入元</th>
                  <th className="py-3 px-2">LINE</th>
                  <th className="py-3 px-2">来店回数</th>
                  <th className="py-3 px-2">累計売上</th>
                  <th className="py-3 px-2">最終来店</th>
                  <th className="py-3 px-2"></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((c) => (
                  <tr key={c.id} className="border-b border-stone-100 hover:bg-stone-50">
                    <td className="py-3 px-2">
                      <div className="font-medium text-stone-900">{c.name}</div>
                      <div className="text-xs text-stone-500">{c.nameKana}</div>
                    </td>
                    <td className="py-3 px-2">
                      <span className={`badge ${c.source === 'hotpepper' ? 'badge-yellow' : c.source === 'line' ? 'badge-green' : 'badge-gray'}`}>
                        {sourceLabel(c.source)}
                      </span>
                    </td>
                    <td className="py-3 px-2">
                      {c.isLineFriend ? <span className="badge badge-green">登録済</span> : <span className="badge badge-gray">未登録</span>}
                    </td>
                    <td className="py-3 px-2 font-medium">{c.visitCount}回</td>
                    <td className="py-3 px-2 font-medium">{yen(c.totalSpent)}</td>
                    <td className="py-3 px-2 text-stone-600">{c.lastVisitDate ? fmtDate(c.lastVisitDate) : '—'}</td>
                    <td className="py-3 px-2">
                      <Link href={`/customers/${c.id}`} className="brand-text text-xs font-medium">詳細 →</Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal open={open} onClose={() => setOpen(false)} title="新規顧客を追加">
        {error && <div className="mb-4 p-3 text-xs" style={{ background: '#fdf2f2', border: '1px solid #f0c8c8', color: '#8b2b2b' }}>{error}</div>}
        <form onSubmit={submit} className="space-y-4">
          <Field label="お名前" required>
            <input className="input" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </Field>
          <Field label="ふりがな">
            <input className="input" value={form.nameKana} onChange={(e) => setForm({ ...form, nameKana: e.target.value })} />
          </Field>
          <Field label="電話番号">
            <input className="input" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="090-0000-0000" />
          </Field>
          <Field label="メールアドレス">
            <input type="email" className="input" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          </Field>
          <Field label="流入元">
            <select className="input" value={form.source} onChange={(e) => setForm({ ...form, source: e.target.value })}>
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
            <input type="checkbox" checked={form.isLineFriend} onChange={(e) => setForm({ ...form, isLineFriend: e.target.checked })} />
            <span>LINE 友だち登録済み</span>
          </label>
          <Field label="メモ">
            <textarea className="input" rows={3} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
          </Field>
          <button type="submit" disabled={loading} className="w-full py-3 text-xs tracking-[0.2em] mt-2 disabled:opacity-50" style={{ background: '#1a1a1a', color: 'white' }}>
            {loading ? '作成中...' : '顧客を追加'}
          </button>
        </form>
      </Modal>
    </div>
  );
}
