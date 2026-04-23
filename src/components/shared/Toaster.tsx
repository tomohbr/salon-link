'use client';
import { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';

type ToastVariant = 'success' | 'error' | 'warning' | 'info';
interface Toast {
  id: number;
  message: string;
  variant: ToastVariant;
  undo?: () => void;
  durationMs: number;
}

interface ToastCtx {
  toast: (opts: { message: string; variant?: ToastVariant; durationMs?: number; undo?: () => void }) => void;
  success: (message: string, opts?: { undo?: () => void; durationMs?: number }) => void;
  error: (message: string, opts?: { durationMs?: number }) => void;
  warning: (message: string, opts?: { durationMs?: number }) => void;
  info: (message: string, opts?: { durationMs?: number }) => void;
}

const ToastContext = createContext<ToastCtx | null>(null);

const MAX_STACK = 5;
const VARIANT_STYLES: Record<ToastVariant, { bg: string; fg: string; border: string; icon: React.ReactNode }> = {
  success: { bg: '#ecfdf5', fg: '#065f46', border: '#a7f3d0', icon: <CheckCircle2 className="w-5 h-5" /> },
  error: { bg: '#fef2f2', fg: '#991b1b', border: '#fecaca', icon: <AlertCircle className="w-5 h-5" /> },
  warning: { bg: '#fffbeb', fg: '#92400e', border: '#fde68a', icon: <AlertTriangle className="w-5 h-5" /> },
  info: { bg: '#eff6ff', fg: '#1e40af', border: '#bfdbfe', icon: <Info className="w-5 h-5" /> },
};

export function Toaster({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const idRef = useRef(0);

  const remove = useCallback((id: number) => {
    setToasts((arr) => arr.filter((t) => t.id !== id));
  }, []);

  const toast = useCallback<ToastCtx['toast']>(
    ({ message, variant = 'info', durationMs = 4000, undo }) => {
      const id = ++idRef.current;
      setToasts((arr) => {
        const next = [...arr, { id, message, variant, durationMs, undo }];
        return next.length > MAX_STACK ? next.slice(next.length - MAX_STACK) : next;
      });
    },
    []
  );

  const value: ToastCtx = {
    toast,
    success: (m, o) => toast({ message: m, variant: 'success', ...o }),
    error: (m, o) => toast({ message: m, variant: 'error', ...o }),
    warning: (m, o) => toast({ message: m, variant: 'warning', ...o }),
    info: (m, o) => toast({ message: m, variant: 'info', ...o }),
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 max-w-sm"
        style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
      >
        {toasts.map((t) => (
          <ToastItem key={t.id} toast={t} onClose={() => remove(t.id)} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

function ToastItem({ toast, onClose }: { toast: Toast; onClose: () => void }) {
  const v = VARIANT_STYLES[toast.variant];
  useEffect(() => {
    const id = setTimeout(onClose, toast.durationMs);
    return () => clearTimeout(id);
  }, [onClose, toast.durationMs]);

  return (
    <div
      role="status"
      className="flex items-start gap-3 px-4 py-3 rounded-lg shadow-lg"
      style={{
        background: v.bg,
        color: v.fg,
        border: `1px solid ${v.border}`,
        animation: 'slideUp 220ms cubic-bezier(0.165, 0.84, 0.44, 1)',
      }}
    >
      <div className="mt-0.5 flex-shrink-0">{v.icon}</div>
      <div className="flex-1 text-sm leading-relaxed">{toast.message}</div>
      {toast.undo && (
        <button
          onClick={() => { toast.undo!(); onClose(); }}
          className="text-xs font-bold underline underline-offset-2 hover:opacity-70 flex-shrink-0"
        >
          元に戻す
        </button>
      )}
      <button onClick={onClose} aria-label="閉じる" className="flex-shrink-0 opacity-50 hover:opacity-100">
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    // フォールバック: Toaster がマウントされていなくても落ちないように
    return {
      toast: () => {},
      success: () => {},
      error: () => {},
      warning: () => {},
      info: () => {},
    } as ToastCtx;
  }
  return ctx;
}
