import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireRole } from '@/lib/auth';

export async function PATCH(req: NextRequest) {
  try {
    const s = await requireRole(['admin']);
    if (!s.salonId) return NextResponse.json({ error: 'no salon' }, { status: 403 });
    const body = await req.json();

    const existing = await prisma.salon.findUnique({ where: { id: s.salonId } });
    if (!existing) return NextResponse.json({ error: 'not found' }, { status: 404 });

    const salon = await prisma.salon.update({
      where: { id: s.salonId },
      data: {
        name: body.name ?? existing.name,
        address: body.address ?? existing.address,
        phone: body.phone ?? existing.phone,
        description: body.description ?? existing.description,
        lineChannelId: body.lineChannelId ?? existing.lineChannelId,
        lineChannelSecret: body.lineChannelSecret ?? existing.lineChannelSecret,
        lineAccessToken: body.lineAccessToken ?? existing.lineAccessToken,
        lineLiffId: body.lineLiffId ?? existing.lineLiffId,
        businessHours: body.businessHours ?? existing.businessHours ?? {},
      },
    });
    return NextResponse.json({ ok: true, salon });
  } catch (err) {
    if (err instanceof Error && (err.message === 'UNAUTHORIZED' || err.message === 'FORBIDDEN')) {
      return NextResponse.json({ error: err.message }, { status: 401 });
    }
    return NextResponse.json({ error: 'サーバーエラー' }, { status: 500 });
  }
}
