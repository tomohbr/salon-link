// 認証ユーティリティ - JWT (jose) + bcrypt + Cookie セッション
import { SignJWT, jwtVerify } from 'jose';
import bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';
import { prisma } from './db';

const COOKIE_NAME = 'salonlink_session';
const ALG = 'HS256';

function getSecret() {
  const secret = process.env.SESSION_SECRET || 'dev-secret-change-me-in-production-12345678';
  return new TextEncoder().encode(secret);
}

export type Role = 'superadmin' | 'admin' | 'staff';

export interface SessionPayload {
  userId: string;
  email: string;
  name: string;
  role: Role;
  salonId: string | null;
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export async function createSession(payload: SessionPayload) {
  const token = await new SignJWT({ ...payload })
    .setProtectedHeader({ alg: ALG })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(getSecret());

  const cookieStore = await cookies();

  // Session fixation 防止: 既存セッション関連 cookie を全て破棄してから新規発行
  cookieStore.set(COOKIE_NAME, '', { maxAge: 0, path: '/' });
  cookieStore.set('salonlink_csrf', '', { maxAge: 0, path: '/' });

  // 新しいセッション Cookie を発行
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7,
    path: '/',
  });
}

export async function destroySession() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

export async function getSession(): Promise<SessionPayload | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(COOKIE_NAME)?.value;
    if (!token) return null;
    const { payload } = await jwtVerify(token, getSecret());
    return payload as unknown as SessionPayload;
  } catch {
    return null;
  }
}

export async function requireSession(): Promise<SessionPayload> {
  const session = await getSession();
  if (!session) throw new Error('UNAUTHORIZED');
  return session;
}

export async function requireRole(roles: Role[]): Promise<SessionPayload> {
  const session = await requireSession();
  if (!roles.includes(session.role)) throw new Error('FORBIDDEN');
  return session;
}

export async function getUserWithSalon() {
  const session = await getSession();
  if (!session) return null;
  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    include: { salon: true },
  });
  return user;
}
