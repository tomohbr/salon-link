/**
 * メール送信ラッパ (Resend ベース)
 *
 * 環境変数:
 *   RESEND_API_KEY     — Resend のダッシュボードで発行
 *   EMAIL_FROM         — "SalonLink <hello@hair-salon-link.app>" 形式
 *   EMAIL_REPLY_TO     — 返信先 (任意、未設定なら shibahara.724@gmail.com)
 *   EMAIL_BCC_INTERNAL — 運営側にも CC で投げる宛先 (任意)
 *
 * 利用:
 *   await sendMail({ to: 'salon@example.jp', subject: '...', html: '...', text: '...' });
 */

import { Resend } from 'resend';

const DEFAULT_FROM = 'SalonLink <onboarding@resend.dev>'; // sandbox; 本番は独自ドメイン設定後に差替
const DEFAULT_REPLY_TO = 'shibahara.724@gmail.com';

let _client: Resend | null = null;
function client(): Resend | null {
  if (_client) return _client;
  const key = process.env.RESEND_API_KEY;
  if (!key) return null;
  _client = new Resend(key);
  return _client;
}

export type MailInput = {
  to: string | string[];
  subject: string;
  html?: string;
  text?: string;
  /** Default: process.env.EMAIL_FROM or sandbox */
  from?: string;
  /** Default: process.env.EMAIL_REPLY_TO */
  replyTo?: string;
  /** 内部用 BCC (運営にも届けたいとき) */
  bccInternal?: boolean;
  /** タグ (Resend ダッシュボードでフィルタ用) */
  tag?: string;
};

export async function sendMail(input: MailInput): Promise<{ ok: boolean; id?: string; error?: string }> {
  const c = client();
  if (!c) {
    // dev / preview 環境ではログだけ出す
    console.log('[email] (dry-run, no RESEND_API_KEY)', input.subject, '->', input.to);
    return { ok: false, error: 'RESEND_API_KEY not set' };
  }

  const from = input.from || process.env.EMAIL_FROM || DEFAULT_FROM;
  const replyTo = input.replyTo || process.env.EMAIL_REPLY_TO || DEFAULT_REPLY_TO;
  const bcc =
    input.bccInternal && process.env.EMAIL_BCC_INTERNAL
      ? [process.env.EMAIL_BCC_INTERNAL]
      : undefined;

  try {
    const result = await c.emails.send({
      from,
      to: Array.isArray(input.to) ? input.to : [input.to],
      subject: input.subject,
      html: input.html,
      text: input.text || stripHtml(input.html || ''),
      replyTo,
      bcc,
      tags: input.tag ? [{ name: 'category', value: input.tag }] : undefined,
    });
    if (result.error) {
      console.error('[email] resend error', result.error);
      return { ok: false, error: result.error.message };
    }
    return { ok: true, id: result.data?.id };
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error('[email] exception', msg);
    return { ok: false, error: msg };
  }
}

function stripHtml(html: string): string {
  return html
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/(p|div|h\d|li|tr)>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

/* ─────────────────────────────────────────────
   標準テンプレート — お問合せ受領通知 (お客様向け)
   ───────────────────────────────────────────── */
export function inquiryAckTemplate(opts: {
  name: string;
  salonName?: string;
  message: string;
}): { subject: string; html: string } {
  const subject = '【SalonLink】お問合せを受け付けました';
  const html = `
<!doctype html>
<html lang="ja"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>SalonLink</title></head><body style="font-family:-apple-system,BlinkMacSystemFont,'Hiragino Sans','Noto Sans JP',sans-serif;color:#14100c;background:#f5e8cf;margin:0;padding:32px 16px;">
  <table role="presentation" style="max-width:560px;margin:0 auto;background:#ffffff;border:1px solid #cdbb95;">
    <tr><td style="padding:32px 28px;">
      <div style="font-family:'Georgia',serif;font-style:italic;font-size:24px;color:#14100c;margin-bottom:8px;">SalonLink</div>
      <div style="font-size:11px;letter-spacing:0.2em;color:#a89778;text-transform:uppercase;margin-bottom:28px;">for Nail Salons</div>

      <p style="font-size:15px;line-height:1.85;margin:0 0 18px;">${escapeHtml(opts.name)} 様</p>

      <p style="font-size:14px;line-height:1.85;color:#46504a;margin:0 0 22px;">
        この度はお問合せありがとうございます。<br />
        以下の内容で承りました。担当より <strong>2 営業日以内</strong> にご返信いたします。
      </p>

      ${opts.salonName ? `<div style="margin-bottom:14px;font-size:13px;color:#46504a;">店舗名: <strong>${escapeHtml(opts.salonName)}</strong></div>` : ''}

      <div style="margin:18px 0;padding:16px;background:#f5e8cf;border-left:3px solid #c9a675;font-size:13.5px;line-height:1.95;color:#14100c;white-space:pre-wrap;">${escapeHtml(opts.message)}</div>

      <p style="font-size:13px;line-height:1.85;color:#46504a;margin:22px 0 0;">
        ご返信までしばらくお待ちください。<br />
        お急ぎの場合はこのメールに直接ご返信ください。
      </p>

      <hr style="border:none;border-top:1px solid #cdbb95;margin:28px 0;" />

      <div style="font-size:11px;color:#7a857f;line-height:1.8;">
        SalonLink<br />
        広告に頼らない経営のための、ネイルサロン専用の管理ツール<br />
        <a href="https://salon-link-web-production.up.railway.app/" style="color:#633f5a;">SalonLink — for Nail Salons</a>
      </div>
    </td></tr>
  </table>
</body></html>`.trim();
  return { subject, html };
}

/* ─────────────────────────────────────────────
   標準テンプレート — お問合せ通知 (運営側向け)
   ───────────────────────────────────────────── */
export function inquiryNotifyTemplate(opts: {
  name: string;
  email: string;
  salonName?: string;
  phone?: string;
  message: string;
  source?: string;
  ip?: string;
}): { subject: string; html: string } {
  const subject = `[Inquiry] ${opts.salonName || opts.name} 様より`;
  const html = `
<!doctype html><html lang="ja"><head><meta charset="utf-8"><title>Inquiry</title></head><body style="font-family:monospace;background:#fff;padding:24px;">
<h2 style="margin:0 0 16px;font-family:sans-serif;color:#14100c;">新規お問合せ</h2>
<table cellpadding="6" style="font-size:13px;border-collapse:collapse;">
  <tr><td style="color:#7a857f;width:80px;">From</td><td>${escapeHtml(opts.name)}</td></tr>
  <tr><td style="color:#7a857f;">Email</td><td><a href="mailto:${escapeHtml(opts.email)}">${escapeHtml(opts.email)}</a></td></tr>
  ${opts.salonName ? `<tr><td style="color:#7a857f;">Salon</td><td>${escapeHtml(opts.salonName)}</td></tr>` : ''}
  ${opts.phone ? `<tr><td style="color:#7a857f;">Tel</td><td>${escapeHtml(opts.phone)}</td></tr>` : ''}
  ${opts.source ? `<tr><td style="color:#7a857f;">Source</td><td>${escapeHtml(opts.source)}</td></tr>` : ''}
  ${opts.ip ? `<tr><td style="color:#7a857f;">IP</td><td>${escapeHtml(opts.ip)}</td></tr>` : ''}
</table>
<div style="margin-top:18px;padding:14px;background:#f5e8cf;border-left:3px solid #c9a675;font-size:13px;line-height:1.85;white-space:pre-wrap;">${escapeHtml(opts.message)}</div>
</body></html>`.trim();
  return { subject, html };
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
