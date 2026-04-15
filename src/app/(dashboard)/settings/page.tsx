import { getSalonData } from '@/lib/salonData';
import { Store, MessageCircle, CreditCard, Users } from 'lucide-react';

export default async function SettingsPage() {
  const { salon, staff } = await getSalonData();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-stone-900">設定</h1>
        <p className="text-sm text-stone-500 mt-1">店舗情報・LINE連携・プラン管理</p>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="card-box">
          <div className="flex items-center gap-2 mb-4">
            <Store className="w-5 h-5 brand-text" />
            <h2 className="font-semibold text-stone-900">店舗情報</h2>
          </div>
          <div className="space-y-3">
            <Field label="店舗名" value={salon.name} />
            <Field label="住所" value={salon.address || '—'} />
            <Field label="電話番号" value={salon.phone || '—'} />
            <Field label="予約ページURL" value={`/book/${salon.slug}`} />
          </div>
        </div>

        <div className="card-box">
          <div className="flex items-center gap-2 mb-4">
            <MessageCircle className="w-5 h-5 text-emerald-500" />
            <h2 className="font-semibold text-stone-900">LINE連携</h2>
            <span className={`badge ${salon.lineChannelId ? 'badge-green' : 'badge-gray'} ml-auto`}>
              {salon.lineChannelId ? '接続済' : '未接続'}
            </span>
          </div>
          <div className="space-y-3">
            <Field label="Channel ID" value={salon.lineChannelId || '未設定'} />
            <Field label="Channel Secret" value={salon.lineChannelSecret ? '••••••••' : '未設定'} />
            <Field label="Access Token" value={salon.lineAccessToken ? '••••••••' : '未設定'} />
            <Field label="LIFF ID" value={salon.lineLiffId || '未設定'} />
          </div>
        </div>

        <div className="card-box">
          <div className="flex items-center gap-2 mb-4">
            <CreditCard className="w-5 h-5 text-blue-500" />
            <h2 className="font-semibold text-stone-900">プラン</h2>
          </div>
          <div className="space-y-3">
            <PlanCard name="Free" price="¥0" features={['顧客30名', '月予約50件']} active={salon.plan === 'free'} />
            <PlanCard name="Light" price="¥3,980/月" features={['顧客300名', 'LINE連携', 'クーポン']} active={salon.plan === 'light'} recommended />
            <PlanCard name="Standard" price="¥7,980/月" features={['顧客無制限', 'AI分析', 'デザインギャラリー']} active={salon.plan === 'standard'} />
          </div>
        </div>

        <div className="card-box">
          <div className="flex items-center gap-2 mb-4">
            <Users className="w-5 h-5 text-purple-500" />
            <h2 className="font-semibold text-stone-900">スタッフ</h2>
          </div>
          <div className="space-y-2">
            {staff.length === 0 ? (
              <p className="text-sm text-stone-500 py-4 text-center">スタッフがまだ登録されていません</p>
            ) : (
              staff.map(s => (
                <div key={s.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-stone-50">
                  <div className="w-10 h-10 rounded-full brand-light-bg flex items-center justify-center brand-text font-bold">
                    {s.name.charAt(0)}
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-sm">{s.name}</div>
                    <div className="text-xs text-stone-500">{s.role} · {s.bio}</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-xs text-stone-500">{label}</div>
      <div className="text-sm font-medium text-stone-900 mt-0.5">{value}</div>
    </div>
  );
}

function PlanCard({ name, price, features, active, recommended }: { name: string; price: string; features: string[]; active?: boolean; recommended?: boolean }) {
  return (
    <div className={`p-3 rounded-lg border-2 ${active ? 'brand-border brand-light-bg' : 'border-stone-200'}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="font-semibold">{name}</span>
          {recommended && <span className="badge badge-brand">おすすめ</span>}
          {active && <span className="badge badge-green">利用中</span>}
        </div>
        <span className="font-bold">{price}</span>
      </div>
      <div className="text-xs text-stone-500 mt-1">{features.join(' · ')}</div>
    </div>
  );
}
