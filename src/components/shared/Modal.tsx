'use client';
// アクセシブルモーダル
// - role="dialog" aria-modal aria-labelledby
// - フォーカストラップ (Tab / Shift+Tab で内側を循環)
// - Escape で閉じる
// - 開閉時に呼び出し元ボタンへフォーカス復帰

import { X } from 'lucide-react';
import { useEffect, useRef, useId } from 'react';

export default function Modal({
  open,
  onClose,
  title,
  children,
  maxWidth = 'max-w-md',
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  maxWidth?: string;
}) {
  const titleId = useId();
  const dialogRef = useRef<HTMLDivElement | null>(null);
  const previouslyFocusedRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!open) return;

    previouslyFocusedRef.current = (document.activeElement as HTMLElement) || null;

    const dialog = dialogRef.current;
    if (!dialog) return;

    // 開いたら最初のフォーカス可能要素へ
    const focusables = dialog.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const first = focusables[0];
    if (first) setTimeout(() => first.focus(), 50);

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
        return;
      }
      if (e.key === 'Tab') {
        const fs = dialog.querySelectorAll<HTMLElement>(
          'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
        );
        if (fs.length === 0) return;
        const firstEl = fs[0];
        const lastEl = fs[fs.length - 1];
        if (e.shiftKey && document.activeElement === firstEl) {
          e.preventDefault();
          lastEl.focus();
        } else if (!e.shiftKey && document.activeElement === lastEl) {
          e.preventDefault();
          firstEl.focus();
        }
      }
    };

    document.addEventListener('keydown', onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
      // 呼び出し元要素にフォーカスを戻す
      if (previouslyFocusedRef.current && document.contains(previouslyFocusedRef.current)) {
        previouslyFocusedRef.current.focus();
      }
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="modal-sheet-bg flex items-center justify-center p-4"
      onClick={onClose}
      aria-hidden="false"
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className={`modal-sheet w-full ${maxWidth}`}
        style={{ border: '1px solid var(--gray-200)' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-5" style={{ borderBottom: '1px solid var(--gray-200)' }}>
          <h2 id={titleId} className="text-base font-bold" style={{ color: 'var(--gray-900)' }}>{title}</h2>
          <button onClick={onClose} aria-label="ダイアログを閉じる">
            <X className="w-5 h-5" style={{ color: 'var(--gray-500)' }} />
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}

export function Field({ label, required, children, hint }: { label: string; required?: boolean; children: React.ReactNode; hint?: string }) {
  return (
    <div>
      <label className="block text-[10px] tracking-[0.15em] uppercase mb-2" style={{ color: 'var(--gray-500)' }}>
        {label}
        {required && <span className="ml-1" style={{ color: '#633f5a' }} aria-label="必須">*</span>}
      </label>
      {children}
      {hint && <p className="mt-1 text-[10px]" style={{ color: '#8a7a82' }}>{hint}</p>}
    </div>
  );
}
