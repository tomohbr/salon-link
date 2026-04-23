// LINE Messaging API クライアント (マルチテナント対応)
//
// 各呼び出しで salon 固有の credentials を受け取る。
// credentials が未指定なら env var (後方互換) → 無ければ mock でログのみ。

const API_BASE = 'https://api.line.me/v2/bot';

export interface LineCreds {
  channelAccessToken: string;
  channelSecret?: string;
}

function resolveCreds(creds?: LineCreds | null): LineCreds | null {
  if (creds?.channelAccessToken) return creds;
  const token = process.env.LINE_CHANNEL_ACCESS_TOKEN;
  if (token) {
    return { channelAccessToken: token, channelSecret: process.env.LINE_CHANNEL_SECRET };
  }
  return null;
}

async function lineFetch(path: string, body: unknown, creds?: LineCreds | null) {
  const resolved = resolveCreds(creds);
  if (!resolved) {
    console.log('[LINE mock]', path, JSON.stringify(body).slice(0, 200));
    return { ok: true, mock: true };
  }
  try {
    const res = await fetch(API_BASE + path, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${resolved.channelAccessToken}`,
      },
      body: JSON.stringify(body),
    });
    return { ok: res.ok, status: res.status, body: await res.text() };
  } catch (err) {
    console.error('[LINE] fetch failed', err);
    return { ok: false, error: String(err) };
  }
}

export async function pushText(userId: string, text: string, creds?: LineCreds | null) {
  return lineFetch('/message/push', {
    to: userId,
    messages: [{ type: 'text', text }],
  }, creds);
}

export async function replyText(replyToken: string, text: string, creds?: LineCreds | null) {
  return lineFetch('/message/reply', {
    replyToken,
    messages: [{ type: 'text', text }],
  }, creds);
}

export async function broadcastText(text: string, creds?: LineCreds | null) {
  return lineFetch('/message/broadcast', {
    messages: [{ type: 'text', text }],
  }, creds);
}

export async function multicastText(userIds: string[], text: string, creds?: LineCreds | null) {
  if (userIds.length === 0) return { ok: true };
  const batches: string[][] = [];
  for (let i = 0; i < userIds.length; i += 500) batches.push(userIds.slice(i, i + 500));
  const results = [];
  for (const batch of batches) {
    results.push(
      await lineFetch('/message/multicast', {
        to: batch,
        messages: [{ type: 'text', text }],
      }, creds)
    );
  }
  return { ok: true, batches: results.length };
}

/** 指定された secret で Webhook 署名を検証 */
export function verifySignatureWith(body: string, signature: string, secret: string): boolean {
  if (!secret) return false;
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const crypto = require('crypto') as typeof import('crypto');
    const hash = crypto.createHmac('SHA256', secret).update(body).digest('base64');
    return hash === signature;
  } catch {
    return false;
  }
}

/** 後方互換: env var ベースの検証 (現在は webhook で使わない) */
export function verifySignature(body: string, signature: string): boolean {
  const secret = process.env.LINE_CHANNEL_SECRET;
  if (!secret) return true; // 開発時バイパス
  return verifySignatureWith(body, signature, secret);
}
