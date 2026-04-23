// Prisma client + マルチテナント保護拡張
//
// デフォルト export の `prisma` はテナントガード付き:
//   Customer / Reservation 等のテナント所有モデルを where 句に salonId 無しで
//   read/write しようとすると、dev では throw、prod では警告ログ。
//
// 意図的にクロステナント (cron / webhook / superadmin) を行う場合は
// `rawPrisma` を使う。

import { PrismaClient, Prisma } from '@prisma/client';

const TENANT_MODELS = new Set<string>([
  'Customer', 'Menu', 'Reservation', 'TreatmentRecord',
  'Coupon', 'Message', 'NailDesign', 'Product', 'StockTransaction',
]);

// where 句に salonId 制約があるか (浅いチェック: 直接の salonId / AND の中身 / ネスト OR は全分岐)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function hasSalonIdConstraint(where: any): boolean {
  if (!where || typeof where !== 'object') return false;
  if ('salonId' in where && where.salonId !== undefined) return true;
  if (Array.isArray(where.AND) && where.AND.some(hasSalonIdConstraint)) return true;
  if (Array.isArray(where.OR) && where.OR.length > 0 && where.OR.every(hasSalonIdConstraint)) return true;
  // リレーション経由 (customer: { salonId }) も OK とみなす
  if (where.salon && typeof where.salon === 'object') return true;
  return false;
}

// eslint-disable-next-line no-var
declare global {
  var __prismaBase: PrismaClient | undefined;
}

const base =
  globalThis.__prismaBase ||
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') {
  globalThis.__prismaBase = base;
}

/** テナント境界をバイパスする raw クライアント (cron / webhook / superadmin 用) */
export const rawPrisma = base;

/** テナントガード付きクライアント (通常の API 用) */
export const prisma = base.$extends({
  query: {
    $allModels: {
      async $allOperations({ model, operation, args, query }) {
        if (TENANT_MODELS.has(model)) {
          const guarded = ['findFirst', 'findMany', 'update', 'updateMany', 'delete', 'deleteMany', 'count', 'aggregate', 'groupBy'];
          if (guarded.includes(operation)) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const w = (args as any)?.where;
            if (!hasSalonIdConstraint(w)) {
              const msg = `[tenant-guard] ${model}.${operation} called without salonId in where clause. Use rawPrisma if this is intentional (cron/webhook/superadmin).`;
              if (process.env.NODE_ENV !== 'production' || process.env.TENANT_GUARD_STRICT === 'true') {
                throw new Error(msg);
              } else {
                console.warn(msg, { args });
              }
            }
          }
          // findUnique は id (プライマリキー) でのアクセスだが、
          // ID が他テナントのものだと漏洩するため、呼び出し側で findFirst + salonId を使うこと。
          // この拡張では findUnique は素通りさせ、コードレビューで担保する。
        }
        return query(args as Prisma.Args<unknown, typeof operation>);
      },
    },
  },
});

// eslint-disable-next-line @typescript-eslint/no-unused-vars
type _PrismaBaseHint = typeof base;
