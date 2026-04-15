import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { pushText } from '@/lib/line/client';

// 翌日予約の顧客にLINEリマインドを送信
export async function GET() {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = tomorrow.toISOString().slice(0, 10);

  const targets = await prisma.reservation.findMany({
    where: { date: tomorrowStr, status: 'confirmed', reminderSent: false },
    include: { customer: true, salon: true },
  });

  let sent = 0;
  for (const r of targets) {
    if (!r.customer?.lineUserId) continue;
    await pushText(
      r.customer.lineUserId,
      `${r.customer.name}様\n明日 ${r.startTime}〜 のご予約のご案内です。\nメニュー: ${r.menuName}\nご来店お待ちしております🌸`
    );
    await prisma.reservation.update({ where: { id: r.id }, data: { reminderSent: true } });
    sent++;
  }

  return NextResponse.json({ ok: true, sent, total: targets.length });
}
