// 監査ログ (非ブロッキング書き込み)
// Server Action や API Route で呼び出す。await 不要 (fire-and-forget)。
//
// 使用例:
//   logAudit({ action: 'customer.create', entityType: 'customer', entityId: c.id, after: c }, req);

import { prisma } from './db';
import { getSession } from './auth';
import { getClientIp } from './rateLimit';

export interface AuditContext {
  action: string;
  entityType?: string;
  entityId?: string;
  before?: unknown;
  after?: unknown;
}

export function logAudit(ctx: AuditContext, headers?: Headers): void {
  // 非同期で書き込み、失敗してもエラーを投げない
  (async () => {
    try {
      const session = await getSession();
      const ip = headers ? getClientIp(headers) : null;
      const ua = headers?.get('user-agent') || null;

      await prisma.auditLog.create({
        data: {
          salonId: session?.salonId || null,
          userId: session?.userId || null,
          userEmail: session?.email || null,
          action: ctx.action,
          entityType: ctx.entityType || null,
          entityId: ctx.entityId || null,
          beforeJson: ctx.before ? (ctx.before as object) : undefined,
          afterJson: ctx.after ? (ctx.after as object) : undefined,
          ipAddress: ip,
          userAgent: ua,
        },
      });
    } catch (err) {
      console.error('[audit] failed', err);
    }
  })();
}
