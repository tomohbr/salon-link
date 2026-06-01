'use client';

import { useEffect, useState } from 'react';
import { Mail, X, Check, AlertCircle, Send } from 'lucide-react';

type State =
  | { status: 'idle' }
  | { status: 'sending' }
  | { status: 'ok'; message: string }
  | { status: 'error'; message: string };

export default function InquiryForm({
  triggerLabel = '資料請求 / お問合せ',
  source = 'lp',
  className = '',
  variant = 'outline',
}: {
  triggerLabel?: string;
  source?: string;
  className?: string;
  variant?: 'outline' | 'solid' | 'light';
}) {
  const [open, setOpen] = useState(false);
  const [state, setState] = useState<State>({ status: 'idle' });

  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
      return () => { document.body.style.overflow = ''; };
    }
  }, [open]);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (state.status === 'sending') return;
    setState({ status: 'sending' });
    const fd = new FormData(e.currentTarget);
    const payload = {
      name: String(fd.get('name') || ''),
      email: String(fd.get('email') || ''),
      phone: String(fd.get('phone') || ''),
      salonName: String(fd.get('salonName') || ''),
      message: String(fd.get('message') || ''),
      website: String(fd.get('website') || ''), // honeypot
      source,
    };
    try {
      const res = await fetch('/api/inquiry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json; charset=utf-8' },
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setState({ status: 'error', message: data?.error || 'エラーが発生しました' });
        return;
      }
      setState({ status: 'ok', message: 'お問合せを受け付けました。2 営業日以内にご返信いたします。' });
    } catch {
      setState({ status: 'error', message: 'ネットワークエラー。しばらく時間をおいてお試しください。' });
    }
  }

  function reset() {
    setOpen(false);
    setState({ status: 'idle' });
  }

  const baseBtn = 'px-8 py-4 text-xs tracking-[0.2em] font-bold text-center transition-all hover:-translate-y-0.5';
  const variantClass =
    variant === 'solid'
      ? 'text-white' : variant === 'light'
      ? 'bg-white' : '';
  const variantStyle: React.CSSProperties =
    variant === 'solid'
      ? { background: '#633f5a', color: 'white', borderRadius: 'var(--r-md, 12px)' }
      : variant === 'light'
      ? { background: 'white', color: 'var(--gray-900, #1a1a1a)', borderRadius: 'var(--r-md, 12px)' }
      : { color: 'var(--gray-900, #1a1a1a)', border: '1px solid var(--gray-900, #1a1a1a)', borderRadius: 'var(--r-md, 12px)' };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={`${baseBtn} ${variantClass} ${className}`}
        style={variantStyle}
      >
        {triggerLabel}
      </button>

      {open && (
        <div
          className="fixed inset-0 z-[100] bg-black/40 backdrop-blur-sm flex items-end md:items-center justify-center px-3 md:px-6"
          onClick={reset}
        >
          <div
            className="w-full max-w-lg bg-white border border-stone-200 rounded-t-2xl md:rounded-2xl shadow-2xl"
            onClick={(e) => e.stopPropagation()}
            style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
          >
            <div className="flex items-center justify-between px-5 py-4 border-b border-stone-100">
              <div className="flex items-center gap-2.5">
                <Mail className="w-4 h-4" style={{ color: '#633f5a' }} />
                <h2 className="text-[15px] font-semibold text-stone-900">お問合せ / 資料請求</h2>
              </div>
              <button onClick={reset} className="text-stone-400 hover:text-stone-900 transition" aria-label="閉じる">
                <X className="w-5 h-5" />
              </button>
            </div>

            {state.status === 'ok' ? (
              <div className="p-6 text-center">
                <div className="w-12 h-12 mx-auto rounded-full flex items-center justify-center mb-4" style={{ background: '#e7d4e2', border: '1px solid #c2a3bc' }}>
                  <Check className="w-6 h-6" style={{ color: '#633f5a' }} />
                </div>
                <h3 className="font-semibold text-stone-900 text-[18px] mb-2">ありがとうございました</h3>
                <p className="text-[13px] text-stone-600 leading-relaxed">{state.message}</p>
                <p className="text-[11px] text-stone-500 mt-3 leading-relaxed">受領メールを送信しています。届かない場合は迷惑メールフォルダもご確認ください。</p>
                <button onClick={reset} className="mt-5 inline-flex items-center gap-1.5 text-[12px] tracking-[0.1em] hover:opacity-60" style={{ color: '#633f5a' }}>
                  閉じる
                </button>
              </div>
            ) : (
              <form onSubmit={submit} className="p-5 space-y-3">
                {state.status === 'error' && (
                  <div className="flex items-start gap-2 p-2.5 rounded bg-rose-50 border border-rose-200 text-[12px] text-rose-700">
                    <AlertCircle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
                    <span>{state.message}</span>
                  </div>
                )}

                {/* honeypot */}
                <div style={{ position: 'absolute', left: '-9999px', opacity: 0, pointerEvents: 'none' }} aria-hidden>
                  <label>Website</label>
                  <input type="text" name="website" tabIndex={-1} autoComplete="off" />
                </div>

                <Field label="お名前" name="name" required placeholder="山田 花子" />
                <Field label="サロン名" name="salonName" placeholder="○○ネイルサロン (任意)" />
                <Field label="メールアドレス" name="email" type="email" required placeholder="you@example.jp" />
                <Field label="電話番号" name="phone" type="tel" placeholder="090-XXXX-XXXX (任意)" />

                <div>
                  <label className="block text-[11px] tracking-[0.1em] text-stone-600 mb-1.5">お問合せ内容 *</label>
                  <textarea
                    name="message"
                    required
                    rows={4}
                    maxLength={4000}
                    placeholder="導入を検討しています。デモ画面を見せていただけますか? など"
                    className="w-full bg-white border border-stone-300 focus:border-stone-900 outline-none rounded px-3 py-2.5 text-[13px] text-stone-900 placeholder:text-stone-400 transition-colors"
                  />
                </div>

                <p className="text-[10.5px] text-stone-500 leading-relaxed">
                  送信することで <a href="/legal/privacy" className="underline underline-offset-2" style={{ color: '#633f5a' }} target="_blank">プライバシーポリシー</a> に同意したものとみなします。返信は 2 営業日以内 (平日)。
                </p>

                <button
                  type="submit"
                  disabled={state.status === 'sending'}
                  className="w-full inline-flex items-center justify-center gap-2 py-3 text-white text-[13px] font-semibold tracking-[0.1em] rounded transition hover:opacity-90 disabled:opacity-60"
                  style={{ background: 'linear-gradient(135deg, #633f5a 0%, #2a1a26 100%)' }}
                >
                  {state.status === 'sending' ? '送信中...' : <><Send className="w-3.5 h-3.5" />送信する</>}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}

function Field({
  label, name, type = 'text', required = false, placeholder,
}: { label: string; name: string; type?: string; required?: boolean; placeholder?: string }) {
  return (
    <div>
      <label className="block text-[11px] tracking-[0.1em] text-stone-600 mb-1.5">
        {label}{required && ' *'}
      </label>
      <input
        type={type}
        name={name}
        required={required}
        placeholder={placeholder}
        className="w-full bg-white border border-stone-300 focus:border-stone-900 outline-none rounded px-3 py-2.5 text-[13px] text-stone-900 placeholder:text-stone-400 transition-colors"
      />
    </div>
  );
}
