// メッセージ送信 API - LINE公式アカウントから一斉 or セグメント配信
// LINE_CHANNEL_ACCESS_TOKEN が設定されていれば実送信、未設定なら mock ログ
// 送信履歴は messages テーブルに記録される

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireRole } from '@/lib/auth';
import { multicastText } from '@/lib/line/client';

export async function POST(req: NextRequest) {
  try {
    const s = await requireRole(['admin']);
    if (!s.salonId) return NextResponse.json({ error: 'no salon' }, { status: 403 });

    const { title, content, targetSegment } = await req.json();
    if (!title || !content) return NextResponse.json({ error: '必須項目が不足しています' }, { status: 400 });

    const segment = targetSegment || 'all';

    // ターゲット顧客を抽出
    const today = new Date();
    const allCustomers = await prisma.customer.findMany({
      where: { salonId: s.salonId, isLineFriend: true, lineUserId: { not: null } },
    });

    let targets = allCustomers;
    if (segment === 'dormant') {
      targets = allCustomers.filter((c) => {
        if (!c.lastVisitDate) return false;
        const days = Math.floor((today.getTime() - new Date(c.lastVisitDate).getTime()) / 86400000);
        return days >= 90;
      });
    } else if (segment === 'new') {
      targets = allCustomers.filter((c) => c.visitCount === 1);
    } else if (segment === 'vip') {
      targets = allCustomers.filter((c) => c.visitCount >= 10 || c.totalSpent >= 100000);
    }

    const userIds = targets.map((c) => c.lineUserId!).filter(Boolean);

    const fullText = `${title}\n\n${content}`;
    await multicastText(userIds, fullText);

    // 送信履歴を記録
    const message = await prisma.message.create({
      data: {
        salonId: s.salonId,
        type: segment === 'all' ? 'broadcast' : 'segment',
        title,
        content,
        targetSegment: segment,
        sentCount: userIds.length,
        openedCount: 0,
        clickedCount: 0,
        status: 'sent',
        sentAt: new Date(),
      },
    });

    return NextResponse.json({
      ok: true,
      message,
      sent: userIds.length,
      note: userIds.length === 0 ? 'LINE友だち登録済みの顧客がいません' : undefined,
    });
  } catch (err) {
    if (err instanceof Error && (err.message === 'UNAUTHORIZED' || err.message === 'FORBIDDEN')) {
      return NextResponse.json({ error: err.message }, { status: 401 });
    }
    console.error(err);
    return NextResponse.json({ error: 'サーバーエラー' }, { status: 500 });
  }
}
