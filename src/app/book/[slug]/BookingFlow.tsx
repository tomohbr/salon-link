'use client';
import { useState, useEffect } from 'react';
import { Sparkles, MapPin, Phone, Heart, Ticket, ChevronLeft, Check, Clock, CalendarDays } from 'lucide-react';

type Menu = { id: string; name: string; category: string; price: number; durationMinutes: number; description: string | null };
type Coupon = { id: string; title: string; description: string | null; discountType: string; discountValue: number };
type Design = { id: string; title: string; likesCount: number };
type Slot = { time: string; available: boolean; reason?: string };

const yen = (n: number) => `¥${n.toLocaleString('ja-JP')}`;

export default function BookingFlow({
  slug,
  source,
  salon,
  menus,
  coupons,
  designs,
}: {
  slug: string;
  source: 'line' | 'web';
  salon: { name: string; description: string | null; address: string | null; phone: string | null };
  menus: Menu[];
  coupons: Coupon[];
  designs: Design[];
}) {
  type Step = 'menu' | 'date' | 'slot' | 'info' | 'done';
  const [step, setStep] = useState<Step>('menu');
  const [selectedMenu, setSelectedMenu] = useState<Menu | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [slots, setSlots] = useState<Slot[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState<{ date: string; startTime: string; endTime: string; menuName: string; menuPrice: number } | null>(null);

  // 空き枠取得
  useEffect(() => {
    if (step !== 'slot' || !selectedMenu || !selectedDate) return;
    setLoadingSlots(true);
    fetch(`/api/book/slots?slug=${slug}&date=${selectedDate}&menuId=${selectedMenu.id}`)
      .then((r) => r.json())
      .then((data) => {
        setSlots(data.slots || []);
        setLoadingSlots(false);
      })
      .catch(() => {
        setSlots([]);
        setLoadingSlots(false);
      });
  }, [step, selectedMenu, selectedDate, slug]);

  // 次の14日間の日付を生成
  const nextDays = Array.from({ length: 14 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    return {
      iso: d.toISOString().slice(0, 10),
      label: `${d.getMonth() + 1}/${d.getDate()}`,
      dow: ['日', '月', '火', '水', '木', '金', '土'][d.getDay()],
      isWeekend: d.getDay() === 0 || d.getDay() === 6,
    };
  });

  async function handleSubmit() {
    if (!selectedMenu) return;
    setSubmitting(true);
    setError('');
    try {
      const res = await fetch('/api/book/reserve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slug,
          menuId: selectedMenu.id,
          date: selectedDate,
          startTime: selectedTime,
          customerName,
          phone,
          email,
          source,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || '予約に失敗しました');
        setSubmitting(false);
        return;
      }
      setResult(data.reservation);
      setStep('done');
    } catch {
      setError('通信エラー');
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 to-white">
      <div className="max-w-md mx-auto bg-white min-h-screen shadow-xl">
        {/* Header */}
        <div className="brand-bg text-white p-6">
          <div className="flex items-center gap-2 text-xs mb-3 opacity-80">
            <Sparkles className="w-3 h-3" />
            {source === 'line' ? 'LINE予約' : '自社HP予約'} · Powered by SalonLink
          </div>
          <h1 className="text-2xl font-bold">{salon.name}</h1>
          {step === 'menu' && (
            <>
              <p className="text-xs opacity-90 mt-1">{salon.description}</p>
              <div className="mt-4 space-y-1 text-xs">
                {salon.address && <div className="flex items-center gap-2"><MapPin className="w-3 h-3" />{salon.address}</div>}
                {salon.phone && <div className="flex items-center gap-2"><Phone className="w-3 h-3" />{salon.phone}</div>}
              </div>
            </>
          )}
        </div>

        {/* ステップインジケータ */}
        {step !== 'menu' && step !== 'done' && (
          <div className="p-4 border-b border-stone-100">
            <button
              onClick={() => setStep(step === 'info' ? 'slot' : step === 'slot' ? 'date' : 'menu')}
              className="inline-flex items-center gap-1 text-sm text-stone-500 hover:text-stone-800"
            >
              <ChevronLeft className="w-4 h-4" />戻る
            </button>
          </div>
        )}

        {/* Step 1: メニュー選択 */}
        {step === 'menu' && (
          <>
            {coupons.length > 0 && (
              <div className="p-4">
                <h2 className="text-sm font-bold text-stone-900 mb-2 flex items-center gap-2">
                  <Ticket className="w-4 h-4 brand-text" />ご利用いただけるクーポン
                </h2>
                <div className="space-y-2">
                  {coupons.map((c) => (
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
              {menus.length === 0 ? (
                <p className="text-sm text-stone-500 py-6 text-center">メニュー準備中です</p>
              ) : (
                <div className="space-y-2">
                  {menus.map((m) => (
                    <button
                      key={m.id}
                      onClick={() => {
                        setSelectedMenu(m);
                        setStep('date');
                      }}
                      className="w-full border border-stone-200 rounded-xl p-4 text-left hover:border-pink-300 transition-colors"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-semibold text-sm">{m.name}</h3>
                          <p className="text-xs text-stone-500 mt-0.5">{m.description}</p>
                          <div className="flex items-center gap-2 text-xs text-stone-500 mt-1">
                            <Clock className="w-3 h-3" />{m.durationMinutes}分
                          </div>
                        </div>
                        <div className="text-right ml-3">
                          <div className="font-bold brand-text">{yen(m.price)}</div>
                          <div className="mt-2 text-xs brand-text font-semibold">予約へ進む →</div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {designs.length > 0 && (
              <div className="p-4">
                <h2 className="text-sm font-bold text-stone-900 mb-3">デザインギャラリー</h2>
                <div className="grid grid-cols-3 gap-2">
                  {designs.map((d) => (
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
          </>
        )}

        {/* Step 2: 日付選択 */}
        {step === 'date' && selectedMenu && (
          <div className="p-4">
            <div className="card-box brand-light-bg mb-4">
              <div className="text-xs text-stone-500">選択中のメニュー</div>
              <div className="font-semibold text-sm mt-1">{selectedMenu.name}</div>
              <div className="text-xs text-stone-600">{selectedMenu.durationMinutes}分 · {yen(selectedMenu.price)}</div>
            </div>
            <h2 className="text-sm font-bold text-stone-900 mb-3 flex items-center gap-2">
              <CalendarDays className="w-4 h-4" />ご希望の日付
            </h2>
            <div className="grid grid-cols-4 gap-2">
              {nextDays.map((d) => (
                <button
                  key={d.iso}
                  onClick={() => {
                    setSelectedDate(d.iso);
                    setStep('slot');
                  }}
                  className="p-3 border border-stone-200 rounded-lg hover:border-pink-300 hover:brand-light-bg transition-colors"
                >
                  <div className={`text-[10px] ${d.dow === '日' ? 'text-red-500' : d.dow === '土' ? 'text-blue-500' : 'text-stone-500'}`}>{d.dow}</div>
                  <div className="font-semibold text-sm">{d.label}</div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 3: 時間枠選択 */}
        {step === 'slot' && selectedMenu && (
          <div className="p-4">
            <div className="card-box brand-light-bg mb-4">
              <div className="text-xs text-stone-500">選択中</div>
              <div className="font-semibold text-sm mt-1">{selectedMenu.name}</div>
              <div className="text-xs text-stone-600">{selectedDate} · {selectedMenu.durationMinutes}分 · {yen(selectedMenu.price)}</div>
            </div>
            <h2 className="text-sm font-bold text-stone-900 mb-3 flex items-center gap-2">
              <Clock className="w-4 h-4" />空いている時間
            </h2>
            {loadingSlots ? (
              <p className="text-sm text-stone-500 py-6 text-center">空き枠を確認中...</p>
            ) : slots.length === 0 ? (
              <p className="text-sm text-stone-500 py-6 text-center">枠情報を取得できません</p>
            ) : slots.every((s) => !s.available) ? (
              <div className="p-4 bg-stone-50 rounded-lg text-center text-sm text-stone-500">
                {slots[0]?.reason === 'closed' ? 'この日は定休日です' : 'この日の空き枠はありません'}
              </div>
            ) : (
              <>
                <div className="text-[10px] text-stone-500 mb-2">
                  HPB・LINE・自社HPからの全予約を元に空き枠を表示しています
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {slots.map((s) => (
                    <button
                      key={s.time}
                      disabled={!s.available}
                      onClick={() => {
                        setSelectedTime(s.time);
                        setStep('info');
                      }}
                      className={`py-2 rounded-lg text-sm font-semibold transition-colors ${
                        s.available
                          ? 'border border-stone-200 hover:border-pink-400 hover:brand-light-bg'
                          : 'bg-stone-100 text-stone-400 line-through cursor-not-allowed'
                      }`}
                    >
                      {s.time}
                    </button>
                  ))}
                </div>
                <div className="mt-4 text-[10px] text-stone-400 flex items-center gap-3">
                  <span>◯ 空き</span>
                  <span>× 予約済み（他チャネル含む）</span>
                </div>
              </>
            )}
          </div>
        )}

        {/* Step 4: 顧客情報 */}
        {step === 'info' && selectedMenu && (
          <div className="p-4">
            <div className="card-box brand-light-bg mb-4">
              <div className="text-xs text-stone-500">ご予約内容</div>
              <div className="font-semibold text-sm mt-1">{selectedMenu.name}</div>
              <div className="text-xs text-stone-600">{selectedDate} {selectedTime}〜 · {yen(selectedMenu.price)}</div>
            </div>
            {error && <div className="mb-3 p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700">{error}</div>}
            <h2 className="text-sm font-bold text-stone-900 mb-3">お客様情報</h2>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-stone-700 mb-1">お名前 *</label>
                <input className="input" value={customerName} onChange={(e) => setCustomerName(e.target.value)} placeholder="山田 花子" />
              </div>
              <div>
                <label className="block text-xs font-medium text-stone-700 mb-1">電話番号</label>
                <input className="input" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="090-0000-0000" />
              </div>
              <div>
                <label className="block text-xs font-medium text-stone-700 mb-1">メールアドレス</label>
                <input className="input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="hanako@example.com" />
              </div>
              <button
                onClick={handleSubmit}
                disabled={!customerName || submitting}
                className="w-full btn-brand justify-center py-3 mt-4"
              >
                {submitting ? '予約中...' : 'この内容で予約する'}
              </button>
            </div>
          </div>
        )}

        {/* Step 5: 完了 */}
        {step === 'done' && result && (
          <div className="p-4">
            <div className="text-center py-8">
              <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4">
                <Check className="w-8 h-8 text-emerald-600" />
              </div>
              <h2 className="text-xl font-bold text-stone-900 mb-2">予約完了！</h2>
              <p className="text-sm text-stone-600">ご来店お待ちしております🌸</p>
            </div>
            <div className="card-box">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-stone-500">メニュー</span><span className="font-medium">{result.menuName}</span></div>
                <div className="flex justify-between"><span className="text-stone-500">日時</span><span className="font-medium">{result.date} {result.startTime}〜{result.endTime}</span></div>
                <div className="flex justify-between"><span className="text-stone-500">お支払い</span><span className="font-medium">{yen(result.menuPrice)}</span></div>
              </div>
            </div>
            <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg text-xs text-stone-700">
              💬 LINE友だち追加で、リマインド通知や次回クーポンをお届けします
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
