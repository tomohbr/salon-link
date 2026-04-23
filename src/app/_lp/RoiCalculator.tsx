'use client';
// ROI シミュレーター (ネイルサロン想定)
// 5本のスライダー。ネイル標準値をデフォルト。

import { useState, useMemo } from 'react';
import { yen } from '@/lib/utils/format';

const DEFAULTS = {
  hpbCost: 30000,        // HPB 月額広告費 (ネイル業界標準)
  newPerMonth: 15,       // 月の新規客数
  ticket: 8500,          // 平均客単価 (ジェル+アート標準)
  currentRepeatRate: 25, // 現在のリピート率 (%)
  nextRepeatRate: 55,    // 導入後のリピート率 (%)
};

export default function RoiCalculator() {
  const [hpbCost, setHpbCost] = useState(DEFAULTS.hpbCost);
  const [newPerMonth, setNewPerMonth] = useState(DEFAULTS.newPerMonth);
  const [ticket, setTicket] = useState(DEFAULTS.ticket);
  const [currentRepeatRate, setCurrentRepeatRate] = useState(DEFAULTS.currentRepeatRate);
  const [nextRepeatRate, setNextRepeatRate] = useState(DEFAULTS.nextRepeatRate);

  const result = useMemo(() => {
    // ネイル: 平均4週サイクル、年3回→年6回リピートに改善
    const currentAnnualPerNew = 1 + (currentRepeatRate / 100) * 3;  // 初回+年3回継続
    const nextAnnualPerNew = 1 + (nextRepeatRate / 100) * 6;        // 初回+年6回継続
    const newPerYear = newPerMonth * 12;

    const currentAnnual = newPerYear * currentAnnualPerNew * ticket;
    const nextAnnual = newPerYear * nextAnnualPerNew * ticket;
    const salonLinkCost = 4980 * 12;
    const annualDelta = nextAnnual - currentAnnual - salonLinkCost;
    const monthlyDelta = Math.round(annualDelta / 12);

    return {
      currentAnnual,
      nextAnnual,
      annualDelta,
      monthlyDelta,
      roi: salonLinkCost > 0 ? Math.round((annualDelta / salonLinkCost) * 100) : 0,
    };
  }, [hpbCost, newPerMonth, ticket, currentRepeatRate, nextRepeatRate]);

  return (
    <div
      className="grid md:grid-cols-2 gap-8 p-8 md:p-12"
      style={{ background: 'white', border: '1px solid var(--gray-200)', borderRadius: 'var(--r-lg)' }}
    >
      <div className="space-y-5">
        <h3 className="text-sm tracking-[0.2em] uppercase font-bold" style={{ color: 'var(--brand)' }}>条件を入力</h3>

        <Slider label="HPB月額広告費" value={hpbCost} setValue={setHpbCost} min={0} max={200000} step={5000} format={yen} />
        <Slider label="月の新規客数" value={newPerMonth} setValue={setNewPerMonth} min={1} max={100} step={1} format={(v) => `${v}人`} />
        <Slider label="平均客単価" value={ticket} setValue={setTicket} min={3000} max={20000} step={500} format={yen} />
        <Slider label="現在のリピート率" value={currentRepeatRate} setValue={setCurrentRepeatRate} min={0} max={100} step={5} format={(v) => `${v}%`} />
        <Slider label="導入後のリピート率(試算)" value={nextRepeatRate} setValue={setNextRepeatRate} min={0} max={100} step={5} format={(v) => `${v}%`} highlight />
      </div>

      <div className="space-y-5">
        <h3 className="text-sm tracking-[0.2em] uppercase font-bold" style={{ color: 'var(--brand)' }}>試算結果</h3>

        <div className="space-y-4">
          <Metric label="現状の年間売上" value={yen(result.currentAnnual)} />
          <Metric label="導入後の年間売上(試算)" value={yen(result.nextAnnual)} highlight />
          <div
            className="p-5 space-y-1"
            style={{ background: 'var(--brand-warm)', border: `1px solid var(--brand)`, borderRadius: 'var(--r-md)' }}
          >
            <div className="text-[10px] tracking-[0.15em] uppercase" style={{ color: 'var(--brand)' }}>年間利益改善(試算)</div>
            <div className="text-3xl font-bold tabular" style={{ color: 'var(--brand)' }}>
              {result.annualDelta >= 0 ? '+' : ''}{yen(result.annualDelta)}
            </div>
            <div className="text-xs" style={{ color: 'var(--gray-600)' }}>
              月平均 {result.monthlyDelta >= 0 ? '+' : ''}{yen(result.monthlyDelta)} / ROI {result.roi}%
            </div>
          </div>
        </div>

        <p className="text-[10px] leading-relaxed" style={{ color: 'var(--gray-500)' }}>
          ※ 本試算はネイル業界の一般的な再来周期 (4週) と、リピート率改善の仮定値に基づくシミュレーションです。
          実際の効果はサロンさまの施策・立地・顧客層により変動します。
        </p>
      </div>
    </div>
  );
}

function Slider({ label, value, setValue, min, max, step, format, highlight }: {
  label: string; value: number; setValue: (v: number) => void;
  min: number; max: number; step: number; format: (v: number) => string; highlight?: boolean;
}) {
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <div>
      <div className="flex items-baseline justify-between mb-1.5">
        <label className="text-xs" style={{ color: 'var(--gray-600)' }}>{label}</label>
        <span className="text-sm font-bold tabular" style={{ color: highlight ? 'var(--brand)' : 'var(--gray-900)' }}>
          {format(value)}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => setValue(Number(e.target.value))}
        className="w-full cursor-pointer"
        style={{
          background: `linear-gradient(to right, var(--brand) 0%, var(--brand) ${pct}%, var(--gray-200) ${pct}%, var(--gray-200) 100%)`,
          height: '4px',
          borderRadius: '2px',
          outline: 'none',
          WebkitAppearance: 'none',
        }}
      />
    </div>
  );
}

function Metric({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="flex items-baseline justify-between py-3" style={{ borderBottom: '1px solid var(--gray-200)' }}>
      <span className="text-xs" style={{ color: 'var(--gray-500)' }}>{label}</span>
      <span
        className="text-lg font-bold tabular"
        style={{ color: highlight ? 'var(--brand)' : 'var(--gray-900)' }}
      >
        {value}
      </span>
    </div>
  );
}
