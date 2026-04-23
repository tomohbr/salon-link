'use client';
// 数値のカウントアップ。視界に入った時点から 1 回だけ動作。
// 参考サイト的な静けさを保つため、イージングは ease-out、1000ms 程度。

import { useEffect, useRef, useState } from 'react';

export default function CountUp({
  to,
  durationMs = 1200,
  prefix = '',
  suffix = '',
  decimals = 0,
  className = '',
  style,
}: {
  to: number;
  durationMs?: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  className?: string;
  style?: React.CSSProperties;
}) {
  const ref = useRef<HTMLSpanElement | null>(null);
  const [value, setValue] = useState(0);
  const startedRef = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const prefersReduced = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) {
      setValue(to);
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting && !startedRef.current) {
            startedRef.current = true;
            const startTs = performance.now();
            const step = (now: number) => {
              const elapsed = now - startTs;
              const t = Math.min(1, elapsed / durationMs);
              // ease-out-quart
              const eased = 1 - Math.pow(1 - t, 4);
              setValue(to * eased);
              if (t < 1) requestAnimationFrame(step);
              else setValue(to);
            };
            requestAnimationFrame(step);
            io.disconnect();
          }
        });
      },
      { threshold: 0.4 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [to, durationMs]);

  const display =
    decimals > 0
      ? value.toFixed(decimals)
      : Math.round(value).toLocaleString('ja-JP');

  return (
    <span ref={ref} className={className} style={style}>
      {prefix}{display}{suffix}
    </span>
  );
}
