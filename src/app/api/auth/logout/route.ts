import { NextRequest, NextResponse } from 'next/server';

// ログアウト処理
// Cookie を空で上書き(maxAge:0)して無効化し、/login にリダイレクト
// Railway の内部ポート(localhost:8080)にリダイレクトされないよう、
// パブリック URL は以下の優先順で解決:
//   1. NEXT_PUBLIC_APP_URL 環境変数
//   2. X-Forwarded-Host ヘッダ (プロキシ経由)
//   3. Host ヘッダ

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

// GET でアクセスされた場合 (古いリンク経由等) もログアウト処理を行う
export async function GET(req: NextRequest) {
  const origin = resolvePublicOrigin(req);
  const res = NextResponse.redirect(`${origin}/login`, { status: 303 });
  clearSessionCookie(res);
  return res;
}
