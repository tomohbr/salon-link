'use client';
// HPB メール本文を貼り付けて取込むモーダル。
// CSV 取込と並ぶ選択肢。Zapier を使えないユーザーの手動オペレーション用。
//
// externalOpen / onExternalClose / hideTrigger を渡せば外部制御可能。

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Mail, X, Upload } from 'lucide-react';
import { useToast } from '@/components/shared/Toaster';

interface Props {
  externalOpen?: boolean;
  onExternalClose?: () => void;
  hideTrigger?: boolean;
}

export default function HpbEmailImportButton({ externalOpen, onExternalClose, hideTrigger }: Props) {
  const router = useRouter();
  const toast = useToast();
  const [localOpen, setLocalOpen] = useState(false);
  const [raw, setRaw] = useState('');
  const [loading, setLoading] = useState(false);

  const open = externalOpen ?? localOpen;
  const close = () => {
    if (onExternalClose) onExternalClose();
    else setLocalOpen(false);
  };

  async function submit() {
    if (!raw.trim()) return;
    setLoading(true);
    try {
      const res = await fetch('/api/reservations/import-hpb-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ raw }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || '取込に失敗しました');
        return;
      }
      const s = data.summary;
      toast.success(`取込完了: 新規${s.created} / 更新${s.updated} / キャンセル${s.cancelled}`);
      setRaw('');
      close();
      router.refresh();
    } catch {
      toast.error('通信エラー');
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      {!hideTrigger && (
        <button
          onClick={() => setLocalOpen(true)}
          className="btn-ghost text-xs border"
          style={{ background: '#fffbeb', borderColor: '#fde68a', color: '#92400e' }}
        >
          <Mail className="w-3 h-3" />HPBメール取込
        </button>
      )}

      {open && (
        <div className="modal-sheet-bg" onClick={close}>
          <div
            className="modal-sheet sm:max-w-xl sm:w-full sm:mx-auto sm:my-auto sm:rounded-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-5" style={{ borderBottom: '1px solid var(--gray-200)' }}>
              <h2 className="text-base font-bold flex items-center gap-2" style={{ color: 'var(--gray-900)' }}>
                <Mail className="w-4 h-4" style={{ color: '#d97706' }} />
                HPB予約通知メールから取込
              </h2>
              <button onClick={close} aria-label="閉じる">
                <X className="w-5 h-5" style={{ color: 'var(--gray-500)' }} />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div
                className="p-3 text-xs leading-relaxed"
                style={{ background: '#fffbeb', border: '1px solid #fde68a', color: '#78350f' }}
              >
                <p className="font-bold mb-2">📧 取込手順</p>
                <ol className="list-decimal list-inside space-y-1">
                  <li>HPBから届いた「ご予約確定」のメールを開く</li>
                  <li>本文を全選択してコピー</li>
                  <li>下に貼り付けて「取込」をクリック</li>
                </ol>
                <p className="mt-2" style={{ color: 'var(--gray-500)' }}>
                  同じメールを何度取り込んでも重複作成されません (予約番号で冪等化)。
                </p>
              </div>

              <div>
                <label className="block text-[10px] tracking-[0.15em] uppercase mb-2" style={{ color: 'var(--gray-500)' }}>
                  メール本文
                </label>
                <textarea
                  className="input font-mono text-xs"
                  rows={14}
                  value={raw}
                  onChange={(e) => setRaw(e.target.value)}
                  placeholder={`例)\n\n【ホットペッパービューティー】ご予約確定のお知らせ\n\nご予約番号: HB12345678\nお客様名: 山田 花子 様\nご来店日時: 2026/04/22(水) 14:00~15:30\nメニュー: ワンカラージェル\n料金: ¥5,500\n...`}
                />
              </div>

              <button
                onClick={submit}
                disabled={!raw.trim() || loading}
                className="w-full py-3.5 text-xs tracking-[0.2em] font-bold disabled:opacity-50"
                style={{ background: 'var(--gray-900)', color: 'white', borderRadius: 'var(--r-md)' }}
              >
                <Upload className="w-4 h-4 inline mr-2" />
                {loading ? '取込中...' : 'メールから取込む'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
