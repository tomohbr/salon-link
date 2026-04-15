import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { verifyPassword, createSession, type Role } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();
    if (!email || !password) {
      return NextResponse.json({ error: 'メールアドレスとパスワードを入力してください' }, { status: 400 });
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

    return NextResponse.json({
      ok: true,
      redirectUrl: user.role === 'superadmin' ? '/superadmin' : '/dashboard',
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'サーバーエラー' }, { status: 500 });
  }
}
