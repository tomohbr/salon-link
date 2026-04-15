import { getPublicSalonBySlug } from '@/lib/salonData';
import { notFound } from 'next/navigation';
import { yen } from '@/lib/utils/format';
import { Sparkles, MapPin, Phone, Heart, Ticket } from 'lucide-react';

export default async function BookPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const salon = await getPublicSalonBySlug(slug);
  if (!salon) return notFound();

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 to-white">
      <div className="max-w-md mx-auto bg-white min-h-screen shadow-xl">
        <div className="brand-bg text-white p-6">
          <div className="flex items-center gap-2 text-xs mb-3 opacity-80">
            <Sparkles className="w-3 h-3" />Powered by SalonLink
          </div>
          <h1 className="text-2xl font-bold">{salon.name}</h1>
          <p className="text-xs opacity-90 mt-1">{salon.description}</p>
          <div className="mt-4 space-y-1 text-xs">
            {salon.address && <div className="flex items-center gap-2"><MapPin className="w-3 h-3" />{salon.address}</div>}
            {salon.phone && <div className="flex items-center gap-2"><Phone className="w-3 h-3" />{salon.phone}</div>}
          </div>
        </div>

        {salon.coupons.length > 0 && (
          <div className="p-4">
            <h2 className="text-sm font-bold text-stone-900 mb-2 flex items-center gap-2">
              <Ticket className="w-4 h-4 brand-text" />ご利用いただけるクーポン
            </h2>
            <div className="space-y-2">
              {salon.coupons.map(c => (
                <div key={c.id} className="brand-light-bg border-2 brand-border rounded-lg p-3 flex items-center gap-3">
                  <div className="flex-1">
                    <div className="font-semibold text-sm text-stone-900">{c.title}</div>
                    <div className="text-xs text-stone-600">{c.description}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-xl font-bold brand-text">
                      {c.discountType === 'percent' ? `${c.discountValue}%` : yen(c.discountValue)}
                    </div>
                    <div className="text-[10px] text-stone-500">OFF</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="p-4">
          <h2 className="text-sm font-bold text-stone-900 mb-3">メニューを選ぶ</h2>
          {salon.menus.length === 0 ? (
            <p className="text-sm text-stone-500 py-6 text-center">メニュー準備中です</p>
          ) : (
            <div className="space-y-2">
              {salon.menus.map(m => (
                <div key={m.id} className="border border-stone-200 rounded-xl p-4 hover:border-pink-300 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-sm">{m.name}</h3>
                      <p className="text-xs text-stone-500 mt-0.5">{m.description}</p>
                      <div className="text-xs text-stone-500 mt-1">所要時間: {m.durationMinutes}分</div>
                    </div>
                    <div className="text-right ml-3">
                      <div className="font-bold brand-text">{yen(m.price)}</div>
                      <button className="btn-brand text-xs mt-2">予約へ進む</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {salon.designs.length > 0 && (
          <div className="p-4">
            <h2 className="text-sm font-bold text-stone-900 mb-3">デザインギャラリー</h2>
            <div className="grid grid-cols-3 gap-2">
              {salon.designs.slice(0, 6).map(d => (
                <div key={d.id} className="aspect-square rounded-lg bg-gradient-to-br from-pink-100 via-purple-100 to-amber-100 flex flex-col items-center justify-center p-2">
                  <Sparkles className="w-5 h-5 text-white/70 mb-1" />
                  <div className="text-[9px] text-center text-stone-600 font-medium truncate w-full">{d.title}</div>
                  <div className="flex items-center gap-0.5 mt-0.5">
                    <Heart className="w-2.5 h-2.5 fill-pink-400 text-pink-400" />
                    <span className="text-[9px] text-stone-500">{d.likesCount}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="p-4 pb-8">
          <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-center">
            <div className="text-2xl mb-2">💬</div>
            <h3 className="font-bold text-sm text-stone-900">LINE友だち追加でクーポン受取</h3>
            <button className="mt-3 bg-green-500 text-white text-sm font-semibold px-6 py-2 rounded-lg">LINEで友だち追加</button>
          </div>
        </div>
      </div>
    </div>
  );
}
