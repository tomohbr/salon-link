import { SkeletonRow } from '@/components/shared/Skeleton';

export default function CustomersLoading() {
  return (
    <div className="space-y-6" aria-busy="true" aria-label="顧客一覧を読み込み中">
      <div>
        <div className="skeleton h-7 w-40 rounded-md mb-2" />
        <div className="skeleton h-3 w-24 rounded" />
      </div>
      <div className="card-box">
        <div className="flex gap-3 mb-4">
          <div className="skeleton h-10 flex-1 rounded-md" />
          <div className="skeleton h-10 w-40 rounded-md" />
          <div className="skeleton h-10 w-28 rounded-md" />
        </div>
        {[1, 2, 3, 4, 5, 6, 7].map((i) => <SkeletonRow key={i} />)}
      </div>
    </div>
  );
}
