import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { requireRole } from '@/lib/auth';
import { toCsv, csvResponse } from '@/lib/csvExport';
import { logAudit } from '@/lib/audit';

export async function GET(req: NextRequest) {
  try {
    const s = await requireRole(['admin']);
    if (!s.salonId) return new Response('no salon', { status: 403 });

    const customers = await prisma.customer.findMany({
      where: { salonId: s.salonId },
      orderBy: { createdAt: 'desc' },
    });

    const csv = toCsv(
      [
        { key: 'name', label: 'お客様名' },
        { key: 'nameKana', label: 'ふりがな' },
        { key: 'phone', label: '電話番号' },
        { key: 'email', label: 'メールアドレス' },
        { key: 'source', label: '流入元' },
        { key: 'firstVisitDate', label: '初回来店日' },
        { key: 'lastVisitDate', label: '最終来店日' },
        { key: 'visitCount', label: '来店回数' },
        { key: 'totalSpent', label: '累計売上' },
        { key: 'isLineFriend', label: 'LINE友だち' },
        { key: 'notes', label: 'メモ' },
      ],
      customers.map((c) => ({
        ...c,
        isLineFriend: c.isLineFriend ? 'はい' : 'いいえ',
      })) as unknown as Record<string, unknown>[]
    );

    logAudit({ action: 'export.customers', entityType: 'customer', after: { count: customers.length } }, req.headers);

    const ymd = new Date().toISOString().slice(0, 10);
    return csvResponse(csv, `customers_${ymd}.csv`);
  } catch (err) {
    if (err instanceof Error && (err.message === 'UNAUTHORIZED' || err.message === 'FORBIDDEN')) {
      return new Response('unauthorized', { status: 401 });
    }
    console.error(err);
    return new Response('server error', { status: 500 });
  }
}
