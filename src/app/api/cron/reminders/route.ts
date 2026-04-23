// 翌日予約リマインド Cron (マルチテナント対応)
//
// 全 active サロンをループし、各サロンの LINE Access Token で
// そのサロンの顧客にだけリマインドを送る。
// 1 サロンの設定不備が他サロンに影響しないよう try/catch で分離。

import { NextResponse } from 'next/server';
import { rawPrisma } from '@/lib/db';
import { pushText, type LineCreds } from '@/lib/line/client';
import { jstDate } from '@/lib/jst';

export async function GET() {
  // JST 基準で翌日の日付
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = jstDate(tomorrow);

  // 対象サロンを絞り込み: active のみ
  const salons = await rawPrisma.salon.findMany({
    where: { status: 'active' },
    select: {
      id: true,
      name: true,
      slug: true,
      lineAccessToken: true,
      lineChannelSecret: true,
    },
  });

  let totalSent = 0;
  let totalTargets = 0;
  const perSalon: Array<{ salonId: string; salonName: string; sent: number; total: number; error?: string }> = [];

  for (const salon of salons) {
    try {
      const targets = await rawPrisma.reservation.findMany({
        where: {
          salonId: salon.id,
          date: tomorrowStr,
          status: 'confirmed',
          reminderSent: false,
        },
        include: { customer: true },
      });

      const creds: LineCreds | undefined = salon.lineAccessToken
        ? { channelAccessToken: salon.lineAccessToken, channelSecret: salon.lineChannelSecret || undefined }
        : undefined;

      let sent = 0;
      for (const r of targets) {
        if (!r.customer?.lineUserId) continue;
        try {
          await pushText(
            r.customer.lineUserId,
            `${r.customer.name}様\n${salon.name} からのご案内です。\n明日 ${r.startTime}〜 のご予約、お待ちしております🌸\nメニュー: ${r.menuName}`,
            creds
          );
          await rawPrisma.reservation.update({
            where: { id: r.id },
            data: { reminderSent: true },
          });
          sent++;
        } catch (err) {
          console.error(`[cron/reminders] push failed for reservation ${r.id}:`, err);
        }
      }

      totalSent += sent;
      totalTargets += targets.length;
      perSalon.push({ salonId: salon.id, salonName: salon.name, sent, total: targets.length });
    } catch (err) {
      console.error(`[cron/reminders] salon ${salon.id} failed:`, err);
      perSalon.push({
        salonId: salon.id,
        salonName: salon.name,
        sent: 0,
        total: 0,
        error: err instanceof Error ? err.message : 'unknown',
      });
    }
  }

  return NextResponse.json({
    ok: true,
    date: tomorrowStr,
    salons: salons.length,
    totalTargets,
    totalSent,
    perSalon,
  });
}
