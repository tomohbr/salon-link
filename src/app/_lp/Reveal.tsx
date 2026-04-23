'use client';
// スクロールで「そっと現れる」ためのラッパー。
// IntersectionObserver で可視領域に入ったら opacity/translate を戻す。
// 参考サイト oimonohitotoki.com の `scroll-trigger animate--slide-in` を模倣。
// 派手なバウンスではなく、静かなフェード+上方向スライドに抑える。

import { useEffect, useRef, useState } from 'react';

type Direction = 'up' | 'down' | 'left' | 'right' | 'none';

export default function Reveal({
  children,
  delayMs = 0,
  direction = 'up',
  distance = 16,
  durationMs = 700,
  threshold = 0.12,
  once = true,
  as: Tag = 'div',
  className = '',
  style: styleProp,
}: {
  children: React.ReactNode;
  delayMs?: number;
  direction?: Direction;
  distance?: number;
  durationMs?: number;
  threshold?: number;
  once?: boolean;
  as?: keyof React.JSX.IntrinsicElements;
  className?: string;
  style?: React.CSSProperties;
}) {
  const ref = useRef<HTMLElement | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // prefers-reduced-motion: アクセシビリティ配慮 - すぐ表示する
    const prefersReduced = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) {
      setVisible(true);
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            setVisible(true);
            if (once) io.disconnect();
          } else if (!once) {
            setVisible(false);
          }
        });
      },
      { threshold }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [threshold, once]);

  const translateFor = (d: Direction) => {
    if (d === 'up') return `translate3d(0, ${distance}px, 0)`;
    if (d === 'down') return `translate3d(0, -${distance}px, 0)`;
    if (d === 'left') return `translate3d(${distance}px, 0, 0)`;
    if (d === 'right') return `translate3d(-${distance}px, 0, 0)`;
    return 'translate3d(0, 0, 0)';
  };

  const style: React.CSSProperties = {
    ...(styleProp ?? {}),
    opacity: visible ? 1 : 0,
    transform: visible ? 'translate3d(0, 0, 0)' : translateFor(direction),
    transition: `opacity ${durationMs}ms cubic-bezier(0.165, 0.84, 0.44, 1) ${delayMs}ms, transform ${durationMs}ms cubic-bezier(0.165, 0.84, 0.44, 1) ${delayMs}ms`,
    willChange: 'opacity, transform',
  };

  // as prop を使った dynamic タグ — React 19 準拠
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const Comp = Tag as any;
  return (
    <Comp ref={ref} className={className} style={style}>
      {children}
    </Comp>
  );
}
