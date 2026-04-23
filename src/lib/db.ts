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

// where 句に salonId 制約があるか再帰的にチェック。
// 対応パターン:
//   { salonId: "xxx" }                              直接
//   { salonId_externalId: { salonId: "x", ... } }    複合ユニークキー
//   { AND: [ { salonId: "x" }, ... ] }               AND
//   { OR: [ { salonId: "a" }, { salonId: "b" } ] }   OR (全分岐に salonId 必要)
//   { customer: { salonId: "x" } }                   リレーション経由
//   { salon: { ... } }                               salon リレーション自体
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function hasSalonIdConstraint(where: any): boolean {
  if (!where || typeof where !== 'object') return false;
  // 直接
  if ('salonId' in where && where.salonId !== undefined) return true;
  // AND: 任意の要素に salonId があれば OK
  if (Array.isArray(where.AND) && where.AND.some(hasSalonIdConstraint)) return true;
  // OR: 全分岐が salonId を持つ必要がある
  if (Array.isArray(where.OR) && where.OR.length > 0 && where.OR.every(hasSalonIdConstraint)) return true;
  // salon リレーション
  if (where.salon && typeof where.salon === 'object') return true;
  // 他のキー: 複合ユニークキー (salonId_XXX) もしくはネストしたオブジェクト内に salonId
  for (const [k, v] of Object.entries(where)) {
    if (k.startsWith('salonId_') && v && typeof v === 'object' && 'salonId' in (v as object)) return true;
    // リレーション経由 (customer/menu/staff など) — 親に salonId があれば OK
    if (v && typeof v === 'object' && !Array.isArray(v)) {
      if (hasSalonIdConstraint(v)) return true;
    }
  }
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
          // 読み取り系 + 一括更新系は salonId 必須 (漏洩リスク大)
          const strictGuarded = [
            'findFirst', 'findMany', 'findFirstOrThrow', 'findUnique', 'findUniqueOrThrow',
            'updateMany', 'deleteMany',
            'count', 'aggregate', 'groupBy',
          ];
          // 単体 update/delete は Prisma 仕様上 unique where 必須なので id のみでも OK とする。
          // 呼び出し側で事前に findFirst({id, salonId}) で所有権確認する運用で担保。
          if (strictGuarded.includes(operation)) {
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
        }
        return query(args as Prisma.Args<unknown, typeof operation>);
      },
    },
  },
});

// eslint-disable-next-line @typescript-eslint/no-unused-vars
type _PrismaBaseHint = typeof base;
