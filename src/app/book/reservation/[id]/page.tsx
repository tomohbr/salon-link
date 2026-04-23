// 顧客向け予約詳細ページ (認証なし / HMAC コード必須)
// URL: /book/reservation/[id]?code=xxxxx

import { rawPrisma } from '@/lib/db';
import { verifyAccessCode } from '@/lib/bookingAccess';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { yen, fmtDate } from '@/lib/utils/format';
import { Sparkles, MapPin, Phone, Calendar, Clock, Tag, Check, AlertCircle } from 'lucide-react';
import ReservationActions from './ReservationActions';

export default async function ReservationDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ code?: string }>;
}) {
  const { id } = await params;
  const { code } = await searchParams;

  if (!code || !verifyAccessCode(id, code)) {
    return <InvalidAccess />;
  }

  const reservation = await rawPrisma.reservation.findUnique({
    where: { id },
    include: {
      customer: true,
      staff: true,
      menu: true,
      salon: true,
    },
  });

  if (!reservation || reservation.salon.status !== 'active') return notFound();

  const isPast = reservation.date < new Date().toISOString().slice(0, 10);
  const isCancelled = reservation.status === 'cancelled';
  const isCompleted = reservation.status === 'completed';

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 to-white">
      <div className="max-w-md mx-auto bg-white min-h-screen shadow-xl">
        {/* Header */}
        <div className="brand-bg text-white p-6">
          <div className="flex items-center gap-2 text-xs mb-3 opacity-80">
            <Sparkles className="w-3 h-3" />ご予約確認
          </div>
          <h1 className="text-2xl font-bold">{reservation.salon.name}</h1>
          <p className="text-xs opacity-90 mt-1">{reservation.salon.description}</p>
        </div>

        {/* ステータスバッジ */}
        <div className="p-4 pb-0">
          {isCancelled && (
            <div className="p-3 rounded-lg flex items-center gap-2 text-sm" style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#991b1b' }}>
              <AlertCircle className="w-4 h-4" />このご予約はキャンセル済みです
            </div>
          )}
          {isCompleted && (
            <div className="p-3 rounded-lg flex items-center gap-2 text-sm" style={{ background: '#ecfdf5', border: '1px solid #a7f3d0', color: '#065f46' }}>
              <Check className="w-4 h-4" />ご来店ありがとうございました
            </div>
          )}
          {!isCancelled && !isCompleted && !isPast && (
            <div className="p-3 rounded-lg flex items-center gap-2 text-sm" style={{ background: '#eff6ff', border: '1px solid #bfdbfe', color: '#1e40af' }}>
              <Check className="w-4 h-4" />ご予約が確定しています
            </div>
          )}
        </div>

        {/* 予約詳細 */}
        <div className="p-4 space-y-4">
          <Detail icon={<Tag className="w-4 h-4" />} label="メニュー" value={reservation.menuName || '—'} />
          <Detail icon={<Calendar className="w-4 h-4" />} label="日付" value={fmtDate(reservation.date)} />
          <Detail icon={<Clock className="w-4 h-4" />} label="時間" value={`${reservation.startTime} 〜 ${reservation.endTime}`} />
          {reservation.staff && <Detail icon={<Sparkles className="w-4 h-4" />} label="担当" value={reservation.staff.name} />}
          <Detail icon={<Tag className="w-4 h-4" />} label="料金" value={reservation.menuPrice ? yen(reservation.menuPrice) : '—'} />
          {reservation.customer && (
            <Detail icon={<Sparkles className="w-4 h-4" />} label="お名前" value={reservation.customer.name} />
          )}
        </div>

        {/* 店舗情報 */}
        <div className="p-4 mx-4 mb-4 rounded-lg text-xs space-y-1" style={{ background: 'var(--gray-50)' }}>
          {reservation.salon.address && (
            <div className="flex items-center gap-2" style={{ color: 'var(--gray-700)' }}>
              <MapPin className="w-3 h-3" />{reservation.salon.address}
            </div>
          )}
          {reservation.salon.phone && (
            <div className="flex items-center gap-2" style={{ color: 'var(--gray-700)' }}>
              <Phone className="w-3 h-3" />{reservation.salon.phone}
            </div>
          )}
        </div>

        {/* アクション */}
        {!isCancelled && !isCompleted && !isPast && (
          <ReservationActions reservationId={reservation.id} accessCode={code} />
        )}

        {/* フッター */}
        <div className="p-4 text-center text-[10px]" style={{ color: 'var(--gray-400)' }}>
          <Link href={`/book/${reservation.salon.slug}`} className="underline">
            他の日時で予約する
          </Link>
        </div>
      </div>
    </div>
  );
}

function Detail({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3 py-2" style={{ borderBottom: '1px solid var(--gray-100)' }}>
      <div className="mt-0.5" style={{ color: 'var(--brand)' }}>{icon}</div>
      <div className="flex-1">
        <div className="text-[10px] tracking-wider uppercase mb-0.5" style={{ color: 'var(--gray-500)' }}>{label}</div>
        <div className="text-sm font-medium" style={{ color: 'var(--gray-900)' }}>{value}</div>
      </div>
    </div>
  );
}

function InvalidAccess() {
  return (
    <div className="min-h-screen flex items-center justify-center p-5" style={{ background: 'var(--gray-0)' }}>
      <div className="max-w-md w-full text-center">
        <div className="w-14 h-14 rounded-full mx-auto mb-4 flex items-center justify-center" style={{ background: 'var(--color-danger-bg)' }}>
          <AlertCircle className="w-7 h-7" style={{ color: 'var(--color-danger)' }} />
        </div>
        <h1 className="text-xl font-bold mb-3">アクセスできません</h1>
        <p className="text-sm mb-6" style={{ color: 'var(--gray-600)' }}>
          URL が正しくないか、アクセスコードが無効です。<br />
          ご予約時のメール・LINE メッセージに記載された URL からアクセスしてください。
        </p>
        <Link href="/" className="btn-brand">トップへ戻る</Link>
      </div>
    </div>
  );
}
