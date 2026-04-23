import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { verifyPassword, createSession, type Role } from '@/lib/auth';
import { rateLimit, getClientIp } from '@/lib/rateLimit';
import { logAudit } from '@/lib/audit';

export async function POST(req: NextRequest) {
  try {
    const ip = getClientIp(req.headers);

    // IP ベースレート制限: 1分あたり 10回
    const ipRl = rateLimit({ key: `login:ip:${ip}`, limit: 10, windowSec: 60 });
    if (!ipRl.ok) return NextResponse.json({ error: ipRl.message }, { status: 429 });

    const { email, password } = await req.json();
    if (!email || !password) {
      return NextResponse.json({ error: 'メールアドレスとパスワードを入力してください' }, { status: 400 });
    }

    // Email ベースレート制限: 同一メールに対するブルートフォース対策 (5回/10分)
    const emailKey = String(email).toLowerCase().trim();
    const emailRl = rateLimit({ key: `login:email:${emailKey}`, limit: 5, windowSec: 600 });
    if (!emailRl.ok) {
      return NextResponse.json(
        { error: 'ログイン試行回数が多すぎます。10分後に再度お試しください。' },
        { status: 429 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email },
      include: { salon: true },
    });

    if (!user) {
      return NextResponse.json({ error: 'メールアドレスまたはパスワードが正しくありません' }, { status: 401 });
    }

    const valid = await verifyPassword(password, user.passwordHash);
    if (!valid) {
      return NextResponse.json({ error: 'メールアドレスまたはパスワードが正しくありません' }, { status: 401 });
    }

    // Salon status チェック (admin/staff のみ)
    if (user.role !== 'superadmin') {
      if (!user.salon) {
        return NextResponse.json({ error: '店舗情報が見つかりません' }, { status: 403 });
      }
      if (user.salon.status === 'pending_payment') {
        return NextResponse.json(
          { error: '決済が未完了です。登録を完了してください。', pendingPayment: true },
          { status: 403 }
        );
      }
      if (user.salon.status === 'suspended') {
        return NextResponse.json({ error: 'アカウントが停止されています' }, { status: 403 });
      }
    }

    await createSession({
      userId: user.id,
      email: user.email,
      name: user.name,
      role: user.role as Role,
      salonId: user.salonId,
    });

    logAudit({ action: 'auth.login', entityType: 'user', entityId: user.id }, req.headers);

    return NextResponse.json({
      ok: true,
      redirectUrl: user.role === 'superadmin' ? '/superadmin' : '/dashboard',
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'サーバーエラー' }, { status: 500 });
  }
}
