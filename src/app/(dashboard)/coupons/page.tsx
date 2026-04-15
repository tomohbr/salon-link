import { getSalonData } from '@/lib/salonData';
import { yen, fmtDate } from '@/lib/utils/format';
import { Ticket, Users, Calendar } from 'lucide-react';

export default async function CouponsPage() {
  const { coupons } = await getSalonData();

  const segmentLabel = (s: string) => ({ all: '全顧客', new: '新規顧客', dormant: '休眠顧客', line_friend: 'LINE友だち', vip: 'VIP顧客' }[s] || s);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-stone-900">クーポン管理</h1>
          <p className="text-sm text-stone-500 mt-1">稼働中 {coupons.filter(c => c.isActive).length}件</p>
        </div>
        <button className="btn-brand">+ 新規クーポン</button>
      </div>

      {coupons.length === 0 ? (
        <div className="card-box text-center py-10">
          <p className="text-sm text-stone-500">クーポンがまだ作成されていません。</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4">
          {coupons.map(c => (
            <div key={c.id} className="card-box border-l-4" style={{ borderLeftColor: '#e11d74' }}>
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Ticket className="w-4 h-4 brand-text" />
                  <h3 className="font-semibold text-stone-900">{c.title}</h3>
                </div>
                {c.isActive ? <span className="badge badge-green">配信中</span> : <span className="badge badge-gray">停止</span>}
              </div>
              <p className="text-xs text-stone-500 mb-3">{c.description}</p>
              <div className="flex items-baseline gap-2 mb-3">
                <span className="text-2xl font-bold brand-text">
                  {c.discountType === 'percent' ? `${c.discountValue}%` : yen(c.discountValue)}
                </span>
                <span className="text-xs text-stone-500">OFF</span>
                {c.minPurchase > 0 && <span className="text-xs text-stone-400 ml-auto">{yen(c.minPurchase)}以上</span>}
              </div>
              <div className="grid grid-cols-3 gap-2 text-xs">
                <div className="flex items-center gap-1 text-stone-500"><Users className="w-3 h-3" />{segmentLabel(c.targetSegment)}</div>
                <div className="flex items-center gap-1 text-stone-500"><Calendar className="w-3 h-3" />{c.validUntil ? fmtDate(c.validUntil) : '無期限'}</div>
                <div className="text-stone-500 text-right">利用 {c.usedCount}/{c.maxUses || '∞'}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
