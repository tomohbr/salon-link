// In-process レートリミッター (バケット方式)
// 本番では Redis 等が望ましいが、単一 Railway インスタンスなら十分。
//
// 使用例:
//   const r = await rateLimit({ key: `login:${ip}`, limit: 10, windowSec: 60 });
//   if (!r.ok) return NextResponse.json({ error: r.message }, { status: 429 });

interface Bucket {
  count: number;
  resetAt: number;
}

// eslint-disable-next-line no-var
declare global {
  var __rateLimitStore: Map<string, Bucket> | undefined;
}

function getStore(): Map<string, Bucket> {
  if (!globalThis.__rateLimitStore) {
    globalThis.__rateLimitStore = new Map();
  }
  return globalThis.__rateLimitStore;
}

export interface RateLimitResult {
  ok: boolean;
  remaining: number;
  resetAt: number;
  message?: string;
}

export function rateLimit({
  key,
  limit,
  windowSec,
}: {
  key: string;
  limit: number;
  windowSec: number;
}): RateLimitResult {
  const store = getStore();
  const now = Date.now();
  const bucket = store.get(key);

  if (!bucket || bucket.resetAt < now) {
    // 新しいウィンドウ開始
    store.set(key, { count: 1, resetAt: now + windowSec * 1000 });
    return { ok: true, remaining: limit - 1, resetAt: now + windowSec * 1000 };
  }

  if (bucket.count >= limit) {
    const retrySec = Math.ceil((bucket.resetAt - now) / 1000);
    return {
      ok: false,
      remaining: 0,
      resetAt: bucket.resetAt,
      message: `リクエスト数の上限に達しました。${retrySec}秒後に再度お試しください。`,
    };
  }

  bucket.count += 1;
  return { ok: true, remaining: limit - bucket.count, resetAt: bucket.resetAt };
}

/** 古いバケットを削除 (任意呼び出し) */
export function cleanup() {
  const store = getStore();
  const now = Date.now();
  for (const [k, b] of store) {
    if (b.resetAt < now) store.delete(k);
  }
}

/** リクエストから IP を取得 */
export function getClientIp(headers: Headers): string {
  return (
    headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    headers.get('x-real-ip') ||
    'unknown'
  );
}
