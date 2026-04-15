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
  '/superadmin',
];

const staffAllowed = ['/dashboard', '/reservations', '/customers', '/menus'];
const superadminOnly = ['/superadmin'];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const isProtected = protectedPaths.some((p) => pathname.startsWith(p));
  if (!isProtected) return NextResponse.next();

  const token = req.cookies.get(COOKIE_NAME)?.value;
  if (!token) {
    return NextResponse.redirect(new URL('/login', req.url));
  }
  try {
    const { payload } = await jwtVerify(token, getSecret());
    const role = payload.role as string;

    // superadmin 専用
    if (superadminOnly.some((p) => pathname.startsWith(p)) && role !== 'superadmin') {
      return NextResponse.redirect(new URL('/dashboard', req.url));
    }
    // staff は限定ページのみ
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
    '/superadmin/:path*',
  ],
};
