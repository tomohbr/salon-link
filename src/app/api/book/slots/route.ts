// 空き枠取得API
// 呼び出し元: 自社HP予約ページ (/book/[slug]) / LINE LIFF / 外部連携
// 全チャネルがこのエンドポイントを叩くことで、同じ空き枠が表示される
//
// GET /api/book/slots?slug=xxx&date=2026-04-20&menuId=yyy

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getAvailableSlots } from '@/lib/availability';

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const slug = searchParams.get('slug');
  const date = searchParams.get('date');
  const menuId = searchParams.get('menuId');

  if (!slug || !date || !menuId) {
    return NextResponse.json({ error: 'slug, date, menuId が必要です' }, { status: 400 });
  }

  const salon = await prisma.salon.findUnique({
    where: { slug },
    include: { menus: { where: { id: menuId } } },
  });
  if (!salon || salon.status !== 'active') {
    return NextResponse.json({ error: '店舗が見つかりません' }, { status: 404 });
  }
  const menu = salon.menus[0];
  if (!menu) {
    return NextResponse.json({ error: 'メニューが見つかりません' }, { status: 404 });
  }

  const slots = await getAvailableSlots(salon.id, date, menu.durationMinutes);

  return NextResponse.json({
    salonId: salon.id,
    menuName: menu.name,
    durationMinutes: menu.durationMinutes,
    date,
    slots,
  });
}
