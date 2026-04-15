import Link from 'next/link';
import { Sparkles, CheckCircle2, MessageCircle, TrendingUp, Ticket, BarChart3 } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      <header className="border-b border-stone-200 bg-white/80 backdrop-blur sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-lg brand-bg flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="font-bold text-stone-900">SalonLink</div>
              <div className="text-[10px] text-stone-500">for Nail Salons</div>
            </div>
          </div>
          <nav className="flex items-center gap-4 text-sm">
            <Link href="#features" className="text-stone-600 hover:text-stone-900">機能</Link>
            <Link href="#pricing" className="text-stone-600 hover:text-stone-900">料金</Link>
            <Link href="/login" className="text-stone-600 hover:text-stone-900">ログイン</Link>
            <Link href="/register" className="btn-brand">新規登録</Link>
          </nav>
        </div>
      </header>

      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-block badge badge-brand mb-4">月額 ¥3,980 〜 / 初期費用 ¥0</div>
          <h1 className="text-5xl font-bold text-stone-900 leading-tight mb-6">
            ホットペッパーに頼らない<br />
            <span className="brand-text">自社集客</span>を、ネイルサロンに。
          </h1>
          <p className="text-lg text-stone-600 mb-8">
            LINE連携で予約・クーポン・メッセージ配信がワンストップ。<br />
            HPB→自社移行率を可視化し、広告費を月20万円→月5万円へ。
          </p>
          <div className="flex gap-3 justify-center">
            <Link href="/register" className="btn-brand px-6 py-3 text-base">
              <Sparkles className="w-4 h-4" />新規登録（¥3,980/月）
            </Link>
            <Link href="/login" className="btn-ghost px-6 py-3 text-base border border-stone-300">
              ログイン
            </Link>
          </div>
          <div className="mt-4 text-xs text-stone-500">
            <Link href="/book/nail-salon-demo" className="underline">デモ店舗の予約画面を見る →</Link>
          </div>
        </div>
      </section>

      <section className="py-16 px-6 bg-stone-50">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-stone-900 mb-3">他社サービスとの比較</h2>
          <p className="text-center text-stone-600 mb-10">同じ機能を、業界最安クラスで。</p>

          <div className="card-box overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-stone-200">
                  <th className="text-left py-3">サービス</th>
                  <th className="text-center py-3">初期費用</th>
                  <th className="text-center py-3">月額</th>
                  <th className="text-center py-3">LINE連携</th>
                  <th className="text-center py-3">HPB移行追跡</th>
                </tr>
              </thead>
              <tbody>
                <tr className="brand-light-bg font-semibold">
                  <td className="py-3"><span className="brand-text">SalonLink ⭐</span></td>
                  <td className="text-center">¥0</td>
                  <td className="text-center brand-text">¥3,980</td>
                  <td className="text-center">✅</td>
                  <td className="text-center">✅</td>
                </tr>
                <tr className="border-b border-stone-100">
                  <td className="py-3 text-stone-600">リピッテ</td>
                  <td className="text-center text-stone-600">¥10,780</td>
                  <td className="text-center text-stone-600">¥8,800</td>
                  <td className="text-center">✅</td>
                  <td className="text-center text-stone-400">—</td>
                </tr>
                <tr className="border-b border-stone-100">
                  <td className="py-3 text-stone-600">RE:RE</td>
                  <td className="text-center text-stone-600">¥0</td>
                  <td className="text-center text-stone-600">¥9,800</td>
                  <td className="text-center">✅</td>
                  <td className="text-center text-stone-400">—</td>
                </tr>
                <tr className="border-b border-stone-100">
                  <td className="py-3 text-stone-600">KaruteKun</td>
                  <td className="text-center text-stone-600">¥0</td>
                  <td className="text-center text-stone-600">¥11,000+</td>
                  <td className="text-center">有料OP</td>
                  <td className="text-center text-stone-400">—</td>
                </tr>
                <tr>
                  <td className="py-3 text-stone-600">リザービア</td>
                  <td className="text-center text-stone-600">¥100,000</td>
                  <td className="text-center text-stone-600">¥21,000</td>
                  <td className="text-center">✅</td>
                  <td className="text-center text-stone-400">—</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section id="features" className="py-16 px-6">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-stone-900 mb-10">主な機能</h2>
          <div className="grid grid-cols-3 gap-6">
            <Feature icon={<MessageCircle className="w-6 h-6" />} title="LINE連携予約" desc="LIFF対応でインストール不要。予約からリマインドまでLINEで完結。" />
            <Feature icon={<TrendingUp className="w-6 h-6" />} title="HPB→自社移行追跡" desc="他社にない独自指標。HPB経由の新規客がどれだけ自社予約にリピートしたかを可視化。" />
            <Feature icon={<Ticket className="w-6 h-6" />} title="セグメント別クーポン" desc="休眠顧客・VIP・初回来店客など、セグメント別にLINEクーポン配信。" />
            <Feature icon={<BarChart3 className="w-6 h-6" />} title="AI分析・離反予測" desc="来店パターンから離反リスクを自動検知し、最適なアプローチを提案。" />
            <Feature icon={<Sparkles className="w-6 h-6" />} title="デザインギャラリー" desc="Instagram感覚で投稿できるネイルデザイン集。ネイリー型の集客を自社で完結。" />
            <Feature icon={<CheckCircle2 className="w-6 h-6" />} title="シンプルなUI" desc="機能過多の競合と違い、ネイルサロン特化のシンプル設計。" />
          </div>
        </div>
      </section>

      <section id="pricing" className="py-16 px-6 bg-stone-50">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-stone-900 mb-10">料金プラン</h2>
          <div className="grid grid-cols-3 gap-6">
            <PlanBox name="Free" price="¥0" desc="まずはお試しで" features={['顧客 30名', '月間予約 50件', '基本カルテ']} />
            <PlanBox name="Light" price="¥3,980" desc="個人〜小規模サロン向け" features={['顧客 300名', '予約無制限', 'LINE連携', 'クーポン配信', '基本分析']} recommended />
            <PlanBox name="Standard" price="¥7,980" desc="成長期のサロン向け" features={['顧客無制限', 'AI離反予測', 'デザインギャラリー', '複数スタッフ管理', '優先サポート']} />
          </div>
        </div>
      </section>

      <footer className="py-8 px-6 border-t border-stone-200 text-center text-xs text-stone-500">
        © 2026 SalonLink. ネイルサロンの自社集客を、すべての個人店に。
      </footer>
    </div>
  );
}

