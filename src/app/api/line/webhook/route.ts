import { NextRequest, NextResponse } from 'next/server';
import { verifySignature, replyText } from '@/lib/line/client';
import { prisma } from '@/lib/db';

interface LineEvent {
  type: string;
  replyToken?: string;
  source?: { userId?: string; type: string };
  message?: { type: string; text?: string };
}

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get('x-line-signature') || '';
  if (!verifySignature(body, signature)) {
    return NextResponse.json({ error: 'invalid signature' }, { status: 401 });
  }

  const data = JSON.parse(body) as { events: LineEvent[] };

  for (const event of data.events) {
    if (event.type === 'message' && event.message?.type === 'text' && event.replyToken) {
      const text = event.message.text || '';
      // 任意の1店舗に応答（マルチテナント時は line channel → salon マッピングが必要）
      const anySalon = await prisma.salon.findFirst({ where: { status: 'active' } });
      const salonName = anySalon?.name || 'SalonLink';
      const slug = anySalon?.slug || 'demo';

      if (text.includes('予約')) {
        await replyText(event.replyToken, `ご予約はこちらから🌸\nhttps://example.com/book/${slug}`);
      } else if (text.includes('クーポン')) {
        await replyText(event.replyToken, '現在お使いいただけるクーポンをWebでご確認ください✨');
      } else {
        await replyText(event.replyToken, `こんにちは！${salonName}です🌸\n「予約」「クーポン」とメッセージを送ると詳細をお伝えします。`);
      }
    }
  }

  return NextResponse.json({ ok: true });
}
