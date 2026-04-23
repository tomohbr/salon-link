import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireRole } from '@/lib/auth';
import { randomBytes } from 'crypto';
import { logAudit } from '@/lib/audit';

function generateToken() {
  // 32 文字の URL セーフトークン
  return randomBytes(24).toString('base64url');
}

export async function POST(req: NextRequest) {
  try {
    const s = await requireRole(['admin']);
    if (!s.salonId) return NextResponse.json({ error: 'no salon' }, { status: 403 });

    const token = generateToken();
    await prisma.salon.update({
      where: { id: s.salonId },
      data: { hpbInboundToken: token },
    });

    logAudit({ action: 'salon.hpb_token.generate', entityType: 'salon', entityId: s.salonId }, req.headers);

    return NextResponse.json({ ok: true, token });
  } catch (err) {
    if (err instanceof Error && (err.message === 'UNAUTHORIZED' || err.message === 'FORBIDDEN')) {
      return NextResponse.json({ error: '権限がありません' }, { status: 401 });
    }
    return NextResponse.json({ error: 'サーバーエラー' }, { status: 500 });
  }
}
