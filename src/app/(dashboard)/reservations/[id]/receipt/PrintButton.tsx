'use client';
import { useState } from 'react';
import { Printer, ArrowLeft, Edit2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';

export default function PrintButton() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentName = searchParams.get('name') || '';
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(currentName);

  function applyName(e: React.FormEvent) {
    e.preventDefault();
    const url = new URL(window.location.href);
    if (name) url.searchParams.set('name', name);
    else url.searchParams.delete('name');
    router.replace(url.pathname + url.search);
    setEditing(false);
  }

  return (
    <>
      <Link
        href="/reservations"
        className="px-4 py-2 text-xs tracking-wider inline-flex items-center gap-1.5"
        style={{ color: 'var(--gray-700)', border: '1px solid var(--gray-300)', borderRadius: '4px', background: 'white' }}
      >
        <ArrowLeft className="w-3 h-3" /> 予約に戻る
      </Link>

      {!editing ? (
        <button
          onClick={() => setEditing(true)}
          className="px-4 py-2 text-xs tracking-wider inline-flex items-center gap-1.5"
          style={{ color: 'var(--gray-700)', border: '1px solid var(--gray-300)', borderRadius: '4px', background: 'white' }}
        >
          <Edit2 className="w-3 h-3" /> 宛名を変更
        </button>
      ) : (
        <form onSubmit={applyName} className="inline-flex items-center gap-1.5">
          <input
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="上様"
            className="px-3 py-2 text-xs"
            style={{ border: '1px solid var(--gray-300)', borderRadius: '4px', background: 'white', minWidth: '160px' }}
          />
          <button type="submit" className="px-3 py-2 text-xs" style={{ background: '#1a1a1a', color: 'white', borderRadius: '4px' }}>
            適用
          </button>
        </form>
      )}

      <button
        onClick={() => window.print()}
        className="px-5 py-2 text-xs tracking-wider inline-flex items-center gap-1.5 font-bold"
        style={{ background: '#1a1a1a', color: 'white', borderRadius: '4px' }}
      >
        <Printer className="w-3.5 h-3.5" /> 印刷 / PDF 保存
      </button>
    </>
  );
}
