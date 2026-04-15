import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireRole } from '@/lib/auth';

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const s = await requireRole(['admin']);
    if (!s.salonId) return NextResponse.json({ error: 'no salon' }, { status: 403 });
    const { id } = await params;
    const existing = await prisma.coupon.findFirst({ where: { id, salonId: s.salonId } });
    if (!existing) return NextResponse.json({ error: 'not found' }, { status: 404 });

    const body = await req.json();
    const c = await prisma.coupon.update({
      where: { id },
      data: {
        title: body.title ?? existing.title,
        description: body.description ?? existing.description,
        discountType: body.discountType ?? existing.discountType,
        discountValue: body.discountValue != null ? parseInt(body.discountValue, 10) : existing.discountValue,
        minPurchase: body.minPurchase != null ? parseInt(body.minPurchase, 10) : existing.minPurchase,
        validFrom: body.validFrom ?? existing.validFrom,
        validUntil: body.validUntil ?? existing.validUntil,
        maxUses: body.maxUses != null ? parseInt(body.maxUses, 10) : existing.maxUses,
        targetSegment: body.targetSegment ?? existing.targetSegment,
        code: body.code ?? existing.code,
        isActive: typeof body.isActive === 'boolean' ? body.isActive : existing.isActive,
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

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const s = await requireRole(['admin']);
    if (!s.salonId) return NextResponse.json({ error: 'no salon' }, { status: 403 });
    const { id } = await params;
    const existing = await prisma.coupon.findFirst({ where: { id, salonId: s.salonId } });
    if (!existing) return NextResponse.json({ error: 'not found' }, { status: 404 });
    await prisma.coupon.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (err) {
    if (err instanceof Error && (err.message === 'UNAUTHORIZED' || err.message === 'FORBIDDEN')) {
      return NextResponse.json({ error: err.message }, { status: 401 });
    }
    return NextResponse.json({ error: 'サーバーエラー' }, { status: 500 });
  }
}
