import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireRole } from '@/lib/auth';

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const s = await requireRole(['admin']);
    if (!s.salonId) return NextResponse.json({ error: 'no salon' }, { status: 403 });
    const { id } = await params;

    const existing = await prisma.menu.findFirst({ where: { id, salonId: s.salonId } });
    if (!existing) return NextResponse.json({ error: 'not found' }, { status: 404 });

    const body = await req.json();
    const m = await prisma.menu.update({
      where: { id },
      data: {
        name: body.name ?? existing.name,
        category: body.category ?? existing.category,
        price: body.price != null ? parseInt(body.price, 10) : existing.price,
        durationMinutes: body.durationMinutes != null ? parseInt(body.durationMinutes, 10) : existing.durationMinutes,
        description: body.description ?? existing.description,
        isActive: typeof body.isActive === 'boolean' ? body.isActive : existing.isActive,
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

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const s = await requireRole(['admin']);
    if (!s.salonId) return NextResponse.json({ error: 'no salon' }, { status: 403 });
    const { id } = await params;
    const existing = await prisma.menu.findFirst({ where: { id, salonId: s.salonId } });
    if (!existing) return NextResponse.json({ error: 'not found' }, { status: 404 });
    await prisma.menu.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (err) {
    if (err instanceof Error && (err.message === 'UNAUTHORIZED' || err.message === 'FORBIDDEN')) {
      return NextResponse.json({ error: err.message }, { status: 401 });
    }
    return NextResponse.json({ error: 'サーバーエラー' }, { status: 500 });
  }
}
