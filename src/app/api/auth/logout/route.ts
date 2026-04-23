// ログアウトは副作用のある処理なので POST のみで実行。
// GET は prefetch や誤アクセスを考慮して /login へリダイレクトするだけにし、
// セッションは破壊しない (Next.js の <Link> プリフェッチでログアウトしてしまう事故を防ぐため)。

import { NextRequest, NextResponse } from 'next/server';

function resolvePublicOrigin(req: NextRequest): string {
  const envUrl = process.env.NEXT_PUBLIC_APP_URL;
  if (envUrl) return envUrl.replace(/\/$/, '');
  const fwdHost = req.headers.get('x-forwarded-host');
  const fwdProto = req.headers.get('x-forwarded-proto') || 'https';
  if (fwdHost) return `${fwdProto}://${fwdHost}`;
  const host = req.headers.get('host');
  if (host) return `https://${host}`;
  return req.nextUrl.origin;
}

function clearSessionCookie(res: NextResponse) {
  res.cookies.set('salonlink_session', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  });
}

export async function POST(req: NextRequest) {
  const accept = req.headers.get('accept') || '';
  const isFormSubmit = accept.includes('text/html');

  if (isFormSubmit) {
    const origin = resolvePublicOrigin(req);
    const res = NextResponse.redirect(`${origin}/login`, { status: 303 });
    clearSessionCookie(res);
    return res;
  }
  const res = NextResponse.json({ ok: true });
  clearSessionCookie(res);
  return res;
}

// GET: 副作用なし (cookie は消さない)。誤って <a href="/api/auth/logout"> でリンクされても安全。
export async function GET(req: NextRequest) {
  const origin = resolvePublicOrigin(req);
  return NextResponse.redirect(`${origin}/login`, { status: 303 });
}
