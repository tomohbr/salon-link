'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import { MessageSquarePlus, X, Check } from 'lucide-react';

/**
 * ダッシュボード全体に出る軽量フィードバックボタン。
 * オーナー/スタッフが「どの画面で何を感じたか」をその場で送れるようにする。
 */
export default function FeedbackButton() {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');
  const pathname = usePathname();

  function close() {
    setOpen(false);
    setTimeout(() => {
      setDone(false);
      setError('');
      setMessage('');
    }, 200);
  }

  async function submit() {
    if (!message.trim()) {
      setError('ご意見を入力してください');
      return;
    }
    setSending(true);
    setError('');
    try {
      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message, page: pathname }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || '送信に失敗しました');
        setSending(false);
        return;
      }
      setDone(true);
    } catch {
      setError('通信エラーが発生しました');
    } finally {
      setSending(false);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="フィードバックを送る"
        className="fixed right-4 bottom-20 md:bottom-6 z-40 flex items-center gap-2 rounded-full px-4 py-3 shadow-lg text-white text-sm font-semibold hover:opacity-90 transition-opacity"
        style={{ background: '#633f5a' }}
      >
        <MessageSquarePlus className="w-4 h-4" />
        <span className="hidden sm:inline">ご意見</span>
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 p-0 sm:p-4"
          onClick={close}
        >
          <div
            className="bg-white w-full sm:max-w-md rounded-t-2xl sm:rounded-2xl p-5 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-base font-bold" style={{ color: '#2a1a26' }}>ご意見・ご要望</h2>
              <button type="button" onClick={close} aria-label="閉じる" className="text-stone-400 hover:text-stone-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            {done ? (
              <div className="py-8 text-center">
                <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-3">
                  <Check className="w-6 h-6 text-emerald-600" />
                </div>
                <p className="text-sm text-stone-700">ありがとうございます。<br />いただいたご意見は改善に活用させていただきます。</p>
                <button
                  type="button"
                  onClick={close}
                  className="mt-5 px-6 py-2 rounded-lg text-sm font-semibold border border-stone-300 hover:bg-stone-50"
                >
                  閉じる
                </button>
              </div>
            ) : (
              <>
                <p className="text-xs text-stone-500 mb-2">
                  使いにくい点・ほしい機能・不具合など、お気軽にお寄せください。
                </p>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={5}
                  maxLength={2000}
                  placeholder="例: 予約一覧をカレンダー表示でも見たい / ◯◯ボタンが押しにくい など"
                  className="w-full resize-none rounded-lg border border-stone-300 p-3 text-sm"
                />
                {error && <p className="text-xs text-red-600 mt-2">{error}</p>}
                <div className="flex justify-end gap-2 mt-4">
                  <button
                    type="button"
                    onClick={close}
                    className="px-4 py-2 rounded-lg text-sm font-semibold border border-stone-300 hover:bg-stone-50"
                  >
                    キャンセル
                  </button>
                  <button
                    type="button"
                    onClick={submit}
                    disabled={sending}
                    className="px-5 py-2 rounded-lg text-sm font-semibold text-white hover:opacity-90 disabled:opacity-50"
                    style={{ background: '#633f5a' }}
                  >
                    {sending ? '送信中...' : '送信する'}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
