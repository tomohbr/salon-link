/**
 * お問合せ受信 API
 *
 *  - LP の InquiryForm から POST される
 *  - 運営に通知メール、お客様に受領メール (どちらも Resend)
 *  - 簡易レート制限 (1 IP あたり 3 回 / 5 分) で SPAM 抑制
 *  - ハニーポット (隠しフィールド) で bot 弾き
 */

import { NextRequest, NextResponse } from 'next/server';
import { sendMail, inquiryAckTemplate, inquiryNotifyTemplate } from '@/lib/email';
import { rateLimit } from '@/lib/rateLimit';

const TO_OPERATOR = process.env.EMAIL_BCC_INTERNAL || process.env.EMAIL_REPLY_TO || 'shibahara.724@gmail.com';

export async function POST(req: NextRequest) {
  try {
    const ip =
      req.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
      req.headers.get('x-real-ip') ||
      'unknown';

    // ── レート制限 (1 IP 3 件 / 5 分) ──
    const rl = rateLimit({ key: `inquiry:${ip}`, limit: 3, windowSec: 300 });
    if (!rl.ok) {
      return NextResponse.json({ error: 'しばらく時間をおいて再度お試しください' }, { status: 429 });
    }

    const body = await req.json().catch(() => ({}));
    const {
      name = '',
      email = '',
      phone = '',
      salonName = '',
      message = '',
      source = '',
      // honeypot — bot は埋めがち、人間は埋めない
      website = '',
    } = body as Record<string, string>;

    // honeypot — 何かが入っていたら静かに 200 を返す
    if (typeof website === 'string' && website.trim()) {
      return NextResponse.json({ ok: true });
    }

    const nm = String(name || '').trim();
    const em = String(email || '').trim();
    const msg = String(message || '').trim();
    if (!nm || !em || !msg) {
      return NextResponse.json({ error: '必須項目が不足しています' }, { status: 400 });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(em)) {
      return NextResponse.json({ error: 'メールアドレス形式が不正です' }, { status: 400 });
    }
    if (msg.length > 4000) {
      return NextResponse.json({ error: 'お問合せ内容は 4000 文字以内' }, { status: 400 });
    }

    // ── 運営に通知 ──
    const notify = inquiryNotifyTemplate({
      name: nm,
      email: em,
      salonName: salonName || undefined,
      phone: phone || undefined,
      message: msg,
      source: source || undefined,
      ip,
    });
    await sendMail({
      to: TO_OPERATOR,
      subject: notify.subject,
      html: notify.html,
      replyTo: em,
      tag: 'inquiry-notify',
    });

    // ── お客様に受領メール ──
    const ack = inquiryAckTemplate({
      name: nm,
      salonName: salonName || undefined,
      message: msg,
    });
    await sendMail({
      to: em,
      subject: ack.subject,
      html: ack.html,
      tag: 'inquiry-ack',
    });

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error('[inquiry]', e);
    return NextResponse.json({ error: 'サーバーエラー' }, { status: 500 });
  }
}
