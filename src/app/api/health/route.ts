// ヘルスチェックエンドポイント
// Railway / 外部監視ツール (UptimeRobot, Better Uptime, Pingdom) からのプローブ用。
// HSL とレスポンス形式を統一 (status: 'healthy' | 'degraded')

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  const start = Date.now();
  const checks: Record<string, { ok: boolean; elapsedMs?: number; error?: string }> = {};

  try {
    const s = Date.now();
    await prisma.$queryRaw`SELECT 1`;
    checks.db = { ok: true, elapsedMs: Date.now() - s };
  } catch (err) {
    checks.db = { ok: false, error: err instanceof Error ? err.message : 'db error' };
  }

  const allOk = Object.values(checks).every((c) => c.ok);

  return NextResponse.json(
    {
      status: allOk ? 'healthy' : 'degraded',
      version: process.env.RAILWAY_GIT_COMMIT_SHA || 'dev',
      region: process.env.RAILWAY_ENVIRONMENT_NAME || 'local',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      elapsedMs: Date.now() - start,
      checks,
    },
    {
      status: allOk ? 200 : 503,
      headers: { 'Cache-Control': 'no-store' },
    },
  );
}
