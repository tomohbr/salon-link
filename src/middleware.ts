import { NextResponse, type NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const COOKIE_NAME = 'salonlink_session';

function getSecret() {
  const secret = process.env.SESSION_SECRET || 'dev-secret-change-me-in-production-12345678';
  return new TextEncoder().encode(secret);
}

const protectedPaths = [
  '/dashboard',
  '/reservations',
  '/customers',
  '/menus',
  '/coupons',
  '/messages',
  '/designs',
  '/analytics',
  '/settings',
  '/sales',
  '/products',
  '/superadmin',
];

const staffAllowed = ['/dashboard', '/reservations', '/customers', '/menus'];
const superadminOnly = ['/superadmin'];

// API Origin チェック免除 (外部 webhook / 公開予約)
const WEBHOOK_ROUTES = [
  '/api/line/webhook',
  '/api/stripe/webhook',
  '/api/inbound/',
  '/api/cron/',           // cron は Railway から叩かれる想定
  '/api/health',
  '/api/book/',           // 顧客予約 (同一オリジンだが OPTIONS preflight 考慮)
];

function isWebhookRoute(pathname: string): boolean {
  return WEBHOOK_ROUTES.some((p) => pathname.startsWith(p));
}

function checkOriginInMiddleware(req: NextRequest): { ok: boolean } {
  const method = req.method;
  if (method === 'GET' || method === 'HEAD' || method === 'OPTIONS') return { ok: true };

  const origin = req.headers.get('origin');
  const host = req.headers.get('x-forwarded-host') || req.headers.get('host');
  const proto = req.headers.get('x-forwarded-proto') || 'https';

  const allowed: string[] = [];
  if (process.env.NEXT_PUBLIC_APP_URL) allowed.push(process.env.NEXT_PUBLIC_APP_URL.replace(/\/$/, ''));
  if (host) allowed.push(`${proto}://${host}`);
  if (process.env.NODE_ENV !== 'production') {
    allowed.push('http://localhost:3000');
    allowed.push('http://localhost:8080');
  }

  if (!origin) {
    // Origin 無し: Referer で代用
    const referer = req.headers.get('referer');
    if (!referer) return { ok: false };
    if (allowed.some((a) => referer.startsWith(a))) return { ok: true };
    return { ok: false };
  }
  return { ok: allowed.some((a) => origin === a) };
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // ── API ルートの Origin チェック (書き込み系のみ、webhook 除く) ──
  if (pathname.startsWith('/api/') && !isWebhookRoute(pathname)) {
    const res = checkOriginInMiddleware(req);
    if (!res.ok) {
      return NextResponse.json({ error: 'CSRF: origin rejected' }, { status: 403 });
    }
  }

  // ── ページ保護 ──
  const isProtected = protectedPaths.some((p) => pathname.startsWith(p));
  if (!isProtected) return NextResponse.next();

  const token = req.cookies.get(COOKIE_NAME)?.value;
  if (!token) {
    return NextResponse.redirect(new URL('/login', req.url));
  }
  try {
    const { payload } = await jwtVerify(token, getSecret());
    const role = payload.role as string;

    if (superadminOnly.some((p) => pathname.startsWith(p)) && role !== 'superadmin') {
      return NextResponse.redirect(new URL('/dashboard', req.url));
    }
    if (role === 'staff') {
      const allowed = staffAllowed.some((p) => pathname.startsWith(p));
      if (!allowed) {
        return NextResponse.redirect(new URL('/dashboard', req.url));
      }
    }
    return NextResponse.next();
  } catch {
    return NextResponse.redirect(new URL('/login', req.url));
  }
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/reservations/:path*',
    '/customers/:path*',
    '/menus/:path*',
    '/coupons/:path*',
    '/messages/:path*',
    '/designs/:path*',
    '/analytics/:path*',
    '/settings/:path*',
    '/sales/:path*',
    '/products/:path*',
    '/superadmin/:path*',
    '/api/:path*',
  ],
};
