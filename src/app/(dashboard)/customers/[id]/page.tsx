import { getCurrentSalon } from '@/lib/salonData';
import { prisma } from '@/lib/db';
import { yen, fmtDate, sourceLabel } from '@/lib/utils/format';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Phone, Mail, Calendar, MessageCircle } from 'lucide-react';

export default async function CustomerDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { salon } = await getCurrentSalon();
  const customer = await prisma.customer.findFirst({
    where: { id, salonId: salon.id },
  });
  if (!customer) return notFound();

  const treatments = await prisma.treatmentRecord.findMany({
    where: { customerId: id },
    orderBy: { date: 'desc' },
    include: { staff: true },
  });

  const avgSpend = customer.visitCount > 0 ? Math.floor(customer.totalSpent / customer.visitCount) : 0;
  const daysSinceLastVisit = customer.lastVisitDate
    ? Math.floor((Date.now() - new Date(customer.lastVisitDate).getTime()) / 86400000)
    : null;

  return (
    <div className="space-y-6">
      <Link href="/customers" className="text-sm text-stone-500 hover:text-stone-700 inline-flex items-center gap-1">
        <ArrowLeft className="w-4 h-4" /> 顧客一覧に戻る
      </Link>

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-1 space-y-4">
          <div className="card-box">
            <div className="w-20 h-20 rounded-full brand-light-bg flex items-center justify-center text-3xl brand-text font-bold mb-4">
              {customer.name.charAt(0)}
            </div>
            <h1 className="text-xl font-bold text-stone-900">{customer.name}</h1>
            <p className="text-sm text-stone-500">{customer.nameKana}</p>
            <div className="mt-4 space-y-2 text-sm">
              {customer.phone && <div className="flex items-center gap-2 text-stone-700"><Phone className="w-4 h-4 text-stone-400" />{customer.phone}</div>}
              {customer.email && <div className="flex items-center gap-2 text-stone-700"><Mail className="w-4 h-4 text-stone-400" />{customer.email}</div>}
              <div className="flex items-center gap-2 text-stone-700">
                <Calendar className="w-4 h-4 text-stone-400" />初回: {customer.firstVisitDate ? fmtDate(customer.firstVisitDate) : '—'}
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-stone-100 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-stone-500">流入元</span>
                <span className="badge badge-brand">{sourceLabel(customer.source)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-stone-500">LINE</span>
                {customer.isLineFriend ? <span className="badge badge-green">登録済</span> : <span className="badge badge-gray">未登録</span>}
              </div>
            </div>
          </div>
          {customer.isLineFriend && (
            <button className="w-full btn-brand justify-center">
              <MessageCircle className="w-4 h-4" />LINEメッセージ送信
            </button>
          )}
        </div>

        <div className="col-span-2 space-y-4">
          <div className="grid grid-cols-3 gap-3">
            <Stat label="来店回数" value={`${customer.visitCount}回`} />
            <Stat label="累計売上" value={yen(customer.totalSpent)} />
            <Stat label="平均単価" value={yen(avgSpend)} />
          </div>

          {daysSinceLastVisit !== null && daysSinceLastVisit >= 90 && (
            <div className="card-box bg-amber-50 border-amber-200">
              <div className="text-sm text-amber-900 font-semibold">⚠️ 離反リスク</div>
              <div className="text-xs text-amber-700 mt-1">
                最終来店から{daysSinceLastVisit}日経過。復帰クーポンの送信を検討してください。
              </div>
            </div>
          )}

          <div className="card-box">
            <h3 className="font-semibold text-stone-900 mb-4">施術履歴 ({treatments.length}件)</h3>
            <div className="space-y-3">
              {treatments.length === 0 ? (
                <p className="text-sm text-stone-500 py-4 text-center">施術履歴はありません</p>
              ) : (
                treatments.map((t) => (
                  <div key={t.id} className="flex gap-4 py-3 border-b border-stone-100 last:border-0">
                    <div className="w-16 text-center">
                      <div className="text-xs text-stone-500">{t.date.slice(5, 10)}</div>
                      <div className="text-xs text-stone-400">{t.date.slice(0, 4)}</div>
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-sm">{t.menuName}</div>
                      <div className="text-xs text-stone-500 mt-0.5">担当: {t.staff?.name || '—'} / {t.durationMinutes}分</div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">{yen(t.totalPrice)}</div>
                      <div className="text-xs text-amber-500">
                        {t.satisfactionScore ? '★'.repeat(t.satisfactionScore) : ''}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {customer.notes && (
            <div className="card-box">
              <h3 className="font-semibold text-stone-900 mb-2">メモ</h3>
              <p className="text-sm text-stone-600">{customer.notes}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="card-box">
      <div className="text-xs text-stone-500">{label}</div>
      <div className="text-xl font-bold text-stone-900 mt-1">{value}</div>
    </div>
  );
}
