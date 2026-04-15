'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Clock, Plus, Edit, Trash2 } from 'lucide-react';
import Modal, { Field } from '@/components/shared/Modal';
import { yen } from '@/lib/utils/format';
import type { Menu } from '@prisma/client';

const EMPTY = { id: '', name: '', category: 'ジェル', price: '', durationMinutes: '60', description: '', isActive: true };

export default function MenusClient({ menus }: { menus: Menu[] }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<typeof EMPTY>(EMPTY);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const byCategory: Record<string, Menu[]> = {};
  menus.forEach((m) => {
    if (!byCategory[m.category]) byCategory[m.category] = [];
    byCategory[m.category].push(m);
  });

  function openCreate() {
    setEditing(EMPTY);
    setError('');
    setOpen(true);
  }

  function openEdit(m: Menu) {
    setEditing({
      id: m.id,
      name: m.name,
      category: m.category,
      price: String(m.price),
      durationMinutes: String(m.durationMinutes),
      description: m.description || '',
      isActive: m.isActive,
    });
    setError('');
    setOpen(true);
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const url = editing.id ? `/api/menus/${editing.id}` : '/api/menus';
      const method = editing.id ? 'PATCH' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editing),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || '保存に失敗しました');
        return;
      }
      setOpen(false);
      router.refresh();
    } catch {
      setError('通信エラー');
    } finally {
      setLoading(false);
    }
  }

  async function del(id: string) {
    if (!confirm('このメニューを削除しますか？')) return;
    try {
      const res = await fetch(`/api/menus/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || '削除に失敗しました');
        return;
      }
      router.refresh();
    } catch {
      alert('通信エラー');
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-stone-900">メニュー管理</h1>
          <p className="text-sm text-stone-500 mt-1">全 {menus.length}メニュー</p>
        </div>
        <button onClick={openCreate} className="btn-brand"><Plus className="w-3 h-3" />新規メニュー</button>
      </div>

      {menus.length === 0 ? (
        <div className="card-box text-center py-10">
          <p className="text-sm text-stone-500 mb-4">メニューがまだ登録されていません。</p>
          <button onClick={openCreate} className="btn-brand">最初のメニューを追加</button>
        </div>
      ) : (
        Object.entries(byCategory).map(([cat, ms]) => (
          <div key={cat}>
            <h2 className="text-sm font-semibold text-stone-600 mb-3 uppercase tracking-wider">{cat}</h2>
            <div className="grid grid-cols-3 gap-4">
              {ms.map((m) => (
                <div key={m.id} className="card-box hover:border-pink-300 transition-colors">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold text-stone-900">{m.name}</h3>
                    {m.isActive ? <span className="badge badge-green">公開</span> : <span className="badge badge-gray">非公開</span>}
                  </div>
                  <p className="text-xs text-stone-500 mb-3 h-8">{m.description}</p>
                  <div className="flex items-center justify-between pt-3 border-t border-stone-100">
                    <div className="flex items-center gap-1 text-xs text-stone-500">
                      <Clock className="w-3 h-3" />{m.durationMinutes}分
                    </div>
                    <div className="font-bold brand-text">{yen(m.price)}</div>
                  </div>
                  <div className="mt-3 pt-3 border-t border-stone-100 flex gap-2">
                    <button onClick={() => openEdit(m)} className="btn-ghost text-xs flex-1 border border-stone-200"><Edit className="w-3 h-3" />編集</button>
                    <button onClick={() => del(m.id)} className="btn-ghost text-xs text-red-500 border border-red-200"><Trash2 className="w-3 h-3" /></button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))
      )}

      <Modal open={open} onClose={() => setOpen(false)} title={editing.id ? 'メニューを編集' : '新規メニューを追加'}>
        {error && <div className="mb-4 p-3 text-xs" style={{ background: '#fdf2f2', border: '1px solid #f0c8c8', color: '#8b2b2b' }}>{error}</div>}
        <form onSubmit={submit} className="space-y-4">
          <Field label="メニュー名" required>
            <input className="input" required value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} />
          </Field>
          <Field label="カテゴリ">
            <select className="input" value={editing.category} onChange={(e) => setEditing({ ...editing, category: e.target.value })}>
              <option>ジェル</option>
              <option>アート</option>
              <option>ケア</option>
              <option>フット</option>
              <option>オフ</option>
              <option>その他</option>
            </select>
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="価格(円)" required>
              <input type="number" className="input" required value={editing.price} onChange={(e) => setEditing({ ...editing, price: e.target.value })} />
            </Field>
            <Field label="所要時間(分)" required>
              <input type="number" className="input" required value={editing.durationMinutes} onChange={(e) => setEditing({ ...editing, durationMinutes: e.target.value })} />
            </Field>
          </div>
          <Field label="説明">
            <textarea className="input" rows={2} value={editing.description} onChange={(e) => setEditing({ ...editing, description: e.target.value })} />
          </Field>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={editing.isActive} onChange={(e) => setEditing({ ...editing, isActive: e.target.checked })} />
            <span>公開する(予約ページに表示)</span>
          </label>
          <button type="submit" disabled={loading} className="w-full py-3 text-xs tracking-[0.2em]" style={{ background: '#1a1a1a', color: 'white' }}>
            {loading ? '保存中...' : editing.id ? '変更を保存' : 'メニューを追加'}
          </button>
        </form>
      </Modal>
    </div>
  );
}
