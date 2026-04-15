import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireRole } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const s = await requireRole(['admin', 'staff']);
    if (!s.salonId) return NextResponse.json({ error: 'no salon' }, { status: 403 });
    const { customerId, date, menuName, totalPrice, durationMinutes, notes, satisfactionScore } = await req.json();
    if (!customerId || !date || !menuName) {
      return NextResponse.json({ error: '必須項目が不足しています' }, { status: 400 });
    }

    const customer = await prisma.customer.findFirst({ where: { id: customerId, salonId: s.salonId } });
    if (!customer) return NextResponse.json({ error: '顧客が見つかりません' }, { status: 404 });

    const r = await prisma.treatmentRecord.create({
      data: {
        salonId: s.salonId,
        customerId,
        date,
        menuName,
        totalPrice: parseInt(totalPrice, 10) || 0,
        durationMinutes: parseInt(durationMinutes, 10) || 60,
        notes: notes || null,
        satisfactionScore: satisfactionScore ? parseInt(satisfactionScore, 10) : null,
      },
    });

    // 顧客の来店回数・累計売上を更新
    await prisma.customer.update({
      where: { id: customerId },
      data: {
        visitCount: { increment: 1 },
        totalSpent: { increment: parseInt(totalPrice, 10) || 0 },
        lastVisitDate: date,
      },
    });

    return NextResponse.json({ ok: true, treatment: r });
  } catch (err) {
    if (err instanceof Error && (err.message === 'UNAUTHORIZED' || err.message === 'FORBIDDEN')) {
      return NextResponse.json({ error: err.message }, { status: 401 });
    }
    return NextResponse.json({ error: 'サーバーエラー' }, { status: 500 });
  }
}
