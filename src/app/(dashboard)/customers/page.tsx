import Link from 'next/link';
import { getSalonData } from '@/lib/salonData';
import { yen, fmtDate, sourceLabel } from '@/lib/utils/format';
import { Search } from 'lucide-react';

export default async function CustomersPage() {
  const { customers } = await getSalonData();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-stone-900">顧客管理</h1>
        <p className="text-sm text-stone-500 mt-1">全 {customers.length}名</p>
      </div>

      <div className="card-box">
        <div className="flex gap-3 mb-4">
          <div className="flex-1 relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
            <input className="input pl-9" placeholder="名前・電話番号・メールで検索..." />
          </div>
          <select className="input max-w-xs">
            <option>すべての流入元</option>
          </select>
          <button className="btn-brand">+ 新規顧客</button>
        </div>

        {customers.length === 0 ? (
          <p className="text-sm text-stone-500 py-8 text-center">
            顧客がまだ登録されていません。最初の顧客を追加しましょう。
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-stone-500 border-b border-stone-200">
                  <th className="py-3 px-2">顧客名</th>
                  <th className="py-3 px-2">流入元</th>
                  <th className="py-3 px-2">LINE</th>
                  <th className="py-3 px-2">来店回数</th>
                  <th className="py-3 px-2">累計売上</th>
                  <th className="py-3 px-2">最終来店</th>
                  <th className="py-3 px-2"></th>
                </tr>
              </thead>
              <tbody>
                {customers.map((c) => (
                  <tr key={c.id} className="border-b border-stone-100 hover:bg-stone-50">
                    <td className="py-3 px-2">
                      <div className="font-medium text-stone-900">{c.name}</div>
                      <div className="text-xs text-stone-500">{c.nameKana}</div>
                    </td>
                    <td className="py-3 px-2">
                      <span className={`badge ${c.source === 'hotpepper' ? 'badge-yellow' : c.source === 'line' ? 'badge-green' : 'badge-gray'}`}>
                        {sourceLabel(c.source)}
                      </span>
                    </td>
                    <td className="py-3 px-2">
                      {c.isLineFriend ? <span className="badge badge-green">登録済</span> : <span className="badge badge-gray">未登録</span>}
                    </td>
                    <td className="py-3 px-2 font-medium">{c.visitCount}回</td>
                    <td className="py-3 px-2 font-medium">{yen(c.totalSpent)}</td>
                    <td className="py-3 px-2 text-stone-600">{c.lastVisitDate ? fmtDate(c.lastVisitDate) : '—'}</td>
                    <td className="py-3 px-2">
                      <Link href={`/customers/${c.id}`} className="brand-text text-xs font-medium">詳細 →</Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
