// 予約作成API (顧客側)
// 呼び出し元: /book/[slug] の予約確定ボタン / LINE LIFF
//
// POST /api/book/reserve
// body: { slug, menuId, date, startTime, customerName, phone, email, source }

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getAvailableSlots } from '@/lib/availability';

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
    const endMin = sh * 60 + sm + menu.durationMinutes;
    const eh = Math.floor(endMin / 60);
    const em = endMin % 60;
    const endTime = `${String(eh).padStart(2, '0')}:${String(em).padStart(2, '0')}`;

    const reservation = await prisma.reservation.create({
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

    return NextResponse.json({
      ok: true,
      reservation: {
        id: reservation.id,
        date,
        startTime,
        endTime,
        menuName: menu.name,
        menuPrice: menu.price,
      },
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'サーバーエラー' }, { status: 500 });
  }
}
