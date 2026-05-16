// セッション JWT / 予約アクセスコードの署名鍵。
// auth.ts / middleware.ts / bookingAccess.ts で共有する。
// Edge ランタイム（middleware）からも import されるため Node 専用 API は使わない。

const DEV_FALLBACK = 'dev-secret-change-me-in-production-12345678';

/**
 * 本番環境で SESSION_SECRET が未設定（または開発用デフォルトのまま）の場合は
 * 例外を投げる。既定値のまま稼働すると JWT を偽造され、なりすましが可能になるため、
 * 黙って動かすより明示的に落とす。
 */
export function getSessionSecret(): string {
  const secret = process.env.SESSION_SECRET;
  if (!secret || secret === DEV_FALLBACK) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error(
        'SESSION_SECRET is not set in production. Set a strong random value (e.g. `openssl rand -base64 32`).',
      );
    }
    return DEV_FALLBACK;
  }
  return secret;
}
