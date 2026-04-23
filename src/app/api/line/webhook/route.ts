// LINE Messaging API Webhook (マルチテナント対応)
//
// 受信時のフロー:
//   1. リクエストボディの `destination` フィールド (Bot の userId) で
//      Salon.lineBotUserId を一致検索 → テナント特定
//   2. そのサロンの lineChannelSecret で x-line-signature を検証
//   3. 検証通過後、サロンの lineAccessToken を使って返信
//
// これにより、複数のサロンが同一の Webhook URL を共有しても
// メッセージが正しいサロンに振り分けられる。

import { NextRequest, NextResponse } from 'next/server';
import { rawPrisma } from '@/lib/db';
import { verifySignatureWith, replyText, type LineCreds } from '@/lib/line/client';
import { logAudit } from '@/lib/audit';

interface LineEvent {
  type: string;
  replyToken?: string;
  source?: { userId?: string; type: string };
  message?: { type: string; text?: string };
}

interface WebhookPayload {
  destination?: string;
  events?: LineEvent[];
}

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get('x-line-signature') || '';

  let payload: WebhookPayload;
  try {
    payload = JSON.parse(body);
  } catch {
    return NextResponse.json({ error: 'invalid json' }, { status: 400 });
  }

  const destination = payload.destination;
  if (!destination) {
    return NextResponse.json({ error: 'missing destination' }, { status: 400 });
  }

  // テナント特定: lineBotUserId で salon を引く (Salon はガード対象外なので rawPrisma でも通常 prisma でも可)
  const salon = await rawPrisma.salon.findFirst({
    where: { lineBotUserId: destination, status: 'active' },
  });
  if (!salon) {
    // destination に該当するサロンが無い = 未設定 / 該当なし
    return NextResponse.json({ error: 'unknown destination' }, { status: 404 });
  }
  if (!salon.lineChannelSecret || !salon.lineAccessToken) {
    return NextResponse.json({ error: 'salon LINE not fully configured' }, { status: 403 });
  }

  // そのサロンの secret で署名検証
  if (!verifySignatureWith(body, signature, salon.lineChannelSecret)) {
    return NextResponse.json({ error: 'invalid signature' }, { status: 401 });
  }

  const creds: LineCreds = {
    channelAccessToken: salon.lineAccessToken,
    channelSecret: salon.lineChannelSecret,
  };

  for (const event of payload.events || []) {
    // --- メッセージ受信: 簡易コマンド応答 ---
    if (event.type === 'message' && event.message?.type === 'text' && event.replyToken) {
      const text = event.message.text || '';
      if (text.includes('予約')) {
        const origin = process.env.NEXT_PUBLIC_APP_URL || 'https://salon-link-web-production.up.railway.app';
        await replyText(
          event.replyToken,
          `${salon.name} のご予約はこちらから🌸\n${origin}/book/${salon.slug}?source=line`,
          creds
        );
      } else if (text.includes('クーポン')) {
        const coupons = await rawPrisma.coupon.findMany({
          where: { salonId: salon.id, isActive: true },
          take: 5,
        });
        const list = coupons.length > 0
          ? coupons.map((c) => `・${c.title}`).join('\n')
          : '現在配信中のクーポンはございません。';
        await replyText(event.replyToken, `${salon.name} のクーポン✨\n${list}`, creds);
      } else {
        await replyText(
          event.replyToken,
          `こんにちは！${salon.name} です🌸\n「予約」「クーポン」とメッセージを送ると詳細をお伝えします。`,
          creds
        );
      }
    }

    // --- 友だち追加: そのサロンの顧客として紐付け ---
    else if (event.type === 'follow' && event.source?.userId) {
      const userId = event.source.userId;
      const existing = await rawPrisma.customer.findFirst({
        where: { salonId: salon.id, lineUserId: userId },
      });
      if (!existing) {
        await rawPrisma.customer.create({
          data: {
            salonId: salon.id,
            name: `LINE友だち(…${userId.slice(-6)})`,
            lineUserId: userId,
            source: 'line',
            isLineFriend: true,
          },
        });
      } else if (!existing.isLineFriend) {
        await rawPrisma.customer.update({
          where: { id: existing.id },
          data: { isLineFriend: true },
        });
      }
    }

    // --- ブロック解除 / 再フォロー検知 (任意) ---
    else if (event.type === 'unfollow' && event.source?.userId) {
      const userId = event.source.userId;
      await rawPrisma.customer.updateMany({
        where: { salonId: salon.id, lineUserId: userId },
        data: { isLineFriend: false },
      });
    }
  }

  logAudit(
    { action: 'line.webhook', entityType: 'salon', entityId: salon.id, after: { events: payload.events?.length } },
    req.headers
  );

  return NextResponse.json({ ok: true });
}
