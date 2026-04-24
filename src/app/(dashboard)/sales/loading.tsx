import { SkeletonCard } from '@/components/shared/Skeleton';

export default function SalesLoading() {
  return (
    <div className="space-y-6" aria-busy="true" aria-label="売上を読み込み中">
      <div>
        <div className="skeleton h-7 w-20 rounded-md mb-2" />
        <div className="skeleton h-3 w-28 rounded" />
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => <SkeletonCard key={i} />)}
      </div>
      <div className="card-box">
        <div className="flex items-center justify-between mb-5">
          <div>
            <div className="skeleton h-4 w-32 rounded mb-2" />
            <div className="skeleton h-3 w-48 rounded" />
          </div>
          <div className="skeleton h-3 w-40 rounded" />
        </div>
        <div className="flex items-end gap-1 h-48">
          {Array.from({ length: 30 }).map((_, i) => (
            <div
              key={i}
              className="skeleton flex-1 rounded-t"
              style={{ height: `${20 + Math.random() * 80}%` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
