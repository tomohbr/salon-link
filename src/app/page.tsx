import Link from 'next/link';
import Image from 'next/image';
import Slideshow from './_components/Slideshow';
import { getSession } from '@/lib/auth';

export default async function LandingPage() {
  const session = await getSession();
  return (
    <div className="min-h-screen" style={{ background: '#fffdfd', color: '#2a1a26' }}>
      {/* ─────────── Header ─────────── */}
      <header className="sticky top-0 z-20 backdrop-blur-md" style={{ background: 'rgba(255,253,253,0.92)', borderBottom: '1px solid #e8dfd9' }}>
        <div className="max-w-6xl mx-auto px-6 py-5 flex items-center justify-between">
          <Link href="/" className="flex items-baseline gap-3">
            <span className="text-xl font-bold tracking-wide" style={{ color: '#633f5a' }}>SalonLink</span>
            <span className="text-[10px] tracking-[0.2em] uppercase hidden md:inline" style={{ color: '#8a7a82' }}>for Nail Salons</span>
          </Link>
          <nav className="hidden md:flex items-center gap-8 text-sm">
            <Link href="#about" className="hover:opacity-60 transition-opacity" style={{ color: '#2a1a26' }}>サービスについて</Link>
            <Link href="#features" className="hover:opacity-60 transition-opacity" style={{ color: '#2a1a26' }}>できること</Link>
            <Link href="#pricing" className="hover:opacity-60 transition-opacity" style={{ color: '#2a1a26' }}>料金</Link>
            {session ? (
              <>
                <span className="text-xs" style={{ color: '#8a7a82' }}>{session.name} 様</span>
                <Link href={session.role === 'superadmin' ? '/superadmin' : '/dashboard'} className="px-5 py-2.5 text-xs tracking-[0.15em]" style={{ background: '#1a1a1a', color: 'white' }}>
                  ダッシュボードへ
                </Link>
              </>
            ) : (
              <>
                <Link href="/login" className="hover:opacity-60 transition-opacity" style={{ color: '#2a1a26' }}>ログイン</Link>
                <Link href="/register" className="px-5 py-2.5 text-xs tracking-[0.15em]" style={{ background: '#1a1a1a', color: 'white' }}>
                  新規ご登録
                </Link>
              </>
            )}
          </nav>
          <Link href={session ? (session.role === 'superadmin' ? '/superadmin' : '/dashboard') : '/register'} className="md:hidden px-4 py-2 text-[11px] tracking-[0.1em]" style={{ background: '#1a1a1a', color: 'white' }}>
            {session ? 'ダッシュボード' : 'ご登録'}
          </Link>
        </div>
      </header>

      {/* ─────────── Hero (全幅写真 + オーバーレイ) ─────────── */}
      <section className="relative w-full" style={{ minHeight: '680px' }}>
        <div className="absolute inset-0">
          <Image
            src="/images/lp/hero-main.jpg"
            alt="ネイルサロンの施術イメージ"
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
          <div
            className="absolute inset-0"
            style={{
              background:
                'linear-gradient(180deg, rgba(42,26,38,0.25) 0%, rgba(42,26,38,0.55) 60%, rgba(42,26,38,0.85) 100%)',
            }}
          />
        </div>

        <div className="relative max-w-5xl mx-auto px-6 py-32 md:py-40 flex flex-col items-center text-center min-h-[680px] justify-center">
          <p className="text-[10px] tracking-[0.4em] mb-8 text-white/80">
            NAIL SALON × LINE × HOTPEPPER
          </p>
          <h1 className="text-3xl md:text-5xl font-bold leading-[1.6] tracking-wide mb-10 text-white">
            はじめてのお客さまを、<br />
            ずっと通ってくださる<br className="md:hidden" />お客さまへ。
          </h1>
          <p className="text-sm md:text-base leading-[2.2] mb-12 max-w-2xl text-white/85">
            ホットペッパーでご来店いただいた新規のお客さまを、<br className="hidden md:block" />
            LINE のやさしいつながりで、自社の常連さまへ。
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link href="/register" className="px-10 py-4 text-xs tracking-[0.2em]" style={{ background: 'white', color: '#2a1a26' }}>
              新規ご登録(月額 3,980円)
            </Link>
            <Link href="/login" className="px-10 py-4 text-xs tracking-[0.2em] text-white" style={{ border: '1px solid rgba(255,255,255,0.6)' }}>
              ログイン
            </Link>
          </div>
          <p className="mt-10 text-[11px] text-white/70">
            <Link href="/book/nail-salon-demo" className="underline underline-offset-4">
              サンプル店舗の予約ページを見る →
            </Link>
          </p>
        </div>
      </section>

      {/* ─────────── About ─────────── */}
      <section id="about" className="py-24 md:py-32">
        <div className="max-w-3xl mx-auto px-6">
          <div className="text-center mb-16">
            <p className="text-xs tracking-[0.3em] mb-4" style={{ color: '#633f5a' }}>ABOUT</p>
            <h2 className="text-2xl md:text-3xl font-bold leading-[1.8]" style={{ color: '#2a1a26' }}>
              個人サロンのための、<br />やさしい集客のしくみ。
            </h2>
          </div>
          <div className="space-y-8 text-sm md:text-base leading-[2.2]" style={{ color: '#4a3a44' }}>
            <p>
              ネイルサロンのオーナーさまにとって、ホットペッパービューティーからの広告費は
              決して小さくない負担です。せっかくご来店いただいた新規のお客さまが、
              次はご自身のサロンへ直接来てくださるようになれば、広告費は抑えられ、
              お客さまとの関係もゆっくり深められます。
            </p>
            <p>
              SalonLink は、そんな個人サロンのための小さなサービスです。
              予約管理も、カルテも、クーポン配信も、LINE 連携も、むずかしい設定なしで
              はじめていただけます。ホットペッパーからの新規のお客さまをどれだけ自社に
              お迎えできたか、数字でやさしく見守ります。
            </p>
          </div>
        </div>
      </section>

      {/* ─────────── Gallery Slideshow (中間アクセント) ─────────── */}
      <section className="pb-24 md:pb-32">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-12">
            <p className="text-xs tracking-[0.3em] mb-4" style={{ color: '#633f5a' }}>GALLERY</p>
            <h2 className="text-xl md:text-2xl font-bold leading-[1.8]" style={{ color: '#2a1a26' }}>
              サロンさまが<wbr />撮影された作品を、<br />ひとつの場所に。
            </h2>
          </div>
          <Slideshow
            slides={[
              { src: '/images/lp/slide-03.jpg', alt: 'ナチュラルピンクのネイル', caption: 'ゆったりとした時間を、爪先から。' },
              { src: '/images/lp/feature-03-customer.jpg', alt: 'ピンクのアーティスティックネイル', caption: 'お客さまの個性を、そっと引き立てて。' },
              { src: '/images/lp/slide-01.jpg', alt: '赤のアートネイル love', caption: '想いを込めたデザインを、かたちに。' },
              { src: '/images/lp/hero-main.jpg', alt: '深い紫とべっ甲柄のネイル', caption: '季節の移り変わりを、指先で感じて。' },
            ]}
          />
        </div>
      </section>

      {/* ─────────── Features (ジグザグレイアウト) ─────────── */}
      <section id="features" className="py-24 md:py-32" style={{ background: '#f5efec' }}>
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-20">
            <p className="text-xs tracking-[0.3em] mb-4" style={{ color: '#633f5a' }}>FEATURES</p>
            <h2 className="text-2xl md:text-3xl font-bold leading-[1.8]" style={{ color: '#2a1a26' }}>
              SalonLink でできること
            </h2>
          </div>

          <div className="space-y-24 md:space-y-32">
            <FeatureRow
              number="01"
              title="LINE でつながる予約"
              text="LINE 公式アカウントからそのままご予約いただけます。LIFF 対応なのでアプリのインストールは不要。予約前日にはリマインドも自動でお送りします。"
              image="/images/lp/feature-01-line.jpg"
              imageAlt="ネイルを塗っている手元"
            />
            <FeatureRow
              number="02"
              title="ひとつのカレンダーで、すべての予約を"
              text="ホットペッパー・LINE・自社ホームページからのご予約を、ひとつのカレンダーでご確認いただけます。お客さまは常に最新の空き状況から時間をお選びいただけます。"
              image="/images/lp/feature-02-calendar.jpg"
              imageAlt="ネイリストが施術をしている様子"
              reverse
            />
            <FeatureRow
              number="03"
              title="ホットペッパーからの流れを、見える化"
              text="ホットペッパー経由でご来店いただいた新規のお客さまのうち、どれだけが次回ご自身のサロンに戻ってきてくださったか。他のサービスにはない独自の指標で、じっくりと改善を重ねていけます。"
              image="/images/lp/feature-03-customer.jpg"
              imageAlt="やわらかいピンクのネイル"
            />
            <FeatureRow
              number="04"
              title="クーポン配信とお客さまカルテ"
              text="休眠されているお客さま、LINE のお友だち、VIPのお客さま。それぞれに合わせたクーポンをお送りいただけます。お一人おひとりのお好みも、カルテにやさしく残せます。"
              image="/images/lp/slide-01.jpg"
              imageAlt="赤のアートネイル"
              reverse
            />
            <FeatureRow
              number="05"
              title="ネイルデザインのギャラリー"
              text="撮影されたネイルデザインをギャラリーとして公開できます。ご予約ページからそのまま「このデザインでお願いします」とお選びいただける、さりげない集客導線です。"
              image="/images/lp/slide-03.jpg"
              imageAlt="ナチュラルピンクのネイル"
            />
          </div>
        </div>
      </section>

      {/* ─────────── Comparison ─────────── */}
      <section className="py-24 md:py-32">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-16">
            <p className="text-xs tracking-[0.3em] mb-4" style={{ color: '#633f5a' }}>PRICING COMPARISON</p>
            <h2 className="text-2xl md:text-3xl font-bold leading-[1.8]" style={{ color: '#2a1a26' }}>
              他社サービスとの比較
            </h2>
            <p className="text-sm mt-4" style={{ color: '#4a3a44' }}>
              同じ機能を、より手の届く価格で。
            </p>
          </div>

          <div className="overflow-x-auto" style={{ border: '1px solid #e8dfd9' }}>
            <table className="w-full text-sm bg-white">
              <thead>
                <tr style={{ borderBottom: '1px solid #e8dfd9' }}>
                  <th className="text-left py-5 px-6 text-xs tracking-[0.1em] font-medium" style={{ color: '#8a7a82' }}>サービス</th>
                  <th className="text-center py-5 px-4 text-xs tracking-[0.1em] font-medium" style={{ color: '#8a7a82' }}>初期費用</th>
                  <th className="text-center py-5 px-4 text-xs tracking-[0.1em] font-medium" style={{ color: '#8a7a82' }}>月額</th>
                  <th className="text-center py-5 px-4 text-xs tracking-[0.1em] font-medium" style={{ color: '#8a7a82' }}>LINE連携</th>
                </tr>
              </thead>
              <tbody>
                <tr style={{ background: '#f5efec', borderBottom: '1px solid #e8dfd9' }}>
                  <td className="py-5 px-6 font-bold whitespace-nowrap" style={{ color: '#633f5a' }}>SalonLink</td>
                  <td className="text-center py-5 px-4 font-bold" style={{ color: '#633f5a' }}>0円</td>
                  <td className="text-center py-5 px-4 font-bold" style={{ color: '#633f5a' }}>3,980円</td>
                  <td className="text-center py-5 px-4" style={{ color: '#633f5a' }}>○</td>
                </tr>
                <ComparisonRow name="リピッテ" init="10,780円" monthly="8,800円" line="○" />
                <ComparisonRow name="RE:RE" init="0円" monthly="9,800円" line="○" />
                <ComparisonRow name="KaruteKun" init="0円" monthly="11,000円〜" line="有料オプション" />
                <ComparisonRow name="リザービア" init="100,000円" monthly="21,000円" line="○" last />
              </tbody>
            </table>
          </div>
          <p className="text-xs mt-6 text-center" style={{ color: '#8a7a82' }}>
            ※ 料金は税別・2026年4月時点の公開情報です。
          </p>
        </div>
      </section>

      {/* ─────────── Pricing ─────────── */}
      <section id="pricing" className="py-24 md:py-32" style={{ background: '#f5efec' }}>
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-16">
            <p className="text-xs tracking-[0.3em] mb-4" style={{ color: '#633f5a' }}>PLAN</p>
            <h2 className="text-2xl md:text-3xl font-bold leading-[1.8]" style={{ color: '#2a1a26' }}>
              料金プラン
            </h2>
            <p className="text-sm mt-4" style={{ color: '#4a3a44' }}>
              まずは無料プランから、お気軽にお試しください。
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <PlanBox name="Free" price="0" desc="まずは触ってみたい方へ" features={['顧客 30名まで', '月間予約 50件まで', '基本のカルテ機能']} />
            <PlanBox name="Light" price="3,980" desc="個人・小規模サロンさま向け" features={['顧客 300名まで', 'ご予約 無制限', 'LINE連携・クーポン', '基本の分析機能']} recommended />
            <PlanBox name="Standard" price="7,980" desc="成長期のサロンさま向け" features={['顧客 無制限', 'AI離反予測', 'デザインギャラリー', '複数スタッフご対応']} />
          </div>
        </div>
      </section>

      {/* ─────────── CTA (写真背景) ─────────── */}
      <section className="relative py-32 md:py-40">
        <div className="absolute inset-0">
          <Image
            src="/images/lp/slide-03.jpg"
            alt=""
            fill
            sizes="100vw"
            className="object-cover"
          />
          <div className="absolute inset-0" style={{ background: 'rgba(42,26,38,0.72)' }} />
        </div>
        <div className="relative max-w-3xl mx-auto px-6 text-center">
          <h2 className="text-2xl md:text-3xl font-bold leading-[1.8] mb-8 text-white">
            サロンさまの毎日を、<br />もう少しだけ、やさしく。
          </h2>
          <p className="text-sm leading-[2.2] mb-10 text-white/85">
            はじめての方も、どうぞお気軽にご登録ください。<br />
            ご不明な点がございましたら、いつでもお問い合わせいただけます。
          </p>
          <Link href="/register" className="inline-block px-12 py-4 text-xs tracking-[0.2em]" style={{ background: 'white', color: '#2a1a26' }}>
            新規ご登録はこちらから
          </Link>
        </div>
      </section>

      {/* ─────────── Footer ─────────── */}
      <footer className="py-12 px-6" style={{ borderTop: '1px solid #e8dfd9' }}>
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <p className="text-sm font-bold tracking-wide" style={{ color: '#633f5a' }}>SalonLink</p>
              <p className="text-[10px] tracking-[0.2em] uppercase mt-1" style={{ color: '#8a7a82' }}>for Nail Salons</p>
            </div>
            <nav className="flex flex-wrap gap-6 text-xs" style={{ color: '#4a3a44' }}>
              <Link href="#about" className="hover:opacity-60">サービスについて</Link>
              <Link href="#features" className="hover:opacity-60">できること</Link>
              <Link href="#pricing" className="hover:opacity-60">料金</Link>
              <Link href="/login" className="hover:opacity-60">ログイン</Link>
            </nav>
          </div>
          <div className="mt-8 pt-8 text-center text-xs" style={{ borderTop: '1px solid #e8dfd9', color: '#8a7a82' }}>
            © 2026 SalonLink. Photos from Unsplash.
          </div>
        </div>
      </footer>
    </div>
  );
}

