'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { MessageSquare, Send } from 'lucide-react';
import Modal, { Field } from '@/components/shared/Modal';
import { fmtDate, pct } from '@/lib/utils/format';
import type { Message, Customer } from '@prisma/client';

export default function MessagesClient({ messages, customers }: { messages: Message[]; customers: Customer[] }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ title: '', content: '', targetSegment: 'all' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState<{ sent: number; note?: string } | null>(null);

  const lineFriends = customers.filter((c) => c.isLineFriend).length;
  const today = new Date();
  const dormantCount = customers.filter((c) => {
    if (!c.lastVisitDate || !c.isLineFriend) return false;
    const days = Math.floor((today.getTime() - new Date(c.lastVisitDate).getTime()) / 86400000);
    return days >= 90;
  }).length;
  const vipCount = customers.filter((c) => c.isLineFriend && (c.visitCount >= 10 || c.totalSpent >= 100000)).length;
  const newCount = customers.filter((c) => c.visitCount === 1 && c.isLineFriend).length;

  function openCompose(segment = 'all') {
    setForm({ title: '', content: '', targetSegment: segment });
    setError('');
    setResult(null);
    setOpen(true);
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/messages/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || '送信に失敗しました');
        return;
      }
      setResult({ sent: data.sent, note: data.note });
      router.refresh();
    } catch {
      setError('通信エラー');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-stone-900">LINEメッセージ配信</h1>
          <p className="text-sm text-stone-500 mt-1">LINE友だち {lineFriends}名</p>
        </div>
        <button onClick={() => openCompose('all')} className="btn-brand">
          <Send className="w-4 h-4" />新規配信
        </button>
      </div>

      <div className="card-box">
        <h2 className="font-semibold text-stone-900 mb-4">おすすめセグメント配信</h2>
        <div className="grid grid-cols-3 gap-3">
          <SegmentCard icon="🔔" label="休眠復帰" count={dormantCount} desc="90日以上来店なし" cta="復帰クーポンを送る" onClick={() => openCompose('dormant')} />
          <SegmentCard icon="💎" label="VIP層" count={vipCount} desc="累計売上上位" cta="新作案内を送る" onClick={() => openCompose('vip')} />
          <SegmentCard icon="🎉" label="新規→2回目誘導" count={newCount} desc="初回来店のみ" cta="2回目特典を送る" onClick={() => openCompose('new')} />
        </div>
      </div>

      <div className="card-box">
        <h2 className="font-semibold text-stone-900 mb-4">配信履歴</h2>
        {messages.length === 0 ? (
          <p className="text-sm text-stone-500 py-6 text-center">まだ配信履歴はありません</p>
        ) : (
          <div className="space-y-3">
            {messages.map((m) => (
              <div key={m.id} className="p-4 bg-stone-50 rounded-lg border border-stone-100">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-stone-400" />
                    <span className="font-semibold text-sm">{m.title}</span>
                    <span className={`badge ${m.type === 'broadcast' ? 'badge-blue' : m.type === 'segment' ? 'badge-brand' : 'badge-gray'}`}>
                      {m.type === 'broadcast' ? '一斉' : m.type === 'segment' ? 'セグメント' : m.type}
                    </span>
                  </div>
                  <span className="text-xs text-stone-400">{m.sentAt ? fmtDate(m.sentAt) : '未送信'}</span>
                </div>
                <p className="text-sm text-stone-600 mb-3 whitespace-pre-wrap">{m.content}</p>
                <div className="grid grid-cols-3 gap-4 text-xs">
                  <Stat label="配信数" value={`${m.sentCount}`} />
                  <Stat label="開封率" value={pct(m.sentCount > 0 ? m.openedCount / m.sentCount : 0)} />
                  <Stat label="クリック率" value={pct(m.sentCount > 0 ? m.clickedCount / m.sentCount : 0)} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Modal open={open} onClose={() => setOpen(false)} title="LINEメッセージ配信">
        {result ? (
          <div>
            <div className="p-4 mb-4" style={{ background: '#ecfdf5', border: '1px solid #a7f3d0' }}>
              <p className="text-sm font-bold" style={{ color: '#065f46' }}>✓ 配信完了</p>
              <p className="text-xs mt-2" style={{ color: '#065f46' }}>
                {result.sent} 名に送信しました
              </p>
              {result.note && <p className="text-xs mt-2" style={{ color: '#854d0e' }}>{result.note}</p>}
            </div>
            <button onClick={() => setOpen(false)} className="w-full py-3 text-xs tracking-[0.2em]" style={{ background: '#1a1a1a', color: 'white' }}>
              閉じる
            </button>
          </div>
        ) : (
          <form onSubmit={submit} className="space-y-4">
            {error && <div className="p-3 text-xs" style={{ background: '#fdf2f2', border: '1px solid #f0c8c8', color: '#8b2b2b' }}>{error}</div>}
            <Field label="配信タイトル" required>
              <input className="input" required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="新作ネイル入荷のお知らせ" />
            </Field>
            <Field label="対象">
              <select className="input" value={form.targetSegment} onChange={(e) => setForm({ ...form, targetSegment: e.target.value })}>
                <option value="all">全LINE友だち ({lineFriends}名)</option>
                <option value="dormant">休眠顧客のみ ({dormantCount}名)</option>
                <option value="vip">VIP顧客のみ ({vipCount}名)</option>
                <option value="new">新規(初回)のみ ({newCount}名)</option>
              </select>
            </Field>
            <Field label="本文" required>
              <textarea className="input" rows={6} required value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} placeholder={`例) \n秋の新作デザインが入荷しました🍂\nご予約はLINEからどうぞ。`} />
            </Field>
            <div className="p-3 text-xs" style={{ background: '#f5efec', color: '#4a3a44' }}>
              💡 LINE_CHANNEL_ACCESS_TOKEN が未設定の場合、送信はモックとなりログのみに記録されます。
              設定ページから LINE Access Token を登録してください。
            </div>
            <button type="submit" disabled={loading} className="w-full py-3 text-xs tracking-[0.2em]" style={{ background: '#1a1a1a', color: 'white' }}>
              {loading ? '送信中...' : '配信する'}
            </button>
          </form>
        )}
      </Modal>
    </div>
  );
}

function SegmentCard({ icon, label, count, desc, cta, onClick }: { icon: string; label: string; count: number; desc: string; cta: string; onClick: () => void }) {
  return (
    <div className="border border-stone-200 rounded-xl p-4 hover:border-pink-300 transition-colors">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-2xl">{icon}</span>
        <div>
          <div className="font-semibold text-sm">{label}</div>
          <div className="text-xs text-stone-500">{desc}</div>
        </div>
      </div>
      <div className="text-2xl font-bold brand-text mb-2">{count}名</div>
      <button onClick={onClick} className="w-full btn-brand text-xs justify-center">{cta}</button>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-stone-500">{label}</div>
      <div className="font-semibold text-stone-900 mt-0.5">{value}</div>
    </div>
  );
}
