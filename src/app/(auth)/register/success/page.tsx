import { redirect } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle2 } from 'lucide-react';
import { prisma } from '@/lib/db';
import { createSession, getSession } from '@/lib/auth';

export default async function RegisterSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ salon?: string; demo?: string; session_id?: string }>;
}) {
  const sp = await searchParams;
  const existingSession = await getSession();

  // 既にログイン済みならそのままダッシュボードへ
  if (existingSession) redirect('/dashboard');

  if (sp.salon) {
    const salon = await prisma.salon.findUnique({
      where: { id: sp.salon },
      include: { users: { where: { role: 'admin' } } },
    });
    if (salon) {
      // Stripe からの戻り: session_id があれば active 化
      if (salon.status === 'pending_payment' && sp.session_id) {
        await prisma.salon.update({ where: { id: sp.salon }, data: { status: 'active' } });
        salon.status = 'active';
      }
      // active なら自動ログイン
      if (salon.status === 'active' && salon.users[0]) {
        const u = salon.users[0];
        await createSession({
          userId: u.id,
          email: u.email,
          name: u.name,
          role: 'admin',
          salonId: salon.id,
        });
        redirect('/dashboard');
      }
    }
  }

  // フォールバック: 何らかの理由で自動ログインできなかった場合のみ表示
  return (
    <div className="w-full max-w-md">
      <div className="bg-white p-10 text-center" style={{ border: '1px solid #e8dfd9' }}>
        <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: '#f5efec' }}>
          <CheckCircle2 className="w-8 h-8" style={{ color: '#633f5a' }} />
        </div>
        <h1 className="text-xl font-bold mb-2" style={{ color: '#2a1a26' }}>登録が完了しました</h1>
        <p className="text-sm mt-3 mb-6" style={{ color: '#4a3a44' }}>
          ログインしてご利用を開始してください
        </p>
        <Link href="/login" className="inline-block px-10 py-3 text-xs tracking-[0.2em]" style={{ background: '#1a1a1a', color: 'white' }}>
          ログイン
        </Link>
      </div>
    </div>
  );
}
