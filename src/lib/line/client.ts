// LINE Messaging API クライアント
// 環境変数に LINE_CHANNEL_ACCESS_TOKEN / LINE_CHANNEL_SECRET が設定されていれば実API呼び出し
// 未設定時はモック動作（ログのみ）

const API_BASE = 'https://api.line.me/v2/bot';

function getToken() {
  return process.env.LINE_CHANNEL_ACCESS_TOKEN || '';
}

async function lineFetch(path: string, body: unknown) {
  const token = getToken();
  if (!token) {
    console.log('[LINE Mock]', path, JSON.stringify(body).slice(0, 200));
    return { ok: true, mock: true };
  }
  const res = await fetch(API_BASE + path, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  });
  return { ok: res.ok, status: res.status, body: await res.text() };
}

export async function pushText(userId: string, text: string) {
  return lineFetch('/message/push', {
    to: userId,
    messages: [{ type: 'text', text }],
  });
}

export async function replyText(replyToken: string, text: string) {
  return lineFetch('/message/reply', {
    replyToken,
    messages: [{ type: 'text', text }],
  });
}

export async function broadcastText(text: string) {
  return lineFetch('/message/broadcast', {
    messages: [{ type: 'text', text }],
  });
}

export async function multicastText(userIds: string[], text: string) {
  if (userIds.length === 0) return { ok: true };
  // LINEは一度に500件まで
  const batches: string[][] = [];
  for (let i = 0; i < userIds.length; i += 500) batches.push(userIds.slice(i, i + 500));
  const results = [];
  for (const batch of batches) {
    results.push(
      await lineFetch('/message/multicast', {
        to: batch,
        messages: [{ type: 'text', text }],
      })
    );
  }
  return { ok: true, batches: results.length };
}

export async function pushFlexCoupon(userId: string, title: string, description: string, discount: string) {
  return lineFetch('/message/push', {
    to: userId,
    messages: [
      {
        type: 'flex',
        altText: `${title} - ${discount}`,
        contents: {
          type: 'bubble',
          hero: {
            type: 'box',
            layout: 'vertical',
            contents: [
              { type: 'text', text: '🎫 特別クーポン', size: 'sm', color: '#E11D74', weight: 'bold' },
            ],
            paddingAll: 'lg',
            backgroundColor: '#FDF2F8',
          },
          body: {
            type: 'box',
            layout: 'vertical',
            contents: [
              { type: 'text', text: title, weight: 'bold', size: 'lg', wrap: true },
              { type: 'text', text: discount, size: 'xxl', weight: 'bold', color: '#E11D74', margin: 'md' },
              { type: 'text', text: description, size: 'sm', color: '#78716C', wrap: true, margin: 'md' },
            ],
          },
          footer: {
            type: 'box',
            layout: 'vertical',
            contents: [
              {
                type: 'button',
                style: 'primary',
                color: '#E11D74',
                action: { type: 'uri', label: '予約する', uri: 'https://example.com/book' },
              },
            ],
          },
        },
      },
    ],
  });
}

// Webhook署名検証
export function verifySignature(body: string, signature: string): boolean {
  const secret = process.env.LINE_CHANNEL_SECRET;
  if (!secret) return true; // 開発時バイパス
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const crypto = require('crypto') as typeof import('crypto');
    const hash = crypto.createHmac('SHA256', secret).update(body).digest('base64');
    return hash === signature;
  } catch {
    return false;
  }
}
