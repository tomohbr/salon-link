// 顧客による予約キャンセル API (認証なし / アクセスコード必須)
// 公開エンドポイントなので middleware の origin check は middleware 側で /api/book/ を除外済み

import { NextRequest, NextResponse } from 'next/server';
import { rawPrisma } from '@/lib/db';
import { verifyAccessCode } from '@/lib/bookingAccess';
import { rateLimit, getClientIp } from '@/lib/rateLimit';
import { logAudit } from '@/lib/audit';

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const ip = getClientIp(req.headers);
    const rl = rateLimit({ key: `cancel:${ip}`, limit: 10, windowSec: 60 });
    if (!rl.ok) return NextResponse.json({ error: rl.message }, { status: 429 });

    const { code } = await req.json();
    if (!code || !verifyAccessCode(id, code)) {
      return NextResponse.json({ error: 'アクセスコードが無効です' }, { status: 403 });
    }

    const reservation = await rawPrisma.reservation.findUnique({ where: { id } });
    if (!reservation) return NextResponse.json({ error: 'not found' }, { status: 404 });
    if (reservation.status === 'cancelled') {
      return NextResponse.json({ error: '既にキャンセル済みです' }, { status: 400 });
    }
    if (reservation.status === 'completed') {
      return NextResponse.json({ error: 'ご来店済みのご予約はキャンセルできません' }, { status: 400 });
    }

    // 過去の予約はキャンセル不可
    const today = new Date().toISOString().slice(0, 10);
    if (reservation.date < today) {
      return NextResponse.json({ error: '過去の予約はキャンセルできません' }, { status: 400 });
    }

    await rawPrisma.reservation.update({
      where: { id },
      data: { status: 'cancelled' },
    });

    logAudit(
      {
        action: 'booking.cancel',
        entityType: 'reservation',
        entityId: id,
        before: { status: reservation.status },
        after: { status: 'cancelled' },
      },
      req.headers
    );

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[cancel]', err);
    return NextResponse.json({ error: 'サーバーエラー' }, { status: 500 });
  }
}
