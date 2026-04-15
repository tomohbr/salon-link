// SuperAdmin 専用: 決済バイパスで店舗+管理者ユーザーを直接作成
// 用途: 知り合いのサロン等、決済を発生させずにアカウント発行する場合

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireRole, hashPassword } from '@/lib/auth';

function slugify(s: string) {
  return (
    s
      .toLowerCase()
      .replace(/[^a-z0-9ぁ-んァ-ン一-龥]+/g, '-')
      .replace(/^-|-$/g, '')
      .slice(0, 40) || 'salon-' + Date.now()
  );
}

export async function POST(req: NextRequest) {
  try {
    await requireRole(['superadmin']);
    const { salonName, ownerName, email, password, plan } = await req.json();

    if (!salonName || !ownerName || !email || !password) {
      return NextResponse.json({ error: '必須項目が不足しています' }, { status: 400 });
    }
    if (password.length < 8) {
      return NextResponse.json({ error: 'パスワードは8文字以上必要です' }, { status: 400 });
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: 'このメールアドレスは既に使用されています' }, { status: 400 });
    }

    const slug = slugify(salonName) + '-' + Math.random().toString(36).slice(2, 6);
    const passwordHash = await hashPassword(password);
    const selectedPlan = ['free', 'light', 'standard'].includes(plan) ? plan : 'light';

    const salon = await prisma.salon.create({
      data: {
        slug,
        name: salonName,
        ownerEmail: email,
        status: 'active', // 決済バイパス
        plan: selectedPlan,
        users: {
          create: {
            email,
            name: ownerName,
            passwordHash,
            role: 'admin',
          },
        },
      },
    });

    return NextResponse.json({
      ok: true,
      salon: { id: salon.id, slug: salon.slug, name: salon.name },
      credentials: { email, password },
    });
  } catch (err) {
    if (err instanceof Error && (err.message === 'UNAUTHORIZED' || err.message === 'FORBIDDEN')) {
      return NextResponse.json({ error: err.message }, { status: 401 });
    }
    console.error(err);
    return NextResponse.json({ error: 'サーバーエラー' }, { status: 500 });
  }
}
