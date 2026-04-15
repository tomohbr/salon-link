import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireRole } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const s = await requireRole(['admin']);
    if (!s.salonId) return NextResponse.json({ error: 'no salon' }, { status: 403 });
    const body = await req.json();
    if (!body.title || !body.discountValue) return NextResponse.json({ error: '必須項目が不足しています' }, { status: 400 });

    const c = await prisma.coupon.create({
      data: {
        salonId: s.salonId,
        title: body.title,
        description: body.description || null,
        discountType: body.discountType === 'amount' ? 'amount' : 'percent',
        discountValue: parseInt(body.discountValue, 10) || 0,
        minPurchase: parseInt(body.minPurchase, 10) || 0,
        validFrom: body.validFrom || null,
        validUntil: body.validUntil || null,
        maxUses: body.maxUses ? parseInt(body.maxUses, 10) : null,
        targetSegment: body.targetSegment || 'all',
        code: body.code || null,
        isActive: body.isActive !== false,
      },
    });
    return NextResponse.json({ ok: true, coupon: c });
  } catch (err) {
    if (err instanceof Error && (err.message === 'UNAUTHORIZED' || err.message === 'FORBIDDEN')) {
      return NextResponse.json({ error: err.message }, { status: 401 });
    }
    return NextResponse.json({ error: 'サーバーエラー' }, { status: 500 });
  }
}
