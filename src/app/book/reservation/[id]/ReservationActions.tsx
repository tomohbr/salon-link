'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { X, AlertTriangle } from 'lucide-react';

export default function ReservationActions({ reservationId, accessCode }: { reservationId: string; accessCode: string }) {
  const router = useRouter();
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function cancel() {
    setError('');
    setLoading(true);
    try {
      const res = await fetch(`/api/book/cancel/${reservationId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: accessCode }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'キャンセルに失敗しました');
        setLoading(false);
        return;
      }
      router.refresh();
      setShowConfirm(false);
    } catch {
      setError('通信エラー');
      setLoading(false);
    }
  }

  return (
    <div className="p-4 space-y-2">
      <button
        onClick={() => setShowConfirm(true)}
        className="w-full py-3 text-xs tracking-[0.2em] font-bold transition-opacity hover:opacity-80"
        style={{ color: '#991b1b', border: '1px solid #fecaca', borderRadius: 'var(--r-md)', background: 'white' }}
      >
        ご予約をキャンセルする
      </button>

      {showConfirm && (
        <div className="modal-sheet-bg" onClick={() => !loading && setShowConfirm(false)}>
          <div
            className="modal-sheet sm:max-w-md sm:w-full sm:mx-auto sm:my-auto sm:rounded-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-5" style={{ borderBottom: '1px solid var(--gray-200)' }}>
              <div className="flex items-center justify-between">
                <h2 className="text-base font-bold flex items-center gap-2" style={{ color: 'var(--gray-900)' }}>
                  <AlertTriangle className="w-4 h-4" style={{ color: '#d97706' }} />
                  キャンセルの確認
                </h2>
                <button onClick={() => !loading && setShowConfirm(false)} disabled={loading} aria-label="閉じる">
                  <X className="w-5 h-5" style={{ color: 'var(--gray-500)' }} />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <p className="text-sm leading-[1.9]" style={{ color: 'var(--gray-700)' }}>
                このご予約をキャンセルしてもよろしいでしょうか？<br />
                <span className="text-xs" style={{ color: 'var(--gray-500)' }}>キャンセル後は元に戻せません。再度ご予約が必要になります。</span>
              </p>

              {error && (
                <div className="p-3 text-xs" style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#991b1b' }}>
                  {error}
                </div>
              )}

              <div className="flex gap-2">
                <button
                  onClick={() => setShowConfirm(false)}
                  disabled={loading}
                  className="flex-1 py-3 text-xs tracking-[0.15em] font-bold"
                  style={{ border: '1px solid var(--gray-300)', color: 'var(--gray-700)', borderRadius: 'var(--r-md)' }}
                >
                  閉じる
                </button>
                <button
                  onClick={cancel}
                  disabled={loading}
                  className="flex-1 py-3 text-xs tracking-[0.15em] font-bold disabled:opacity-50"
                  style={{ background: '#991b1b', color: 'white', borderRadius: 'var(--r-md)' }}
                >
                  {loading ? 'キャンセル中...' : 'キャンセルする'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
