'use server';

// 精算 Server Action
// PaymentButton から FormData で呼ばれる。
// status → completed, paidAt 記録、Customer の visitCount/totalSpent を increment。

import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/db';
import { requireRole } from '@/lib/auth';
import { logAudit } from '@/lib/audit';
import { paymentRecordSchema } from '@/lib/validation/schemas';
import { headers } from 'next/headers';

export interface PaymentResult {
  ok: boolean;
  error?: string;
}

export async function recordPayment(formData: FormData): Promise<PaymentResult> {
  try {
    const session = await requireRole(['admin', 'staff']);
    if (!session.salonId) return { ok: false, error: 'no salon' };

    const parsed = paymentRecordSchema.safeParse({
      reservationId: formData.get('reservationId'),
      paymentMethod: formData.get('paymentMethod'),
      paidAmount: formData.get('paidAmount'),
      retailAmount: formData.get('retailAmount') || 0,
      tip: formData.get('tip') || 0,
      designationFee: formData.get('designationFee') || 0,
    });
    if (!parsed.success) {
      return { ok: false, error: parsed.error.issues[0]?.message || 'バリデーション失敗' };
    }

    const reservation = await prisma.reservation.findFirst({
      where: { id: parsed.data.reservationId, salonId: session.salonId },
    });
    if (!reservation) return { ok: false, error: '予約が見つかりません' };

    const totalCharged =
      parsed.data.paidAmount + parsed.data.retailAmount + parsed.data.tip + parsed.data.designationFee;

    const updated = await prisma.reservation.update({
      where: { id: reservation.id },
      data: {
        status: 'completed',
        paidAt: new Date(),
        paymentMethod: parsed.data.paymentMethod,
        paidAmount: parsed.data.paidAmount,
        retailAmount: parsed.data.retailAmount,
        tip: parsed.data.tip,
        designationFee: parsed.data.designationFee,
      },
    });

    if (reservation.customerId) {
      await prisma.customer.update({
        where: { id: reservation.customerId },
        data: {
          visitCount: { increment: 1 },
          totalSpent: { increment: totalCharged },
          lastVisitDate: reservation.date,
        },
      });
    }

    const h = await headers();
    logAudit(
      {
        action: 'reservation.payment',
        entityType: 'reservation',
        entityId: reservation.id,
        before: { status: reservation.status },
        after: { status: 'completed', paidAmount: totalCharged },
      },
      h
    );

    revalidatePath('/reservations');
    revalidatePath('/sales');
    revalidatePath('/dashboard');

    return { ok: true };
  } catch (err) {
    if (err instanceof Error && (err.message === 'UNAUTHORIZED' || err.message === 'FORBIDDEN')) {
      return { ok: false, error: '権限がありません' };
    }
    console.error('[recordPayment]', err);
    return { ok: false, error: 'サーバーエラー' };
  }
}
