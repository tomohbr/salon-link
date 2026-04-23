// CSRF 対策 (Double-Submit Cookie パターン)
//
// 使い方:
//   1. getCsrfToken() でトークン取得 (Cookie と Body の両方に同じ値を入れる)
//   2. verifyCsrf(req) で Body(or header) と Cookie の一致を検証
//
// ただし Next.js の Server Actions (FormData 経由) は既に CSRF 防御機構を持つ。
// この module は fetch() 経由の POST/PATCH/DELETE API ルート向け。

import { NextRequest } from 'next/server';
import { cookies } from 'next/headers';
import { randomBytes, timingSafeEqual } from 'crypto';

const COOKIE_NAME = 'salonlink_csrf';
const HEADER_NAME = 'x-csrf-token';

export function generateCsrfToken(): string {
  return randomBytes(32).toString('base64url');
}

/** サーバーコンポーネントから呼び出して token を cookie に配る */
export async function issueCsrfCookie(): Promise<string> {
  const store = await cookies();
  let token = store.get(COOKIE_NAME)?.value;
  if (!token) {
    token = generateCsrfToken();
    store.set(COOKIE_NAME, token, {
      httpOnly: false, // JS から読めるように (同一オリジン前提)
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
    });
  }
  return token;
}

/** API Route 内で CSRF 検証。失敗時はエラーを投げる */
export function verifyCsrf(req: NextRequest): { ok: true } | { ok: false; error: string } {
  // Same-Site origin check (簡易版):
  //   Origin ヘッダが許可ホストと一致するかチェック
  const origin = req.headers.get('origin');
  const host = req.headers.get('host');
  if (origin && host) {
    const expectedOrigin = `${req.nextUrl.protocol}//${host}`;
    // NEXT_PUBLIC_APP_URL も許可
    const allowedOrigins = [expectedOrigin, process.env.NEXT_PUBLIC_APP_URL].filter(Boolean);
    if (!allowedOrigins.some((a) => a === origin)) {
      return { ok: false, error: 'CSRF: origin mismatch' };
    }
  }

  // Double-submit: Cookie と Header のトークン一致
  const cookieToken = req.cookies.get(COOKIE_NAME)?.value;
  const headerToken = req.headers.get(HEADER_NAME);

  // GET-first API の場合は cookie がまだ無いのでスキップ (初回 issue)
  if (!cookieToken) return { ok: true };

  if (!headerToken) {
    return { ok: false, error: 'CSRF: missing header token' };
  }
  try {
    const a = Buffer.from(cookieToken);
    const b = Buffer.from(headerToken);
    if (a.length !== b.length || !timingSafeEqual(a, b)) {
      return { ok: false, error: 'CSRF: token mismatch' };
    }
  } catch {
    return { ok: false, error: 'CSRF: invalid token' };
  }
  return { ok: true };
}

export { COOKIE_NAME as CSRF_COOKIE, HEADER_NAME as CSRF_HEADER };
