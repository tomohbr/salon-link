import { SkeletonCard, SkeletonRow } from '@/components/shared/Skeleton';

export default function DashboardLoading() {
  return (
    <div className="space-y-6" aria-busy="true" aria-label="ダッシュボードを読み込み中">
      <div>
        <div className="skeleton h-7 w-48 rounded-md mb-2" />
        <div className="skeleton h-3 w-64 rounded" />
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => <SkeletonCard key={i} />)}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="card-box">
          <div className="skeleton h-4 w-32 rounded mb-4" />
          <div className="space-y-2">
            <div className="skeleton h-3 w-full rounded" />
            <div className="skeleton h-3 w-3/4 rounded" />
          </div>
        </div>
        <div className="card-box">
          <div className="skeleton h-4 w-40 rounded mb-4" />
          <div className="space-y-2">
            <div className="skeleton h-3 w-full rounded" />
            <div className="skeleton h-3 w-4/5 rounded" />
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card-box md:col-span-2">
          <div className="skeleton h-4 w-44 rounded mb-5" />
          <div className="skeleton h-32 w-full rounded" />
        </div>
        <div className="card-box">
          <div className="skeleton h-4 w-28 rounded mb-4" />
          {[1, 2, 3].map((i) => <SkeletonRow key={i} />)}
        </div>
      </div>
    </div>
  );
}
