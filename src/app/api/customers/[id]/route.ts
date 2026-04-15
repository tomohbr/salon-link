import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireRole } from '@/lib/auth';

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const s = await requireRole(['admin', 'staff']);
    if (!s.salonId) return NextResponse.json({ error: 'no salon' }, { status: 403 });
    const { id } = await params;

    const existing = await prisma.customer.findFirst({ where: { id, salonId: s.salonId } });
    if (!existing) return NextResponse.json({ error: 'not found' }, { status: 404 });

    const { name, nameKana, phone, email, source, notes, isLineFriend } = await req.json();
    const c = await prisma.customer.update({
      where: { id },
      data: {
        name: name ?? existing.name,
        nameKana: nameKana ?? existing.nameKana,
        phone: phone ?? existing.phone,
        email: email ?? existing.email,
        source: source ?? existing.source,
        notes: notes ?? existing.notes,
        isLineFriend: typeof isLineFriend === 'boolean' ? isLineFriend : existing.isLineFriend,
      },
    });
    return NextResponse.json({ ok: true, customer: c });
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
    const existing = await prisma.customer.findFirst({ where: { id, salonId: s.salonId } });
    if (!existing) return NextResponse.json({ error: 'not found' }, { status: 404 });
    await prisma.customer.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (err) {
    if (err instanceof Error && (err.message === 'UNAUTHORIZED' || err.message === 'FORBIDDEN')) {
      return NextResponse.json({ error: err.message }, { status: 401 });
    }
    return NextResponse.json({ error: 'サーバーエラー' }, { status: 500 });
  }
}
