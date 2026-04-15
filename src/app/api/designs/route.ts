import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireRole } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const s = await requireRole(['admin']);
    if (!s.salonId) return NextResponse.json({ error: 'no salon' }, { status: 403 });
    const { title, category, photoUrl, tags, isPublished } = await req.json();
    if (!title) return NextResponse.json({ error: 'タイトルは必須です' }, { status: 400 });

    const d = await prisma.nailDesign.create({
      data: {
        salonId: s.salonId,
        title,
        category: category || null,
        photoUrl: photoUrl || null,
        tags: Array.isArray(tags) ? tags : [],
        isPublished: isPublished !== false,
      },
    });
    return NextResponse.json({ ok: true, design: d });
  } catch (err) {
    if (err instanceof Error && (err.message === 'UNAUTHORIZED' || err.message === 'FORBIDDEN')) {
      return NextResponse.json({ error: err.message }, { status: 401 });
    }
    return NextResponse.json({ error: 'サーバーエラー' }, { status: 500 });
  }
}
