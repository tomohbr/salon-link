// スケルトン UI パーツ。動きは控えめ (shimmer 2s ease-in-out infinite)。

export function Skeleton({
  className = '',
  width,
  height,
  rounded = 'md',
}: {
  className?: string;
  width?: string | number;
  height?: string | number;
  rounded?: 'sm' | 'md' | 'lg' | 'full' | 'none';
}) {
  const radius =
    rounded === 'full' ? '9999px'
    : rounded === 'none' ? '0'
    : rounded === 'sm' ? '4px'
    : rounded === 'lg' ? '12px'
    : '8px';
  return (
    <div
      aria-hidden
      className={`skeleton ${className}`}
      style={{
        width: typeof width === 'number' ? `${width}px` : width,
        height: typeof height === 'number' ? `${height}px` : height,
        borderRadius: radius,
      }}
    />
  );
}

export function SkeletonText({ lines = 3, className = '' }: { lines?: number; className?: string }) {
  return (
    <div className={`space-y-2 ${className}`} aria-label="読み込み中">
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton key={i} height={10} width={i === lines - 1 ? '70%' : '100%'} />
      ))}
    </div>
  );
}

export function SkeletonRow() {
  return (
    <div className="flex items-center gap-3 py-3" style={{ borderBottom: '1px solid var(--gray-100)' }}>
      <Skeleton width={40} height={40} rounded="full" />
      <div className="flex-1 space-y-1.5">
        <Skeleton height={11} width="40%" />
        <Skeleton height={9} width="60%" />
      </div>
      <Skeleton width={60} height={14} />
    </div>
  );
}

export function SkeletonCard() {
  return (
    <div className="card-box">
      <Skeleton height={14} width="40%" className="mb-4" />
      <Skeleton height={32} width="60%" className="mb-3" />
      <Skeleton height={10} width="50%" />
    </div>
  );
}
