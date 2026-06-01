// アプリ内フィードバック投稿 API
// ログイン中のオーナー/スタッフから改善要望・不具合報告を受け取り保存する。
// SuperAdmin が /superadmin で一覧確認する。

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'ログインが必要です' }, { status: 401 });
    }

    const { message, page } = await req.json();
    const text = String(message || '').trim();
    if (!text) {
      return NextResponse.json({ error: 'ご意見を入力してください' }, { status: 400 });
    }
    if (text.length > 2000) {
      return NextResponse.json({ error: '2000文字以内で入力してください' }, { status: 400 });
    }

    let salonName: string | null = null;
    if (session.salonId) {
      const salon = await prisma.salon.findUnique({
        where: { id: session.salonId },
        select: { name: true },
      });
      salonName = salon?.name ?? null;
    }

    await prisma.feedback.create({
      data: {
        salonId: session.salonId,
        salonName,
        userName: session.name,
        message: text,
        page: typeof page === 'string' ? page.slice(0, 200) : null,
      },
    });

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error('[feedback]', e);
    return NextResponse.json({ error: 'サーバーエラー' }, { status: 500 });
  }
}
