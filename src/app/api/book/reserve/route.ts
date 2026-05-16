// 予約作成API (顧客側)
// 呼び出し元: /book/[slug] の予約確定ボタン / LINE LIFF
//
// POST /api/book/reserve
// body: { slug, menuId, date, startTime, customerName, phone, email, source }

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getAvailableSlots } from '@/lib/availability';
import { buildAccessUrl } from '@/lib/bookingAccess';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { slug, menuId, date, startTime, customerName, phone, email, source } = body;

    if (!slug || !menuId || !date || !startTime || !customerName) {
      return NextResponse.json({ error: '必須項目が不足しています' }, { status: 400 });
    }

    const salon = await prisma.salon.findUnique({
      where: { slug },
      include: { menus: { where: { id: menuId } } },
    });
    if (!salon || salon.status !== 'active') {
      return NextResponse.json({ error: '店舗が見つかりません' }, { status: 404 });
    }
    const menu = salon.menus[0];
    if (!menu) return NextResponse.json({ error: 'メニューが見つかりません' }, { status: 404 });

    // 空き枠再チェック（競合防止）
    const slots = await getAvailableSlots(salon.id, date, menu.durationMinutes);
    const target = slots.find((s) => s.time === startTime);
    if (!target?.available) {
      return NextResponse.json({ error: 'この時間枠は既に埋まっています' }, { status: 409 });
    }

    // 既存顧客を検索（電話 or メール）、無ければ作成
    let customer = null;
    if (phone || email) {
      customer = await prisma.customer.findFirst({
        where: {
          salonId: salon.id,
          OR: [phone ? { phone } : null, email ? { email } : null].filter(Boolean) as Array<{ phone?: string; email?: string }>,
        },
      });
    }
    const validSource = ['line', 'web', 'hotpepper', 'phone', 'walk_in'].includes(source) ? source : 'web';
    if (!customer) {
      customer = await prisma.customer.create({
        data: {
          salonId: salon.id,
          name: customerName,
          phone: phone || null,
          email: email || null,
          source: validSource === 'hotpepper' ? 'hotpepper' : validSource === 'line' ? 'line' : 'web',
          firstVisitDate: date,
          visitCount: 0,
        },
      });
    }

    // 終了時刻を計算
    const [sh, sm] = startTime.split(':').map(Number);
    const startMin = sh * 60 + sm;
    const endMin = startMin + menu.durationMinutes;
    const eh = Math.floor(endMin / 60);
    const em = endMin % 60;
    const endTime = `${String(eh).padStart(2, '0')}:${String(em).padStart(2, '0')}`;

    const toMin = (hhmm: string) => {
      const [h, m] = hhmm.split(':').map(Number);
      return h * 60 + m;
    };

    // ダブルブッキング防止: 重複チェックと作成を Serializable トランザクションで実行。
    // 上の getAvailableSlots チェックだけだと、同じ枠への同時リクエストが
    // 両方ともチェックを通過して二重予約になる（非トランザクションの競合）。
    let reservation;
    try {
      reservation = await prisma.$transaction(
        async (tx) => {
          const sameDay = await tx.reservation.findMany({
            where: { salonId: salon.id, date, status: { in: ['pending', 'confirmed', 'completed'] } },
            select: { startTime: true, endTime: true },
          });
          const overlap = sameDay.some((r) => {
            return startMin < toMin(r.endTime) && endMin > toMin(r.startTime);
          });
          if (overlap) throw new Error('SLOT_TAKEN');
          return tx.reservation.create({
            data: {
              salonId: salon.id,
              customerId: customer.id,
              menuId: menu.id,
              menuName: menu.name,
              menuPrice: menu.price,
              date,
              startTime,
              endTime,
              status: 'confirmed',
              source: validSource as 'line' | 'web' | 'hotpepper' | 'phone' | 'walk_in',
            },
          });
        },
        { isolationLevel: 'Serializable' },
      );
    } catch (e) {
      // 明示的な重複、または Serializable の競合失敗(P2034: 別の予約が先に確定)
      const code = (e as { code?: string })?.code;
      if ((e instanceof Error && e.message === 'SLOT_TAKEN') || code === 'P2034') {
        return NextResponse.json({ error: 'この時間枠は既に埋まっています' }, { status: 409 });
      }
      throw e;
    }

    const origin = process.env.NEXT_PUBLIC_APP_URL || req.nextUrl.origin;
    const accessUrl = buildAccessUrl(origin, reservation.id);

    return NextResponse.json({
      ok: true,
      reservation: {
        id: reservation.id,
        date,
        startTime,
        endTime,
        menuName: menu.name,
        menuPrice: menu.price,
        accessUrl,
      },
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'サーバーエラー' }, { status: 500 });
  }
}
