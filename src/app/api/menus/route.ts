import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireRole } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const s = await requireRole(['admin']);
    if (!s.salonId) return NextResponse.json({ error: 'no salon' }, { status: 403 });
    const { name, category, price, durationMinutes, description, isActive } = await req.json();
    if (!name || !price) return NextResponse.json({ error: '必須項目が不足しています' }, { status: 400 });

    const m = await prisma.menu.create({
      data: {
        salonId: s.salonId,
        name,
        category: category || 'その他',
        price: parseInt(price, 10) || 0,
        durationMinutes: parseInt(durationMinutes, 10) || 60,
        description: description || null,
        isActive: isActive !== false,
      },
    });
    return NextResponse.json({ ok: true, menu: m });
  } catch (err) {
    if (err instanceof Error && (err.message === 'UNAUTHORIZED' || err.message === 'FORBIDDEN')) {
      return NextResponse.json({ error: err.message }, { status: 401 });
    }
    return NextResponse.json({ error: 'サーバーエラー' }, { status: 500 });
  }
}
