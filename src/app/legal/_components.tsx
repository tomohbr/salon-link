import type { ReactNode } from 'react';

export function LegalHeading({ title, lastUpdated }: { title: string; lastUpdated: string }) {
  return (
    <div className="mb-12 pb-6 border-b border-stone-200">
      <h1 className="text-[28px] md:text-[36px] font-bold text-stone-900 leading-tight">{title}</h1>
      <p className="text-[11px] text-stone-500 mt-3 tracking-wider uppercase">最終更新日: {lastUpdated}</p>
    </div>
  );
}

export function Section({ n, title, children }: { n: string; title: string; children: ReactNode }) {
  return (
    <section className="mb-10">
      <h2 className="text-[15px] md:text-[16px] font-semibold text-stone-900 mb-4 flex items-baseline gap-3">
        <span className="text-[14px] tabular-nums" style={{ color: '#633f5a' }}>{n}</span>
        <span>{title}</span>
      </h2>
      <div className="space-y-3 text-[13.5px] leading-[2.05] text-stone-700">
        {children}
      </div>
    </section>
  );
}

export function Definition({ term, def }: { term: string; def: ReactNode }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-[140px_1fr] gap-2 md:gap-6 py-3 border-b border-stone-100">
      <dt className="text-[12px] tracking-wider text-stone-500">{term}</dt>
      <dd className="text-[13.5px] text-stone-700 leading-[1.9]">{def}</dd>
    </div>
  );
}
