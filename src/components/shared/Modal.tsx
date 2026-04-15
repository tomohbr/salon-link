'use client';
import { X } from 'lucide-react';
import { useEffect } from 'react';

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
  useEffect(() => {
    if (!open) return;
    const onEsc = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onEsc);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onEsc);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className={`bg-white w-full ${maxWidth} max-h-[90vh] overflow-y-auto`}
        style={{ border: '1px solid #e8dfd9' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-5" style={{ borderBottom: '1px solid #e8dfd9' }}>
          <h2 className="text-base font-bold" style={{ color: '#2a1a26' }}>{title}</h2>
          <button onClick={onClose} aria-label="閉じる">
            <X className="w-5 h-5" style={{ color: '#8a7a82' }} />
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
      <label className="block text-[10px] tracking-[0.15em] uppercase mb-2" style={{ color: '#8a7a82' }}>
        {label}
        {required && <span className="ml-1" style={{ color: '#633f5a' }}>*</span>}
      </label>
      {children}
      {hint && <p className="mt-1 text-[10px]" style={{ color: '#8a7a82' }}>{hint}</p>}
    </div>
  );
}
