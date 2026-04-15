import { getSalonData } from '@/lib/salonData';
import { yen, fmtDate, sourceLabel, statusLabel } from '@/lib/utils/format';

export default async function ReservationsPage() {
  const { reservations, customers, staff } = await getSalonData();
  const today = new Date().toISOString().slice(0, 10);

  const upcoming = reservations
    .filter(r => r.date >= today && (r.status === 'confirmed' || r.status === 'pending'))
    .sort((a, b) => (a.date + a.startTime).localeCompare(b.date + b.startTime));

  const past = reservations
    .filter(r => r.date < today)
    .sort((a, b) => (b.date + b.startTime).localeCompare(a.date + a.startTime))
    .slice(0, 20);

  const byDate: Record<string, typeof upcoming> = {};
  upcoming.forEach(r => {
    if (!byDate[r.date]) byDate[r.date] = [];
    byDate[r.date].push(r);
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-stone-900">予約管理</h1>
          <p className="text-sm text-stone-500 mt-1">今後の予約 {upcoming.length}件</p>
        </div>
        <button className="btn-brand">+ 新規予約</button>
      </div>

      <div className="card-box">
        <h2 className="font-semibold text-stone-900 mb-4">今後の予約</h2>
        {Object.keys(byDate).length === 0 ? (
          <p className="text-sm text-stone-500 py-8 text-center">予約はありません</p>
        ) : (
          <div className="space-y-5">
            {Object.entries(byDate).map(([date, rs]) => (
              <div key={date}>
                <div className="text-sm font-semibold text-stone-700 mb-2 flex items-center gap-2">
                  <span className="brand-text">{fmtDate(date)}</span>
                  <span className="text-xs text-stone-400">({rs.length}件)</span>
                </div>
                <div className="space-y-2">
                  {rs.map(r => {
                    const cust = customers.find(c => c.id === r.customerId);
                    const st = staff.find(s => s.id === r.staffId);
                    return (
                      <div key={r.id} className="flex items-center gap-4 p-3 bg-stone-50 rounded-lg border border-stone-100">
                        <div className="text-sm font-mono font-semibold w-20">{r.startTime}-{r.endTime}</div>
                        <div className="flex-1">
                          <div className="font-medium text-sm">{cust?.name || '—'}</div>
                          <div className="text-xs text-stone-500">{r.menuName} / {st?.name}</div>
                        </div>
                        <div className="text-sm font-medium">{r.menuPrice ? yen(r.menuPrice) : '—'}</div>
                        <span className={`badge ${r.source === 'line' ? 'badge-green' : r.source === 'hotpepper' ? 'badge-yellow' : 'badge-gray'}`}>{sourceLabel(r.source)}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {past.length > 0 && (
        <div className="card-box">
          <h2 className="font-semibold text-stone-900 mb-4">過去の予約（直近20件）</h2>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-stone-500 border-b border-stone-200">
                <th className="py-2">日付</th>
                <th className="py-2">時間</th>
                <th className="py-2">顧客</th>
                <th className="py-2">メニュー</th>
                <th className="py-2">流入</th>
                <th className="py-2">ステータス</th>
                <th className="py-2 text-right">金額</th>
              </tr>
            </thead>
            <tbody>
              {past.map(r => {
                const cust = customers.find(c => c.id === r.customerId);
                return (
                  <tr key={r.id} className="border-b border-stone-100">
                    <td className="py-2">{fmtDate(r.date)}</td>
                    <td className="py-2 text-stone-600 font-mono text-xs">{r.startTime}</td>
                    <td className="py-2">{cust?.name || '—'}</td>
                    <td className="py-2 text-stone-600">{r.menuName}</td>
                    <td className="py-2"><span className="badge badge-gray">{sourceLabel(r.source)}</span></td>
                    <td className="py-2"><span className="badge badge-green">{statusLabel(r.status)}</span></td>
                    <td className="py-2 text-right font-medium">{r.menuPrice ? yen(r.menuPrice) : '—'}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