function FeatureRow({
  number,
  title,
  text,
  image,
  imageAlt,
  reverse,
}: {
  number: string;
  title: string;
  text: string;
  image: string;
  imageAlt: string;
  reverse?: boolean;
}) {
  return (
    <div className={`grid md:grid-cols-2 gap-10 md:gap-16 items-center ${reverse ? 'md:[&>:first-child]:order-2' : ''}`}>
      <div className="relative aspect-[4/5] md:aspect-[3/4] overflow-hidden">
        <Image
          src={image}
          alt={imageAlt}
          fill
          sizes="(max-width: 768px) 100vw, 50vw"
          className="object-cover"
        />
      </div>
      <div className="md:px-6">
        <p className="text-xs tracking-[0.3em] mb-5" style={{ color: '#633f5a' }}>
          {number}
        </p>
        <h3 className="text-xl md:text-2xl font-bold mb-6 leading-[1.8]" style={{ color: '#2a1a26' }}>
          {title}
        </h3>
        <p className="text-sm leading-[2.2]" style={{ color: '#4a3a44' }}>
          {text}
        </p>
      </div>
    </div>
  );
}

function ComparisonRow({ name, init, monthly, line, last }: { name: string; init: string; monthly: string; line: string; last?: boolean }) {
  return (
    <tr style={last ? {} : { borderBottom: '1px solid #e8dfd9' }}>
      <td className="py-5 px-6 whitespace-nowrap" style={{ color: '#4a3a44' }}>{name}</td>
      <td className="text-center py-5 px-4" style={{ color: '#4a3a44' }}>{init}</td>
      <td className="text-center py-5 px-4" style={{ color: '#4a3a44' }}>{monthly}</td>
      <td className="text-center py-5 px-4" style={{ color: '#4a3a44' }}>{line}</td>
    </tr>
  );
}

