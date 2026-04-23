import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { hashPassword, createSession } from '@/lib/auth';
import { createCheckoutSession, isDemoMode, type PlanId } from '@/lib/stripe';
import { rateLimit, getClientIp } from '@/lib/rateLimit';
import { logAudit } from '@/lib/audit';

// 新規登録 API
// 1. Salon を status=pending_payment で作成
// 2. Admin User を作成
// 3. Stripe Checkout URL を返す（または demo モードで success へ）

function slugify(s: string) {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9ぁ-んァ-ン一-龥]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 40) || 'salon-' + Date.now();
}

export async function POST(req: NextRequest) {
  try {
    const ip = getClientIp(req.headers);
    const rl = rateLimit({ key: `register:${ip}`, limit: 5, windowSec: 60 * 60 });
    if (!rl.ok) return NextResponse.json({ error: rl.message }, { status: 429 });

    const { salonName, email, password, name, plan } = await req.json();
    if (!salonName || !email || !password || !name) {
      return NextResponse.json({ error: '必須項目が不足しています' }, { status: 400 });
    }
    if (password.length < 8) {
      return NextResponse.json({ error: 'パスワードは8文字以上必要です' }, { status: 400 });
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: 'このメールアドレスは既に登録されています' }, { status: 400 });
    }

    // スラッグ一意化
    let slug = slugify(salonName) + '-' + Math.random().toString(36).slice(2, 6);

    const passwordHash = await hashPassword(password);
    const selectedPlan: PlanId = plan === 'standard' ? 'standard' : 'light';

    const salon = await prisma.salon.create({
      data: {
        slug,
        name: salonName,
        ownerEmail: email,
        status: 'pending_payment',
        plan: selectedPlan,
        users: {
          create: {
            email,
            name,
            passwordHash,
            role: 'admin',
          },
        },
      },
      include: { users: true },
    });

    const origin = req.nextUrl.origin;

    if (isDemoMode) {
      // デモモード: 決済をスキップして直接 active 化し、自動ログインさせる
      await prisma.salon.update({
        where: { id: salon.id },
        data: { status: 'active' },
      });
      const user = salon.users[0];
      await createSession({
        userId: user.id,
        email: user.email,
        name: user.name,
        role: 'admin',
        salonId: salon.id,
      });
      logAudit({ action: 'auth.register', entityType: 'salon', entityId: salon.id, after: { mode: 'demo' } }, req.headers);

      return NextResponse.json({
        ok: true,
        mode: 'demo',
        redirectUrl: `/dashboard`,
      });
    }

    const checkout = await createCheckoutSession({
      plan: selectedPlan,
      salonId: salon.id,
      customerEmail: email,
      successUrl: `${origin}/register/success?salon=${salon.id}&session_id={CHECKOUT_SESSION_ID}`,
      cancelUrl: `${origin}/register?canceled=1`,
    });

    if (!checkout?.url) {
      return NextResponse.json({ error: '決済セッションの作成に失敗しました' }, { status: 500 });
    }

    await prisma.salon.update({
      where: { id: salon.id },
      data: { stripeSessionId: checkout.id },
    });

    return NextResponse.json({ ok: true, redirectUrl: checkout.url });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'サーバーエラー' }, { status: 500 });
  }
}
