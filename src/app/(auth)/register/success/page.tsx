import Link from 'next/link';
import { CheckCircle2 } from 'lucide-react';
import { prisma } from '@/lib/db';

export default async function RegisterSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ salon?: string; demo?: string; session_id?: string }>;
}) {
  const sp = await searchParams;
  let salonName = '';
  if (sp.salon) {
    const salon = await prisma.salon.findUnique({ where: { id: sp.salon } });
    salonName = salon?.name || '';
    // Stripe webhook が届く前に手動で active 化（idempotent）
    if (salon && salon.status === 'pending_payment' && sp.session_id) {
      await prisma.salon.update({ where: { id: sp.salon }, data: { status: 'active' } });
    }
  }

  return (
    <div className="w-full max-w-md">
      <div className="card-box text-center">
        <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4">
          <CheckCircle2 className="w-8 h-8 text-emerald-600" />
        </div>
        <h1 className="text-2xl font-bold text-stone-900 mb-2">登録が完了しました 🎉</h1>
        {salonName && <p className="text-sm text-stone-600 mb-1">{salonName} 様</p>}
        <p className="text-sm text-stone-600 mb-6">
          {sp.demo ? 'デモモードで登録が完了しました' : 'お支払いが完了し、ご利用いただけます'}
        </p>
        <Link href="/login" className="btn-brand w-full justify-center py-2.5">
          ログインして始める
        </Link>
      </div>
    </div>
  );
}
