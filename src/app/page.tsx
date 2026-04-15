import Link from 'next/link';

export default function LandingPage() {
  return (
    <div className="min-h-screen" style={{ background: '#fffdfd', color: '#2a1a26' }}>
      {/* ─────────── Header ─────────── */}
      <header className="sticky top-0 z-10 backdrop-blur-sm" style={{ background: 'rgba(255,253,253,0.9)', borderBottom: '1px solid #e8dfd9' }}>
        <div className="max-w-5xl mx-auto px-6 py-5 flex items-center justify-between">
          <Link href="/" className="flex items-baseline gap-3">
            <span className="text-xl font-bold tracking-wide" style={{ color: '#633f5a' }}>SalonLink</span>
            <span className="text-[10px] tracking-[0.2em] uppercase" style={{ color: '#8a7a82' }}>for Nail Salons</span>
          </Link>
          <nav className="hidden md:flex items-center gap-8 text-sm">
            <Link href="#about" className="hover:opacity-60 transition-opacity" style={{ color: '#2a1a26' }}>サービスについて</Link>
            <Link href="#features" className="hover:opacity-60 transition-opacity" style={{ color: '#2a1a26' }}>できること</Link>
            <Link href="#pricing" className="hover:opacity-60 transition-opacity" style={{ color: '#2a1a26' }}>料金</Link>
            <Link href="/login" className="hover:opacity-60 transition-opacity" style={{ color: '#2a1a26' }}>ログイン</Link>
            <Link href="/register" className="px-5 py-2.5 text-xs tracking-[0.15em]" style={{ background: '#1a1a1a', color: 'white', border: '1px solid #1a1a1a' }}>
              新規ご登録
            </Link>
          </nav>
        </div>
      </header>

      {/* ─────────── Hero ─────────── */}
      <section className="max-w-4xl mx-auto px-6 py-24 md:py-32">
        <div className="text-center">
          <p className="text-xs tracking-[0.3em] mb-8" style={{ color: '#633f5a' }}>
            NAIL SALON × LINE × HOTPEPPER
          </p>
          <h1 className="text-3xl md:text-5xl font-bold leading-[1.7] tracking-wide mb-10" style={{ color: '#2a1a26' }}>
            はじめてのお客さまを、<br />
            <span style={{ color: '#633f5a' }}>ずっと通ってくださるお客さま</span>へ。
          </h1>
          <p className="text-sm md:text-base leading-[2.2] mb-12 max-w-2xl mx-auto" style={{ color: '#4a3a44' }}>
            ホットペッパーでご来店いただいた新規のお客さまを、<br className="hidden md:block" />
            LINE のやさしいつながりで、自社の常連さまへ。<br />
            予約・クーポン・メッセージ配信を、ひとつの場所に。
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link href="/register" className="px-10 py-4 text-xs tracking-[0.2em]" style={{ background: '#1a1a1a', color: 'white' }}>
              新規ご登録(月額 3,980円)
            </Link>
            <Link href="/login" className="px-10 py-4 text-xs tracking-[0.2em]" style={{ color: '#2a1a26', border: '1px solid #2a1a26' }}>
              ログイン
            </Link>
          </div>
          <p className="mt-8 text-xs" style={{ color: '#8a7a82' }}>
            <Link href="/book/nail-salon-demo" className="underline underline-offset-4">
              サンプル店舗の予約ページを見る
            </Link>
          </p>
        </div>
      </section>

      {/* ─────────── About ─────────── */}
      <section id="about" className="py-24" style={{ background: '#f5efec' }}>
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
            <p>
              大きな機能をたくさん詰め込むのではなく、個人サロンさまが本当に必要とされる
              ことだけを、丁寧に。月額 3,980 円からお使いいただけます。
            </p>
          </div>
        </div>
      </section>

      {/* ─────────── Features ─────────── */}
      <section id="features" className="py-24">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-20">
            <p className="text-xs tracking-[0.3em] mb-4" style={{ color: '#633f5a' }}>FEATURES</p>
            <h2 className="text-2xl md:text-3xl font-bold leading-[1.8]" style={{ color: '#2a1a26' }}>
              SalonLink でできること
            </h2>
          </div>

          <div className="space-y-20">
            <Feature
              number="01"
              title="LINE でつながる予約"
              text="LINE 公式アカウントからそのままご予約いただけます。LIFF 対応なのでアプリのインストールは不要。予約前日にはリマインドも自動でお送りします。"
            />
            <Feature
              number="02"
              title="ひとつのカレンダーで、すべての予約を"
              text="ホットペッパー・LINE・自社ホームページからのご予約を、ひとつのカレンダーでご確認いただけます。お客さまは常に最新の空き状況から時間をお選びいただけます。"
              reverse
            />
            <Feature
              number="03"
              title="ホットペッパーからの流れを、見える化"
              text="ホットペッパー経由でご来店いただいた新規のお客さまのうち、どれだけが次回ご自身のサロンに戻ってきてくださったか。他のサービスにはない独自の指標で、じっくりと改善を重ねていけます。"
            />
            <Feature
              number="04"
              title="クーポン配信とお客さまカルテ"
              text="休眠されているお客さま、LINE のお友だち、VIPのお客さま。それぞれに合わせたクーポンをお送りいただけます。お一人おひとりのお好みも、カルテにやさしく残せます。"
              reverse
            />
            <Feature
              number="05"
              title="ネイルデザインのギャラリー"
              text="撮影されたネイルデザインをギャラリーとして公開できます。ご予約ページからそのまま「このデザインでお願いします」とお選びいただける、さりげない集客導線です。"
            />
          </div>
        </div>
      </section>

      {/* ─────────── Comparison ─────────── */}
      <section className="py-24" style={{ background: '#f5efec' }}>
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

          <div className="bg-white" style={{ border: '1px solid #e8dfd9' }}>
            <table className="w-full text-sm">
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
                  <td className="py-5 px-6 font-bold" style={{ color: '#633f5a' }}>SalonLink</td>
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
      <section id="pricing" className="py-24">
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
            <PlanBox
              name="Free"
              price="0"
              desc="まずは触ってみたい方へ"
              features={['顧客 30名まで', '月間予約 50件まで', '基本のカルテ機能']}
            />
            <PlanBox
              name="Light"
              price="3,980"
              desc="個人・小規模サロンさま向け"
              features={['顧客 300名まで', 'ご予約 無制限', 'LINE連携・クーポン', '基本の分析機能']}
              recommended
            />
            <PlanBox
              name="Standard"
              price="7,980"
              desc="成長期のサロンさま向け"
              features={['顧客 無制限', 'AI離反予測', 'デザインギャラリー', '複数スタッフご対応']}
            />
          </div>
        </div>
      </section>

      {/* ─────────── CTA ─────────── */}
      <section className="py-24" style={{ background: '#f5efec' }}>
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h2 className="text-2xl md:text-3xl font-bold leading-[1.8] mb-8" style={{ color: '#2a1a26' }}>
            サロンさまの毎日を、<br />もう少しだけ、やさしく。
          </h2>
          <p className="text-sm leading-[2.2] mb-10" style={{ color: '#4a3a44' }}>
            はじめての方も、どうぞお気軽にご登録ください。<br />
            ご不明な点がございましたら、いつでもお問い合わせいただけます。
          </p>
          <Link href="/register" className="inline-block px-12 py-4 text-xs tracking-[0.2em]" style={{ background: '#1a1a1a', color: 'white' }}>
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
            <nav className="flex gap-6 text-xs" style={{ color: '#4a3a44' }}>
              <Link href="#about" className="hover:opacity-60">サービスについて</Link>
              <Link href="#features" className="hover:opacity-60">できること</Link>
              <Link href="#pricing" className="hover:opacity-60">料金</Link>
              <Link href="/login" className="hover:opacity-60">ログイン</Link>
            </nav>
          </div>
          <div className="mt-8 pt-8 text-center text-xs" style={{ borderTop: '1px solid #e8dfd9', color: '#8a7a82' }}>
            © 2026 SalonLink. ネイルサロンさまの毎日に、そっと寄りそうサービスを。
          </div>
        </div>
      </footer>
    </div>
  );
}

function Feature({ number, title, text, reverse }: { number: string; title: string; text: string; reverse?: boolean }) {
  return (
    <div className={`grid md:grid-cols-[auto_1fr] gap-8 md:gap-16 items-start ${reverse ? 'md:[&>:first-child]:order-2' : ''}`}>
      <div className="text-xs tracking-[0.3em] md:pt-2" style={{ color: '#633f5a' }}>
        {number}
      </div>
      <div>
        <h3 className="text-lg md:text-xl font-bold mb-4" style={{ color: '#2a1a26' }}>{title}</h3>
        <p className="text-sm leading-[2.2]" style={{ color: '#4a3a44' }}>{text}</p>
      </div>
    </div>
  );
}

function ComparisonRow({ name, init, monthly, line, last }: { name: string; init: string; monthly: string; line: string; last?: boolean }) {
  return (
    <tr style={last ? {} : { borderBottom: '1px solid #e8dfd9' }}>
      <td className="py-5 px-6" style={{ color: '#4a3a44' }}>{name}</td>
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