function Feature({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) {
  return (
    <div className="card-box">
      <div className="w-10 h-10 rounded-lg brand-light-bg flex items-center justify-center brand-text mb-3">{icon}</div>
      <h3 className="font-semibold text-stone-900 mb-2">{title}</h3>
      <p className="text-sm text-stone-600">{desc}</p>
    </div>
  );
}

function PlanBox({ name, price, desc, features, recommended }: { name: string; price: string; desc: string; features: string[]; recommended?: boolean }) {
  return (
    <div className={`card-box ${recommended ? 'border-2 brand-border' : ''}`}>
      {recommended && <div className="badge badge-brand mb-2">おすすめ</div>}
      <h3 className="text-xl font-bold">{name}</h3>
      <p className="text-xs text-stone-500 mb-3">{desc}</p>
      <div className="flex items-baseline gap-1 mb-4">
        <span className="text-3xl font-bold brand-text">{price}</span>
        <span className="text-xs text-stone-500">/月 (税別)</span>
      </div>
      <ul className="space-y-2 mb-5">
        {features.map(f => (
          <li key={f} className="flex items-center gap-2 text-sm text-stone-700">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />{f}
          </li>
        ))}
      </ul>
      <button className={`w-full py-2 rounded-lg font-medium text-sm ${recommended ? 'brand-bg text-white' : 'border border-stone-300'}`}>
        このプランで始める
      </button>
    </div>
  );
}
