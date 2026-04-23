import { Box } from 'lucide-react';

export default async function ProductsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold" style={{ color: 'var(--gray-900)' }}>在庫管理</h1>
        <p className="text-sm mt-1" style={{ color: 'var(--gray-500)' }}>ジェル銘柄・ファイル・備品の入出庫</p>
      </div>
      <div className="card-box text-center py-16">
        <Box className="w-10 h-10 mx-auto mb-3" style={{ color: 'var(--gray-300)' }} />
        <p className="text-sm" style={{ color: 'var(--gray-500)' }}>準備中</p>
      </div>
    </div>
  );
}
