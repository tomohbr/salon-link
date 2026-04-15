import { getSalonData } from '@/lib/salonData';
import { fmtDate, pct } from '@/lib/utils/format';
import { MessageSquare, Send } from 'lucide-react';

export default async function MessagesPage() {
  const { messages, customers } = await getSalonData();
  const lineFriends = customers.filter(c => c.isLineFriend).length;
  const today = new Date();
  const dormant = customers.filter(c => {
    if (!c.lastVisitDate) return false;
    const days = Math.floor((today.getTime() - new Date(c.lastVisitDate).getTime()) / 86400000);
    return days >= 90;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-stone-900">LINEメッセージ配信</h1>
          <p className="text-sm text-stone-500 mt-1">LINE友だち {lineFriends}名</p>
        </div>
        <button className="btn-brand"><Send className="w-4 h-4" />新規配信</button>
      </div>

      <div className="card-box">
        <h2 className="font-semibold text-stone-900 mb-4">おすすめセグメント配信</h2>
        <div className="grid grid-cols-3 gap-3">
          <SegmentCard icon="🔔" label="休眠復帰" count={dormant.length} desc="90日以上来店なし" cta="復帰クーポンを送る" />
          <SegmentCard icon="💎" label="VIP層" count={customers.filter(c => c.tags.includes('vip')).length} desc="累計売上上位" cta="新作案内を送る" />
          <SegmentCard icon="🎉" label="新規→2回目誘導" count={customers.filter(c => c.visitCount === 1 && c.isLineFriend).length} desc="初回来店のみ" cta="2回目特典を送る" />
        </div>
      </div>

      <div className="card-box">
        <h2 className="font-semibold text-stone-900 mb-4">配信履歴</h2>
        {messages.length === 0 ? (
          <p className="text-sm text-stone-500 py-6 text-center">まだ配信履歴はありません</p>
        ) : (
          <div className="space-y-3">
            {messages.map(m => (
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
                <p className="text-sm text-stone-600 mb-3">{m.content}</p>
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
    </div>
  );
}

function SegmentCard({ icon, label, count, desc, cta }: { icon: string; label: string; count: number; desc: string; cta: string }) {
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
      <button className="w-full btn-brand text-xs justify-center">{cta}</button>
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
