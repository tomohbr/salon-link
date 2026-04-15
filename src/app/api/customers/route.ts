import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireRole } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const s = await requireRole(['admin', 'staff']);
    if (!s.salonId) return NextResponse.json({ error: 'no salon' }, { status: 403 });
    const { name, nameKana, phone, email, source, notes, isLineFriend } = await req.json();
    if (!name) return NextResponse.json({ error: '名前は必須です' }, { status: 400 });

    const validSource = ['hotpepper', 'line', 'instagram', 'referral', 'walk_in', 'web', 'other'].includes(source) ? source : 'other';

    const c = await prisma.customer.create({
      data: {
        salonId: s.salonId,
        name,
        nameKana: nameKana || null,
        phone: phone || null,
        email: email || null,
        source: validSource,
        notes: notes || null,
        isLineFriend: !!isLineFriend,
        firstVisitDate: new Date().toISOString().slice(0, 10),
      },
    });
    return NextResponse.json({ ok: true, customer: c });
  } catch (err) {
    if (err instanceof Error && (err.message === 'UNAUTHORIZED' || err.message === 'FORBIDDEN')) {
      return NextResponse.json({ error: err.message }, { status: 401 });
    }
    console.error(err);
    return NextResponse.json({ error: 'サーバーエラー' }, { status: 500 });
  }
}
