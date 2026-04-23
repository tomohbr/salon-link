import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { requireRole } from '@/lib/auth';
import { toCsv, csvResponse } from '@/lib/csvExport';
import { getJstMonthBounds, jstDate } from '@/lib/jst';
import { logAudit } from '@/lib/audit';

export async function GET(req: NextRequest) {
  try {
    const s = await requireRole(['admin']);
    if (!s.salonId) return new Response('no salon', { status: 403 });

    // クエリ: ?month=YYYY-MM (省略時は当月)
    const monthParam = req.nextUrl.searchParams.get('month');
    let startStr: string, endStr: string, monthLabel: string;
    if (monthParam && /^\d{4}-\d{2}$/.test(monthParam)) {
      const [y, m] = monthParam.split('-').map(Number);
      startStr = `${y}-${String(m).padStart(2, '0')}-01`;
      const nextY = m === 12 ? y + 1 : y;
      const nextM = m === 12 ? 1 : m + 1;
      endStr = `${nextY}-${String(nextM).padStart(2, '0')}-01`;
      monthLabel = monthParam;
    } else {
      const b = getJstMonthBounds();
      startStr = b.startStr;
      endStr = b.endStr;
      monthLabel = jstDate().slice(0, 7);
    }

    const reservations = await prisma.reservation.findMany({
      where: {
        salonId: s.salonId,
        date: { gte: startStr, lt: endStr },
      },
      include: { customer: true, staff: true, menu: true },
      orderBy: [{ date: 'asc' }, { startTime: 'asc' }],
    });

    const rows = reservations.map((r) => ({
      date: r.date,
      startTime: r.startTime,
      endTime: r.endTime,
      customerName: r.customer?.name || '',
      customerPhone: r.customer?.phone || '',
      menuName: r.menuName || '',
      menuPrice: r.menuPrice ?? 0,
      staff: r.staff?.name || '',
      source: sourceJa(r.source),
      status: statusJa(r.status),
      paidAmount: r.paidAmount ?? '',
      retailAmount: r.retailAmount ?? '',
      tip: r.tip ?? '',
      designationFee: r.designationFee ?? '',
      paymentMethod: paymentJa(r.paymentMethod),
      paidAt: r.paidAt ? r.paidAt.toISOString() : '',
      externalId: r.externalId || '',
    }));

    const csv = toCsv(
      [
        { key: 'date', label: '日付' },
        { key: 'startTime', label: '開始' },
        { key: 'endTime', label: '終了' },
        { key: 'customerName', label: 'お客様' },
        { key: 'customerPhone', label: '電話' },
        { key: 'menuName', label: 'メニュー' },
        { key: 'menuPrice', label: 'メニュー価格' },
        { key: 'staff', label: '担当' },
        { key: 'source', label: '流入元' },
        { key: 'status', label: 'ステータス' },
        { key: 'paidAmount', label: '施術支払額' },
        { key: 'retailAmount', label: '店販' },
        { key: 'tip', label: 'チップ' },
        { key: 'designationFee', label: '指名料' },
        { key: 'paymentMethod', label: '支払方法' },
        { key: 'paidAt', label: '精算日時' },
        { key: 'externalId', label: 'HPB予約番号' },
      ],
      rows as unknown as Record<string, unknown>[]
    );

    logAudit(
      { action: 'export.reservations', entityType: 'reservation', after: { month: monthLabel, count: rows.length } },
      req.headers
    );

    return csvResponse(csv, `reservations_${monthLabel}.csv`);
  } catch (err) {
    if (err instanceof Error && (err.message === 'UNAUTHORIZED' || err.message === 'FORBIDDEN')) {
      return new Response('unauthorized', { status: 401 });
    }
    console.error(err);
    return new Response('server error', { status: 500 });
  }
}

function sourceJa(s: string): string {
  const m: Record<string, string> = {
    hotpepper: 'ホットペッパー', line: 'LINE', web: '自社Web', instagram: 'Instagram',
    referral: '紹介', walk_in: '飛び込み', phone: '電話', manual: '手動', other: 'その他',
  };
  return m[s] || s;
}
function statusJa(s: string): string {
  const m: Record<string, string> = {
    pending: '仮予約', confirmed: '確定', completed: '完了', cancelled: 'キャンセル', no_show: '無断キャンセル',
  };
  return m[s] || s;
}
function paymentJa(s: string | null): string {
  if (!s) return '';
  const m: Record<string, string> = {
    cash: '現金', credit: 'クレジット', qr: 'QR決済',
    coin: 'COIN+', point: 'HPBポイント', other: 'その他',
  };
  return m[s] || s;
}
