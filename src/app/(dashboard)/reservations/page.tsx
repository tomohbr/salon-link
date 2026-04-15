import { getCurrentSalon } from '@/lib/salonData';
import { getWeekCalendar } from '@/lib/availability';
import { prisma } from '@/lib/db';
import { yen, fmtDate, sourceLabel } from '@/lib/utils/format';
import ReservationsClient from './ReservationsClient';

export default async function ReservationsPage({ searchParams }: { searchParams: Promise<{ week?: string }> }) {
  const sp = await searchParams;
  const { salon } = await getCurrentSalon();

  // 週の開始日（パラメータ or 今週の月曜）
  const today = new Date();
  const mondayOffset = (today.getDay() + 6) % 7;
  const defaultMonday = new Date(today);
  defaultMonday.setDate(today.getDate() - mondayOffset);
  const weekStart = sp.week || defaultMonday.toISOString().slice(0, 10);

  const week = await getWeekCalendar(salon.id, weekStart);
  const menus = await prisma.menu.findMany({
    where: { salonId: salon.id, isActive: true },
    orderBy: { sortOrder: 'asc' },
    select: { id: true, name: true, price: true, durationMinutes: true, category: true },
  });

  // チャネル別予約数（今週）
  const sourceCounts: Record<string, number> = { hotpepper: 0, line: 0, web: 0, manual: 0, other: 0 };
  week.forEach((d) => {
    d.reservations.forEach((r) => {
      const key = ['hotpepper', 'line', 'web', 'manual'].includes(r.source) ? r.source : 'other';
      sourceCounts[key] = (sourceCounts[key] || 0) + 1;
    });
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-stone-900">予約管理</h1>
          <p className="text-sm text-stone-500 mt-1">
            HPB・LINE・自社HPの全予約を1つのカレンダーで管理
          </p>
        </div>
      </div>

      {/* チャネル別サマリー */}
      <div className="grid grid-cols-4 gap-3">
        <ChannelCard label="ホットペッパー" count={sourceCounts.hotpepper} color="yellow" icon="🔥" />
        <ChannelCard label="LINE" count={sourceCounts.line} color="green" icon="💬" />
        <ChannelCard label="自社HP" count={sourceCounts.web} color="blue" icon="🌐" />
        <ChannelCard label="手動/電話" count={(sourceCounts.manual || 0) + (sourceCounts.other || 0)} color="gray" icon="📞" />
      </div>

      <ReservationsClient
        salonSlug={salon.slug}
        week={week}
        menus={menus}
        weekStart={weekStart}
      />

      {/* 今後の予約一覧（リスト表示） */}
      <div className="card-box">
        <h2 className="font-semibold text-stone-900 mb-4">今週の予約一覧</h2>
        {week.flatMap((d) => d.reservations).length === 0 ? (
          <p className="text-sm text-stone-500 py-6 text-center">今週の予約はありません</p>
        ) : (
          <div className="space-y-4">
            {week.map((d) => {
              if (d.reservations.length === 0) return null;
              return (
                <div key={d.date}>
                  <div className="text-sm font-semibold text-stone-700 mb-2">
                    <span className="brand-text">{fmtDate(d.date)}</span>
                    <span className="text-xs text-stone-400 ml-2">({d.dow}) {d.reservations.length}件</span>
                  </div>
                  <div className="space-y-2">
                    {d.reservations.map((r) => (
                      <div key={r.id} className="flex items-center gap-4 p-3 bg-stone-50 rounded-lg">
                        <div className="text-sm font-mono font-semibold w-20">
                          {r.startTime}-{r.endTime}
                        </div>
                        <div className="flex-1">
                          <div className="font-medium text-sm">{r.customerName || '—'}</div>
                          <div className="text-xs text-stone-500">{r.menuName}</div>
                        </div>
                        <span
                          className={`badge ${
                            r.source === 'line'
                              ? 'badge-green'
                              : r.source === 'hotpepper'
                              ? 'badge-yellow'
                              : r.source === 'web'
                              ? 'badge-blue'
                              : 'badge-gray'
                          }`}
                        >
                          {sourceLabel(r.source)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function ChannelCard({ label, count, color, icon }: { label: string; count: number; color: string; icon: string }) {
  return (
    <div className={`card-box border-l-4 ${color === 'yellow' ? 'border-l-amber-400' : color === 'green' ? 'border-l-emerald-400' : color === 'blue' ? 'border-l-blue-400' : 'border-l-stone-400'}`}>
      <div className="flex items-center justify-between">
        <div>
          <div className="text-xs text-stone-500">{label}</div>
          <div className="text-xl font-bold mt-1">{count}<span className="text-xs text-stone-500 ml-1">件</span></div>
        </div>
        <div className="text-2xl">{icon}</div>
      </div>
    </div>
  );
}
