// Write 系 API で Origin/Referer を検証 (CSRF 防御の第一線)
// Same-Origin からの POST/PATCH/DELETE のみ許可する。
//
// Stripe webhook / LINE webhook / HPB inbound webhook は外部呼び出しのため除外 (署名検証で担保)

import { NextRequest } from 'next/server';

/** 現在のホストと比較。同一オリジンなら ok:true、異なれば ok:false */
export function checkOrigin(req: NextRequest): { ok: boolean; reason?: string } {
  const method = req.method;
  // 書き込み系以外はチェック不要
  if (method === 'GET' || method === 'HEAD' || method === 'OPTIONS') {
    return { ok: true };
  }

  const origin = req.headers.get('origin');
  const referer = req.headers.get('referer');
  const host = req.headers.get('x-forwarded-host') || req.headers.get('host');

  // 許可オリジン
  const allowed: string[] = [];
  if (process.env.NEXT_PUBLIC_APP_URL) allowed.push(process.env.NEXT_PUBLIC_APP_URL.replace(/\/$/, ''));
  if (host) {
    const proto = req.headers.get('x-forwarded-proto') || 'https';
    allowed.push(`${proto}://${host}`);
  }
  // 開発時は localhost 許可
  if (process.env.NODE_ENV !== 'production') {
    allowed.push('http://localhost:3000');
    allowed.push('http://localhost:8080');
  }

  // Origin ヘッダ優先
  if (origin) {
    if (allowed.some((a) => origin === a)) return { ok: true };
    return { ok: false, reason: `origin ${origin} not in allow list` };
  }

  // Origin 無し → Referer で代用 (一部古いブラウザ / 特殊リクエスト対策)
  if (referer) {
    if (allowed.some((a) => referer.startsWith(a))) return { ok: true };
    return { ok: false, reason: `referer ${referer} not in allow list` };
  }

  // Origin / Referer 両方無しは不正リクエスト
  return { ok: false, reason: 'missing origin and referer' };
}
