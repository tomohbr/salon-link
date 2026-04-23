'use client';
// 精算ボタン + Bottom-sheet モーダル
// 3x2 グリッド: 現金 / クレジット / QR / COIN+ / HPBポイント / その他
//
// 使い方:
//   <PaymentButton reservationId={r.id} defaultAmount={r.menuPrice ?? 0} />

import { useState, useTransition } from 'react';
import { CreditCard, Banknote, QrCode, Coins, Gift, MoreHorizontal, X } from 'lucide-react';
import { recordPayment } from '@/app/(dashboard)/reservations/payment-actions';
import { useToast } from './Toaster';
import { yen } from '@/lib/utils/format';

type Method = 'cash' | 'credit' | 'qr' | 'coin' | 'point' | 'other';

const METHODS: Array<{ id: Method; label: string; icon: React.ComponentType<{ className?: string }> }> = [
  { id: 'cash', label: '現金', icon: Banknote },
  { id: 'credit', label: 'クレジット', icon: CreditCard },
  { id: 'qr', label: 'QR決済', icon: QrCode },
  { id: 'coin', label: 'COIN+', icon: Coins },
  { id: 'point', label: 'HPBポイント', icon: Gift },
  { id: 'other', label: 'その他', icon: MoreHorizontal },
];

export default function PaymentButton({
  reservationId,
  defaultAmount,
  buttonLabel = '精算する',
  buttonClassName = 'btn-brand text-xs',
}: {
  reservationId: string;
  defaultAmount: number;
  buttonLabel?: string;
  buttonClassName?: string;
}) {
  const [open, setOpen] = useState(false);
  const [method, setMethod] = useState<Method>('cash');
  const [paidAmount, setPaidAmount] = useState(String(defaultAmount));
  const [retailAmount, setRetailAmount] = useState('0');
  const [tip, setTip] = useState('0');
  const [designationFee, setDesignationFee] = useState('0');
  const [pending, startTransition] = useTransition();
  const toast = useToast();

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const fd = new FormData();
    fd.set('reservationId', reservationId);
    fd.set('paymentMethod', method);
    fd.set('paidAmount', paidAmount);
    fd.set('retailAmount', retailAmount);
    fd.set('tip', tip);
    fd.set('designationFee', designationFee);
    startTransition(async () => {
      const res = await recordPayment(fd);
      if (res.ok) {
        toast.success(`精算完了 ${yen(Number(paidAmount) + Number(retailAmount) + Number(tip) + Number(designationFee))}`);
        setOpen(false);
      } else {
        toast.error(res.error || '精算に失敗しました');
      }
    });
  }

  const total = Number(paidAmount || 0) + Number(retailAmount || 0) + Number(tip || 0) + Number(designationFee || 0);

  return (
    <>
      <button onClick={() => setOpen(true)} className={buttonClassName}>
        <CreditCard className="w-3 h-3" />{buttonLabel}
      </button>

      {open && (
        <div className="modal-sheet-bg" onClick={() => setOpen(false)}>
          <div
            className="modal-sheet sm:max-w-md sm:w-full sm:mx-auto sm:my-auto sm:rounded-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-5" style={{ borderBottom: '1px solid var(--gray-200)' }}>
              <h2 className="text-base font-bold" style={{ color: 'var(--gray-900)' }}>精算</h2>
              <button onClick={() => setOpen(false)} aria-label="閉じる">
                <X className="w-5 h-5" style={{ color: 'var(--gray-500)' }} />
              </button>
            </div>

            <form onSubmit={submit} className="p-6 space-y-5">
              {/* 支払い方法 3x2 グリッド */}
              <div>
                <label className="block text-[10px] tracking-[0.15em] uppercase mb-2" style={{ color: 'var(--gray-500)' }}>支払い方法</label>
                <div className="grid grid-cols-3 gap-2">
                  {METHODS.map((m) => {
                    const Icon = m.icon;
                    const active = method === m.id;
                    return (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => setMethod(m.id)}
                        className="flex flex-col items-center gap-1.5 py-3 px-2 rounded-md text-xs transition-all"
                        style={{
                          background: active ? 'var(--brand-warm)' : 'white',
                          border: `1px solid ${active ? 'var(--brand)' : 'var(--gray-200)'}`,
                          color: active ? 'var(--brand)' : 'var(--gray-700)',
                          fontWeight: active ? 600 : 500,
                        }}
                      >
                        <Icon className="w-5 h-5" />
                        {m.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 金額入力 */}
              <div className="grid grid-cols-2 gap-3">
                <FieldNum label="施術金額" value={paidAmount} onChange={setPaidAmount} />
                <FieldNum label="店販" value={retailAmount} onChange={setRetailAmount} />
                <FieldNum label="チップ" value={tip} onChange={setTip} />
                <FieldNum label="指名料" value={designationFee} onChange={setDesignationFee} />
              </div>

              {/* 合計 */}
              <div
                className="flex items-baseline justify-between p-4 rounded-md"
                style={{ background: 'var(--gray-50)' }}
              >
                <span className="text-xs" style={{ color: 'var(--gray-500)' }}>合計</span>
                <span className="text-2xl font-bold tabular" style={{ color: 'var(--brand)' }}>
                  {yen(total)}
                </span>
              </div>

              <button
                type="submit"
                disabled={pending}
                className="w-full py-3.5 text-xs tracking-[0.2em] font-bold disabled:opacity-50"
                style={{ background: 'var(--gray-900)', color: 'white', borderRadius: 'var(--r-md)' }}
              >
                {pending ? '記録中...' : '精算を確定する'}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

function FieldNum({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <label className="block text-[10px] tracking-[0.15em] uppercase mb-1.5" style={{ color: 'var(--gray-500)' }}>{label}</label>
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs" style={{ color: 'var(--gray-400)' }}>¥</span>
        <input
          type="number"
          inputMode="numeric"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="input pl-7 tabular text-right"
          min="0"
        />
      </div>
    </div>
  );
}
