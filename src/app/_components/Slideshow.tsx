'use client';
// 参考サイト(oimonohitotoki.com)の Shopify Dawn 標準 slideshow-component を模倣
// CSS opacity フェード、自動再生、インジケータードット付き
// Swiper 等のライブラリに依存せず軽量実装

import { useEffect, useState } from 'react';
import Image from 'next/image';

type Slide = {
  src: string;
  alt: string;
  caption?: string;
};

export default function Slideshow({
  slides,
  autoplay = true,
  intervalSec = 5,
  aspectClassName = 'aspect-[16/9] md:aspect-[21/9]',
}: {
  slides: Slide[];
  autoplay?: boolean;
  intervalSec?: number;
  aspectClassName?: string;
}) {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (!autoplay || slides.length <= 1) return;
    const id = setInterval(() => {
      setCurrent((c) => (c + 1) % slides.length);
    }, intervalSec * 1000);
    return () => clearInterval(id);
  }, [autoplay, intervalSec, slides.length]);

  return (
    <div className="w-full">
      <div className={`relative w-full overflow-hidden ${aspectClassName}`}>
        {slides.map((s, i) => (
          <div
            key={i}
            className="absolute inset-0 transition-opacity duration-[1200ms] ease-in-out"
            style={{ opacity: i === current ? 1 : 0 }}
            aria-hidden={i !== current}
          >
            <Image
              src={s.src}
              alt={s.alt}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1280px) 90vw, 1200px"
              className="object-cover"
              priority={i === 0}
            />
            {s.caption && (
              <div className="absolute inset-0 flex items-end">
                <div className="w-full px-8 md:px-16 pb-10 md:pb-14">
                  <p className="text-xs tracking-[0.3em] text-white/90 max-w-md leading-[2.0] backdrop-blur-[2px] inline-block">
                    {s.caption}
                  </p>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* ドットインジケーター */}
      {slides.length > 1 && (
        <div className="flex items-center justify-center gap-3 mt-6">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              aria-label={`スライド ${i + 1} を表示`}
              className="transition-all"
              style={{
                width: i === current ? '24px' : '8px',
                height: '2px',
                background: i === current ? '#633f5a' : '#d4c6ca',
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
