// 売上ページ (Phase F で実装)
import { TrendingUp } from 'lucide-react';

export default async function SalesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold" style={{ color: 'var(--gray-900)' }}>売上</h1>
        <p className="text-sm mt-1" style={{ color: 'var(--gray-500)' }}>準備中</p>
      </div>
      <div className="card-box text-center py-16">
        <TrendingUp className="w-10 h-10 mx-auto mb-3" style={{ color: 'var(--gray-300)' }} />
        <p className="text-sm" style={{ color: 'var(--gray-500)' }}>
          まもなく公開いたします
        </p>
      </div>
    </div>
  );
}