function PlanBox({ name, price, desc, features, recommended }: { name: string; price: string; desc: string; features: string[]; recommended?: boolean }) {
  return (
    <div className="bg-white p-8" style={{ border: recommended ? '1px solid #633f5a' : '1px solid #e8dfd9' }}>
      {recommended && (
        <div className="inline-block mb-4 px-3 py-1 text-[10px] tracking-[0.2em]" style={{ background: '#633f5a', color: 'white' }}>
          RECOMMENDED
        </div>
      )}
      <h3 className="text-lg font-bold tracking-wide mb-1" style={{ color: '#2a1a26' }}>{name}</h3>
      <p className="text-xs mb-6" style={{ color: '#8a7a82' }}>{desc}</p>
      <div className="mb-8 pb-8" style={{ borderBottom: '1px solid #e8dfd9' }}>
        <span className="text-[10px] align-top" style={{ color: '#4a3a44' }}>¥</span>
        <span className="text-4xl font-bold" style={{ color: '#2a1a26' }}>{price}</span>
        <span className="text-xs ml-1" style={{ color: '#8a7a82' }}>/月(税別)</span>
      </div>
      <ul className="space-y-3 mb-10">
        {features.map((f) => (
          <li key={f} className="text-sm flex items-start gap-3" style={{ color: '#4a3a44' }}>
            <span className="mt-1.5" style={{ color: '#633f5a' }}>●</span>
            <span className="leading-[1.8]">{f}</span>
          </li>
        ))}
      </ul>
      <Link
        href="/register"
        className="block text-center py-3 text-xs tracking-[0.2em]"
        style={recommended ? { background: '#1a1a1a', color: 'white' } : { color: '#2a1a26', border: '1px solid #2a1a26' }}
      >
        このプランで始める
      </Link>
    </div>
  );
}
