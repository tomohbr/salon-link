'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Heart, Sparkles, Plus, Trash2 } from 'lucide-react';
import Modal, { Field } from '@/components/shared/Modal';
import type { NailDesign } from '@prisma/client';

export default function DesignsClient({ designs }: { designs: NailDesign[] }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ title: '', category: 'ニュアンス', photoUrl: '', tags: '', isPublished: true });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/designs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          tags: form.tags.split(/[,、\s]+/).filter(Boolean),
        }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || '追加に失敗しました'); return; }
      setOpen(false);
      setForm({ title: '', category: 'ニュアンス', photoUrl: '', tags: '', isPublished: true });
      router.refresh();
    } catch { setError('通信エラー'); } finally { setLoading(false); }
  }

  async function del(id: string) {
    if (!confirm('このデザインを削除しますか？')) return;
    try {
      const res = await fetch(`/api/designs/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) { alert(data.error); return; }
      router.refresh();
    } catch { alert('通信エラー'); }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-stone-900">デザインギャラリー</h1>
          <p className="text-sm text-stone-500 mt-1">公開中 {designs.filter((d) => d.isPublished).length}デザイン</p>
        </div>
        <button onClick={() => setOpen(true)} className="btn-brand"><Plus className="w-3 h-3" />デザイン追加</button>
      </div>

      <div className="card-box brand-light-bg border-pink-200">
        <div className="flex items-start gap-3">
          <Sparkles className="w-5 h-5 brand-text mt-0.5" />
          <div>
            <h3 className="font-semibold brand-text">差別化機能:デザインギャラリー</h3>
            <p className="text-xs text-stone-600 mt-1">
              予約ページからそのまま「このデザインで」と選んでいただける集客導線です。
            </p>
          </div>
        </div>
      </div>

      {designs.length === 0 ? (
        <div className="card-box text-center py-10">
          <p className="text-sm text-stone-500 mb-4">デザインがまだ登録されていません。</p>
          <button onClick={() => setOpen(true)} className="btn-brand">最初のデザインを追加</button>
        </div>
      ) : (
        <div className="grid grid-cols-4 gap-4">
          {designs.map((d) => (
            <div key={d.id} className="card-box p-3 hover:shadow-md transition-shadow">
              <div className="aspect-square rounded-lg bg-gradient-to-br from-pink-100 via-purple-100 to-amber-100 flex items-center justify-center mb-3 overflow-hidden">
                {d.photoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={d.photoUrl} alt={d.title} className="w-full h-full object-cover" />
                ) : (
                  <Sparkles className="w-8 h-8 text-white/70" />
                )}
              </div>
              <h3 className="font-semibold text-sm text-stone-900">{d.title}</h3>
              <div className="text-xs text-stone-500 mt-0.5">{d.category}</div>
              <div className="flex items-center gap-2 mt-3">
                {d.isPublished ? <span className="badge badge-green">公開</span> : <span className="badge badge-gray">非公開</span>}
                <div className="ml-auto flex items-center gap-1 text-xs text-stone-500">
                  <Heart className="w-3 h-3 fill-pink-400 text-pink-400" />{d.likesCount}
                </div>
              </div>
              <button onClick={() => del(d.id)} className="mt-2 w-full btn-ghost text-xs text-red-500 border border-red-200">
                <Trash2 className="w-3 h-3" />削除
              </button>
            </div>
          ))}
        </div>
      )}

      <Modal open={open} onClose={() => setOpen(false)} title="新規デザインを追加">
        {error && <div className="mb-4 p-3 text-xs" style={{ background: '#fdf2f2', border: '1px solid #f0c8c8', color: '#8b2b2b' }}>{error}</div>}
        <form onSubmit={submit} className="space-y-4">
          <Field label="タイトル" required>
            <input className="input" required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="ミルキーホワイト×ゴールド" />
          </Field>
          <Field label="カテゴリ">
            <select className="input" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
              <option>ニュアンス</option>
              <option>フレンチ</option>
              <option>ワンカラー</option>
              <option>グラデーション</option>
              <option>マグネット</option>
              <option>アート</option>
              <option>シンプル</option>
              <option>ブライダル</option>
              <option>その他</option>
            </select>
          </Field>
          <Field label="写真URL" hint="Instagram等の公開URL、または画像ホスティングのURL">
            <input className="input" value={form.photoUrl} onChange={(e) => setForm({ ...form, photoUrl: e.target.value })} placeholder="https://..." />
          </Field>
          <Field label="タグ" hint="カンマ区切りで複数指定可">
            <input className="input" value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} placeholder="上品, オフィス, 秋冬" />
          </Field>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={form.isPublished} onChange={(e) => setForm({ ...form, isPublished: e.target.checked })} />
            <span>公開する(予約ページに表示)</span>
          </label>
          <button type="submit" disabled={loading} className="w-full py-3 text-xs tracking-[0.2em]" style={{ background: '#1a1a1a', color: 'white' }}>
            {loading ? '追加中...' : 'デザインを追加'}
          </button>
        </form>
      </Modal>
    </div>
  );
}
