// HPB インバウンド Webhook
// Zapier / Make / n8n などのメール→Webhook 連携で叩かれる。
//
// URL: POST /api/inbound/hpb/<salon.hpbInboundToken>
// Body: JSON / form-data / plain text のいずれも受付
//   - { raw: "HPB メール本文全文" }   ← 推奨
//   - { subject: "...", body: "..." } ← Zapier Gmail トリガーの典型
//   - plain-text ボディそのまま
//
// 冪等性: (salonId, externalId) の unique 制約で重複防止。
// 同じメールを 100 回転送されても 1 件しか作成されない。

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { parseHpbEmail } from '@/lib/hpb/emailParser';
import { rateLimit, getClientIp } from '@/lib/rateLimit';
import { logAudit } from '@/lib/audit';

export async function POST(req: NextRequest, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;

  // Rate limit: 60 req/min per token
  const rl = rateLimit({ key: `inbound:${token}`, limit: 60, windowSec: 60 });
  if (!rl.ok) return NextResponse.json({ error: rl.message }, { status: 429 });

  const salon = await prisma.salon.findUnique({ where: { hpbInboundToken: token } });
  if (!salon) {
    return NextResponse.json({ error: 'invalid token' }, { status: 404 });
  }

  // 任意フォーマットからメール本文を抽出
  let rawText = '';
  const contentType = req.headers.get('content-type') || '';
  try {
    if (contentType.includes('application/json')) {
      const body = await req.json();
      rawText = body.raw || [body.subject, body.body, body.text, body.html].filter(Boolean).join('\n');
    } else if (contentType.includes('application/x-www-form-urlencoded') || contentType.includes('multipart/form-data')) {
      const fd = await req.formData();
      rawText = String(fd.get('raw') || fd.get('body') || fd.get('text') || fd.get('html') || '');
      const subject = fd.get('subject');
      if (subject) rawText = `${subject}\n${rawText}`;
    } else {
      rawText = await req.text();
    }
  } catch {
    rawText = await req.text();
  }

  if (!rawText) {
    return NextResponse.json({ error: 'empty body' }, { status: 400 });
  }

  const parsed = parseHpbEmail(rawText);
  if (parsed.length === 0) {
    return NextResponse.json(
      { error: 'HPB 予約情報を抽出できませんでした', ok: false, parsedCount: 0 },
      { status: 422 }
    );
  }

  let created = 0;
  let updated = 0;
  let cancelled = 0;
  let skipped = 0;
  const errors: Array<{ externalId: string | null; error: string }> = [];

  for (const p of parsed) {
    if (!p.externalId) { skipped++; continue; }

    try {
      // 既存予約検索 (冪等)
      const existing = await prisma.reservation.findUnique({
        where: { salonId_externalId: { salonId: salon.id, externalId: p.externalId } },
      });

      if (p.eventType === 'cancel') {
        if (existing) {
          await prisma.reservation.update({
            where: { id: existing.id },
            data: { status: 'cancelled' },
          });
          cancelled++;
        } else {
          skipped++;
        }
        continue;
      }

      // 顧客作成 or 取得 (電話番号ベース)
      let customerId: string | null = null;
      if (p.customerName) {
        const existingCustomer = p.phone
          ? await prisma.customer.findFirst({ where: { salonId: salon.id, phone: p.phone } })
          : null;
        if (existingCustomer) {
          customerId = existingCustomer.id;
        } else {
          const c = await prisma.customer.create({
            data: {
              salonId: salon.id,
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
        // 更新
        await prisma.reservation.update({
          where: { id: existing.id },
          data: {
            customerId: customerId || existing.customerId,
            menuName: p.menuName || existing.menuName,
            menuPrice: p.price ?? existing.menuPrice,
            date: p.date || existing.date,
            startTime: p.startTime || existing.startTime,
            endTime: p.endTime || existing.endTime,
            status: p.eventType === 'update' ? existing.status : 'confirmed',
          },
        });
        updated++;
      } else {
        // 新規作成 (空き枠チェックはスキップ: HPB 側で既に確定している)
        await prisma.reservation.create({
          data: {
            salonId: salon.id,
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
      }
    } catch (err) {
      errors.push({
        externalId: p.externalId,
        error: err instanceof Error ? err.message : 'unknown',
      });
    }
  }

  logAudit(
    {
      action: 'hpb.inbound',
      entityType: 'reservation',
      after: { created, updated, cancelled, skipped, errors: errors.length },
    },
    req.headers
  );

  return NextResponse.json({
    ok: true,
    created,
    updated,
    cancelled,
    skipped,
    errors,
  });
}
