// 予約確認/キャンセル URL 用のアクセストークン (HMAC ベース)
// DB 変更なしで「予約ID + コード」のペアをセキュアに配布できる。
//
// URL 例:
//   /book/reservation/cm123abc?code=xxxxx

import { createHmac, timingSafeEqual } from 'crypto';

function getKey(): string {
  return process.env.SESSION_SECRET || 'dev-secret-change-me-in-production-12345678';
}

/** 予約 ID から短いアクセスコードを生成 (12 文字) */
export function issueAccessCode(reservationId: string): string {
  const hmac = createHmac('sha256', getKey()).update(`booking:${reservationId}`).digest('base64url');
  return hmac.slice(0, 12);
}

/** アクセスコードを検証 */
export function verifyAccessCode(reservationId: string, code: string): boolean {
  if (!reservationId || !code) return false;
  const expected = issueAccessCode(reservationId);
  try {
    const a = Buffer.from(expected);
    const b = Buffer.from(code);
    if (a.length !== b.length) return false;
    return timingSafeEqual(a, b);
  } catch {
    return false;
  }
}

export function buildAccessUrl(origin: string, reservationId: string): string {
  const code = issueAccessCode(reservationId);
  return `${origin.replace(/\/$/, '')}/book/reservation/${reservationId}?code=${code}`;
}
