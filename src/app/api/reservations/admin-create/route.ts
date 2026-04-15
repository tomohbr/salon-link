// 管理画面から予約を手動作成するAPI
// 用途:
//   1. HPB経由の予約を取り込む（source='hotpepper'で登録）
//   2. 電話予約の登録
//   3. ウォークイン客の記録
//
// HPB予約は実際にはHotPepper Beautyから自動同期する公開APIが存在しないため、
// 本システムでは以下のいずれかで取り込む設計:
//   a) 管理画面の「HPB予約を追加」ボタンで手動入力（このAPI）
//   b) SalonBoardからのiCalエクスポートを定期取込（将来実装）
//   c) CSV一括取込（将来実装）

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireRole } from '@/lib/auth';
import { getAvailableSlots } from '@/lib/availability';

export async function POST(req: NextRequest) {
  try {
    const session = await requireRole(['admin', 'staff']);
    if (!session.salonId) return NextResponse.json({ error: 'no salon' }, { status: 403 });

    const { menuId, date, startTime, customerName, phone, source } = await req.json();

    if (!menuId || !date || !startTime || !customerName) {
      return NextResponse.json({ error: '必須項目が不足しています' }, { status: 400 });
    }

    const menu = await prisma.menu.findFirst({
      where: { id: menuId, salonId: session.salonId },
    });
    if (!menu) return NextResponse.json({ error: 'メニュー不明' }, { status: 404 });

    // 空き枠チェック
    const slots = await getAvailableSlots(session.salonId, date, menu.durationMinutes);
    const target = slots.find((s) => s.time === startTime);
    if (!target?.available) {
      return NextResponse.json({ error: 'この時間枠は既に予約が入っています', slots }, { status: 409 });
    }

    const validSource = ['line', 'web', 'hotpepper', 'phone', 'walk_in', 'manual'].includes(source) ? source : 'manual';

    // 顧客検索 or 新規
    let customer = phone
      ? await prisma.customer.findFirst({ where: { salonId: session.salonId, phone } })
      : null;
    if (!customer) {
      customer = await prisma.customer.create({
        data: {
          salonId: session.salonId,
          name: customerName,
          phone: phone || null,
          source: validSource === 'hotpepper' ? 'hotpepper' : validSource === 'line' ? 'line' : 'other',
          firstVisitDate: date,
        },
      });
    }

    const [sh, sm] = startTime.split(':').map(Number);
    const endMin = sh * 60 + sm + menu.durationMinutes;
    const endTime = `${String(Math.floor(endMin / 60)).padStart(2, '0')}:${String(endMin % 60).padStart(2, '0')}`;

    const r = await prisma.reservation.create({
      data: {
        salonId: session.salonId,
        customerId: customer.id,
        menuId: menu.id,
        menuName: menu.name,
        menuPrice: menu.price,
        date,
        startTime,
        endTime,
        status: 'confirmed',
        source: validSource as 'line' | 'web' | 'hotpepper' | 'phone' | 'walk_in' | 'manual',
      },
    });

    return NextResponse.json({ ok: true, reservation: r });
  } catch (err) {
    if (err instanceof Error && (err.message === 'UNAUTHORIZED' || err.message === 'FORBIDDEN')) {
      return NextResponse.json({ error: err.message }, { status: 401 });
    }
    console.error(err);
    return NextResponse.json({ error: 'サーバーエラー' }, { status: 500 });
  }
}
