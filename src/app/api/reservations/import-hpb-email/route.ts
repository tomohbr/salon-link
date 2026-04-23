// HPB メール本文を貼り付けて取り込む API (管理画面から叩かれる)
// 同じロジックは /api/inbound/hpb/[token] と共通だが、こちらはログイン必須。

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireRole } from '@/lib/auth';
import { parseHpbEmail } from '@/lib/hpb/emailParser';
import { logAudit } from '@/lib/audit';

export async function POST(req: NextRequest) {
  try {
    const s = await requireRole(['admin']);
    if (!s.salonId) return NextResponse.json({ error: 'no salon' }, { status: 403 });

    const { raw } = await req.json();
    if (!raw || typeof raw !== 'string') {
      return NextResponse.json({ error: 'メール本文を入力してください' }, { status: 400 });
    }

    const parsed = parseHpbEmail(raw);
    if (parsed.length === 0) {
      return NextResponse.json(
        { ok: false, error: 'HPB 予約情報を抽出できませんでした。本文の書式をご確認ください。' },
        { status: 422 }
      );
    }

    let created = 0, updated = 0, cancelled = 0, skipped = 0;
    const details: Array<{ externalId: string; action: string }> = [];

    for (const p of parsed) {
      if (!p.externalId) { skipped++; continue; }

      const existing = await prisma.reservation.findUnique({
        where: { salonId_externalId: { salonId: s.salonId, externalId: p.externalId } },
      });

      if (p.eventType === 'cancel' && existing) {
        await prisma.reservation.update({
          where: { id: existing.id },
          data: { status: 'cancelled' },
        });
        cancelled++;
        details.push({ externalId: p.externalId, action: 'cancelled' });
        continue;
      }

      let customerId: string | null = null;
      if (p.customerName) {
        const existingCustomer = p.phone
          ? await prisma.customer.findFirst({ where: { salonId: s.salonId, phone: p.phone } })
          : null;
        if (existingCustomer) customerId = existingCustomer.id;
        else {
          const c = await prisma.customer.create({
            data: {
              salonId: s.salonId,
              name: p.customerName,
              nameKana: p.customerNameKana,
              phone: p.phone,
              email: p.email,
              source: 'hotpepper',
              firstVisitDate: p.date,
            },
          });
          customerId = c.id;
        }
      }

      if (existing) {
        await prisma.reservation.update({
          where: { id: existing.id },
          data: {
            customerId: customerId || existing.customerId,
            menuName: p.menuName || existing.menuName,
            menuPrice: p.price ?? existing.menuPrice,
            date: p.date || existing.date,
            startTime: p.startTime || existing.startTime,
            endTime: p.endTime || existing.endTime,
          },
        });
        updated++;
        details.push({ externalId: p.externalId, action: 'updated' });
      } else {
        await prisma.reservation.create({
          data: {
            salonId: s.salonId,
            customerId,
            menuName: p.menuName || 'HPB予約',
            menuPrice: p.price ?? 0,
            date: p.date || new Date().toISOString().slice(0, 10),
            startTime: p.startTime || '10:00',
            endTime: p.endTime || '11:00',
            status: 'confirmed',
            source: 'hotpepper',
            externalId: p.externalId,
          },
        });
        created++;
        details.push({ externalId: p.externalId, action: 'created' });
      }
    }

    logAudit(
      { action: 'hpb.email_import', after: { created, updated, cancelled, skipped } },
      req.headers
    );

    return NextResponse.json({ ok: true, summary: { created, updated, cancelled, skipped }, details });
  } catch (err) {
    if (err instanceof Error && (err.message === 'UNAUTHORIZED' || err.message === 'FORBIDDEN')) {
      return NextResponse.json({ error: '権限がありません' }, { status: 401 });
    }
    console.error(err);
    return NextResponse.json({ error: 'サーバーエラー' }, { status: 500 });
  }
}
