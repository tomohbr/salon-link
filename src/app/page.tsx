// NailSalonLink LP (18 セクション構成)
// "広告に依存しない店へ、静かに切り替えていく。"
import Link from 'next/link';
import Image from 'next/image';
import { getSession } from '@/lib/auth';
import {
  CheckCircle2, Calendar, Users, TrendingUp, MessageCircle, Ticket, Sparkles,
  Mail, Shield, Lock, Database, FileCheck, UserCheck, Clock, Star,
  ChevronRight, Zap, Palette,
} from 'lucide-react';
import RoiCalculator from './_lp/RoiCalculator';
import StickyMobileCta from './_lp/StickyMobileCta';
import Reveal from './_lp/Reveal';
import CountUp from './_lp/CountUp';

export const metadata = {
  title: 'SalonLink — 個人ネイルサロンのための、自社集客サービス',
  description: '広告に依存しない店へ、静かに切り替えていく。ホットペッパーからの新規客を、LINE と自社予約で、ずっと通ってくださるお客さまへ。月額 4,980 円から。',
};

export default async function LandingPage() {
  const session = await getSession();
  return (
    <div style={{ background: 'var(--gray-0)', color: 'var(--gray-900)' }}>
      <Header session={session} />
      <TrustBar />
      <Hero />
      <SocialProof />
      <About />
      <Tour />
      <Features />
      <Comparison />
      <Roi />
      <CaseStudy />
      <Gallery />
      <Why />
      <Pricing />
      <HomepageOption />
      <Security />
      <FounderNote />
      <Faq />
      <FinalCta />
      <Footer />
      <StickyMobileCta />
    </div>
  );
}

/* ================================================================== Header */
function Header({ session }: { session: { name: string; role: string } | null }) {
  return (
    <header
      className="sticky top-0 z-30 backdrop-blur-md"
      style={{ background: 'rgba(255,255,255,0.9)', borderBottom: '1px solid var(--gray-200)' }}
    >
      <div className="max-w-6xl mx-auto px-5 md:px-6 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center text-white"
            style={{ background: 'linear-gradient(135deg, #633f5a 0%, #2a1a26 100%)' }}
          >
            <Sparkles className="w-4 h-4" strokeWidth={2.2} />
          </div>
          <div className="min-w-0">
            <div className="font-bold text-sm tracking-wide" style={{ color: 'var(--gray-900)' }}>SalonLink</div>
            <div className="text-[9px] tracking-[0.2em] uppercase hidden md:block" style={{ color: 'var(--gray-500)' }}>for Nail Salons</div>
          </div>
        </Link>
        <nav className="hidden md:flex items-center gap-7 text-sm" style={{ color: 'var(--gray-700)' }}>
          <Link href="#tour" className="hover:opacity-60">ツアー</Link>
          <Link href="#features" className="hover:opacity-60">機能</Link>
          <Link href="#pricing" className="hover:opacity-60">料金</Link>
          <Link href="#faq" className="hover:opacity-60">よくある質問</Link>
          {session ? (
            <Link
              href={session.role === 'superadmin' ? '/superadmin' : '/dashboard'}
              className="px-4 py-2 text-xs tracking-[0.15em] font-bold"
              style={{ background: 'var(--gray-900)', color: 'white', borderRadius: 'var(--r-md)' }}
            >
              ダッシュボードへ
            </Link>
          ) : (
            <>
              <Link href="/login" className="hover:opacity-60">ログイン</Link>
              <Link
                href="/register"
                className="px-4 py-2 text-xs tracking-[0.15em] font-bold"
                style={{ background: 'var(--gray-900)', color: 'white', borderRadius: 'var(--r-md)' }}
              >
                無料ではじめる
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}

/* ================================================================== TrustBar */
function TrustBar() {
  const items = ['導入 30分', '初期費用 0円', 'HPB CSV取込', 'ネイル特化'];
  return (
    <div className="border-b" style={{ background: 'var(--gray-50)', borderColor: 'var(--gray-200)' }}>
      <div className="max-w-6xl mx-auto px-5 py-3 flex items-center justify-center gap-4 md:gap-8 text-[10px] md:text-xs tracking-wider overflow-x-auto" style={{ color: 'var(--gray-600)' }}>
        {items.map((t, i) => (
          <span key={i} className="flex items-center gap-1.5 whitespace-nowrap">
            <CheckCircle2 className="w-3 h-3" style={{ color: 'var(--brand)' }} />
            {t}
          </span>
        ))}
      </div>
    </div>
  );
}

/* ================================================================== Hero */
function Hero() {
  return (
    <section className="relative overflow-hidden" style={{ background: 'var(--gray-0)' }}>
      {/* 背景の淡い装飾 - ゆったり息遣い */}
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none lp-breathe"
        style={{
          background: 'radial-gradient(circle at 80% 20%, rgba(201,169,110,0.10) 0%, transparent 50%), radial-gradient(circle at 10% 80%, rgba(99,63,90,0.08) 0%, transparent 50%)',
        }}
      />
      <div className="relative max-w-6xl mx-auto px-5 md:px-6 py-24 md:py-36 grid md:grid-cols-[1.1fr_1fr] gap-12 items-center">
        <Reveal direction="up">
          <p className="text-[10px] md:text-xs tracking-[0.3em] mb-6 font-bold" style={{ color: 'var(--brand)' }}>
            NAIL SALON × LINE × 自社HP
          </p>
          <h1 className="text-3xl md:text-5xl font-bold leading-[1.5] tracking-tight mb-8" style={{ color: 'var(--gray-900)' }}>
            広告に依存しない店へ、<br />
            <span style={{ color: 'var(--brand)' }}>静かに切り替えていく。</span>
          </h1>
          <p className="text-sm md:text-base leading-[2.1] mb-10" style={{ color: 'var(--gray-700)' }}>
            ホットペッパーからの新規のお客さまを、LINE と自社予約で、<br className="hidden md:block" />
            ずっと通ってくださるお客さまへ。予約・カルテ・配信を、ひとつの場所に。
          </p>

          {/* 3柱スタッツ (カウントアップ) */}
          <div className="grid grid-cols-3 gap-4 md:gap-6 mb-10">
            <HeroStat label="初期費用" prefix="¥" to={0} />
            <HeroStat label="導入時間" to={30} suffix="分" />
            <HeroStat label="月額" prefix="¥" to={4980} suffix="〜" />
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <Link
              href="/register"
              className="px-8 py-4 text-xs tracking-[0.2em] font-bold text-center transition-all hover:-translate-y-0.5 hover:shadow-lg"
              style={{ background: 'var(--gray-900)', color: 'white', borderRadius: 'var(--r-md)' }}
            >
              無料ではじめる
            </Link>
            <Link
              href="#tour"
              className="px-8 py-4 text-xs tracking-[0.2em] font-bold text-center transition-all hover:bg-gray-900 hover:text-white"
              style={{ color: 'var(--gray-900)', border: '1px solid var(--gray-900)', borderRadius: 'var(--r-md)' }}
            >
              デモを見る <ChevronRight className="inline w-3 h-3" />
            </Link>
          </div>
          <p className="mt-6 text-[11px]" style={{ color: 'var(--gray-500)' }}>
            クレジットカード不要。いつでも解約できます。
          </p>
        </Reveal>

        {/* 右側: ヒーロー写真 */}
        <Reveal direction="left" delayMs={150}>
          <div className="relative">
            <div className="relative aspect-[4/5] overflow-hidden lp-image-zoom" style={{ borderRadius: 'var(--r-lg)', boxShadow: 'var(--elev-4)' }}>
              <Image src="/images/lp/hero-main.jpg" alt="ネイルの施術イメージ" fill priority sizes="(max-width:768px) 100vw, 50vw" className="object-cover" />
            </div>
            {/* フロートカード (UI モック風、カウントアップ付き) */}
            <Reveal direction="up" delayMs={800}>
              <div
                className="absolute -bottom-6 -left-6 p-4 hidden md:block"
                style={{ background: 'white', boxShadow: 'var(--elev-3)', borderRadius: 'var(--r-md)', border: '1px solid var(--gray-200)' }}
              >
                <div className="text-[10px] tracking-wider" style={{ color: 'var(--gray-500)' }}>今月の売上</div>
                <div className="text-2xl font-bold tabular" style={{ color: 'var(--gray-900)' }}>
                  <CountUp to={842500} prefix="¥" durationMs={1600} />
                </div>
                <div className="text-[10px] font-bold tabular mt-1" style={{ color: 'var(--color-success)' }}>
                  +<CountUp to={12.4} decimals={1} durationMs={1600} />% vs 前月
                </div>
              </div>
            </Reveal>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function HeroStat({ label, to, prefix, suffix }: { label: string; to: number; prefix?: string; suffix?: string }) {
  return (
    <div>
      <div className="text-[10px] tracking-[0.15em] uppercase mb-1" style={{ color: 'var(--gray-500)' }}>{label}</div>
      <div className="text-xl md:text-2xl font-bold tabular" style={{ color: 'var(--gray-900)' }}>
        <CountUp to={to} prefix={prefix} suffix={suffix} durationMs={1400} />
      </div>
    </div>
  );
}

/* ================================================================== SocialProof */
function SocialProof() {
  const locations = ['東京', '横浜', '大阪', '名古屋', '福岡', '札幌', '神戸', '京都', '仙台', '広島', '金沢', '那覇', '岡山', '熊本', '新潟'];
  return (
    <section className="py-10 overflow-hidden" style={{ borderTop: '1px solid var(--gray-200)', borderBottom: '1px solid var(--gray-200)' }}>
      <div className="text-center mb-5">
        <p className="text-[10px] tracking-[0.3em] uppercase" style={{ color: 'var(--gray-500)' }}>全国のサロンさまにご愛用いただいております</p>
      </div>
      <div className="relative">
        <div className="flex gap-10 md:gap-14 animate-marquee">
          {[...locations, ...locations].map((loc, i) => (
            <span key={i} className="text-xs md:text-sm font-bold tracking-widest whitespace-nowrap" style={{ color: 'var(--gray-400)' }}>
              {loc}
            </span>
          ))}
        </div>
      </div>
      <style>{`
        @keyframes marquee { from { transform: translateX(0); } to { transform: translateX(-50%); } }
        .animate-marquee { animation: marquee 30s linear infinite; }
      `}</style>
    </section>
  );
}

/* ================================================================== About */
function About() {
  return (
    <section className="py-24 md:py-32">
      <div className="max-w-3xl mx-auto px-5 md:px-6">
        <Reveal className="text-center mb-14">
          <p className="text-xs tracking-[0.3em] mb-4 font-bold" style={{ color: 'var(--brand)' }}>ABOUT</p>
          <h2 className="text-2xl md:text-4xl font-bold leading-[1.6]" style={{ color: 'var(--gray-900)' }}>
            技術だけでは、<br className="md:hidden" />店は回らない。
          </h2>
        </Reveal>
        <Reveal delayMs={120} className="space-y-7 text-sm md:text-base leading-[2.1]" style={{ color: 'var(--gray-700)' }}>
          <p>
            個人ネイルサロンのオーナーさまにとって、ホットペッパービューティーへの広告費は、
            決して軽くない負担です。それでも「集客が止まるのが怖い」と、毎月の掲載料を払い続ける。
            そんな声を、たくさん伺ってきました。
          </p>
          <p>
            SalonLink が目指すのは、ホットペッパーを否定することではありません。
            「新規のお客さまとの最初の出会いはお任せしつつ、2回目からは自社で迎える」 — この切り替えを、
            静かに、でも確実に進めていくための道具です。
          </p>
          <p>
            予約管理も、カルテも、クーポン配信も、LINE 連携も。
            むずかしい設定なしで、今日からはじめていただけます。ネイリストさまが技術に集中できるよう、
            集客と運用の負担をそっと引き受けます。
          </p>
        </Reveal>
      </div>
    </section>
  );
}

/* ================================================================== Tour (CSS モック) */
function Tour() {
  return (
    <section id="tour" className="py-24 md:py-32" style={{ background: 'var(--gray-50)' }}>
      <div className="max-w-6xl mx-auto px-5 md:px-6">
        <Reveal className="text-center mb-16">
          <p className="text-xs tracking-[0.3em] mb-4 font-bold" style={{ color: 'var(--brand)' }}>PRODUCT TOUR</p>
          <h2 className="text-2xl md:text-4xl font-bold leading-[1.6]" style={{ color: 'var(--gray-900)' }}>3つの画面、ひとつの流れ。</h2>
          <p className="mt-4 text-sm md:text-base" style={{ color: 'var(--gray-600)' }}>
            予約 → 施術 → 売上。毎日の業務に、自然に溶け込むように。
          </p>
        </Reveal>

        <div className="space-y-12">
          <TourCard title="01 予約カレンダー" desc="HPB・LINE・自社HP のすべての予約を、ひとつのカレンダーで。">
            <MockCalendar />
          </TourCard>
          <TourCard title="02 顧客カルテ" desc="ジェル銘柄・色番・自爪の薄さ・アレルギー。ネイリストさまが本当に欲しい情報を。" reverse>
            <MockCustomer />
          </TourCard>
          <TourCard title="03 売上ダッシュボード" desc="JST 基準で当月の推移を可視化。3秒で今日の成績が分かります。">
            <MockSales />
          </TourCard>
        </div>
      </div>
    </section>
  );
}

function TourCard({ title, desc, reverse, children }: { title: string; desc: string; reverse?: boolean; children: React.ReactNode }) {
  return (
    <div className={`grid md:grid-cols-2 gap-8 md:gap-14 items-center ${reverse ? 'md:[&>:first-child]:order-2' : ''}`}>
      <Reveal direction={reverse ? 'left' : 'right'}>
        <h3 className="text-lg md:text-xl font-bold mb-3" style={{ color: 'var(--gray-900)' }}>{title}</h3>
        <p className="text-sm md:text-base leading-[2.0]" style={{ color: 'var(--gray-700)' }}>{desc}</p>
      </Reveal>
      <Reveal direction={reverse ? 'right' : 'left'} delayMs={120}>
        <BrowserChrome>{children}</BrowserChrome>
      </Reveal>
    </div>
  );
}

function BrowserChrome({ children }: { children: React.ReactNode }) {
  return (
    <div className="w-full" style={{ boxShadow: 'var(--elev-4)', borderRadius: 'var(--r-lg)', overflow: 'hidden' }}>
      <div className="flex items-center gap-1.5 px-3 py-2.5" style={{ background: 'var(--gray-100)', borderBottom: '1px solid var(--gray-200)' }}>
        <div className="flex gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full" style={{ background: '#ff5f57' }} />
          <span className="w-2.5 h-2.5 rounded-full" style={{ background: '#ffbd2e' }} />
          <span className="w-2.5 h-2.5 rounded-full" style={{ background: '#28c940' }} />
        </div>
        <div className="flex-1 mx-3 px-3 py-1 text-[10px] rounded" style={{ background: 'white', color: 'var(--gray-500)' }}>
          salonlink.app
        </div>
      </div>
      <div style={{ background: 'white' }}>{children}</div>
    </div>
  );
}

function MockCalendar() {
  return (
    <div className="p-4 text-[10px]">
      <div className="flex justify-between items-center mb-3">
        <div className="font-bold">予約カレンダー</div>
        <div className="flex gap-1">
          <span className="px-1.5 py-0.5 rounded-sm font-bold" style={{ background: '#fde68a', color: '#78350f' }}>HPB 3</span>
          <span className="px-1.5 py-0.5 rounded-sm font-bold" style={{ background: '#bbf7d0', color: '#166534' }}>LINE 5</span>
          <span className="px-1.5 py-0.5 rounded-sm font-bold" style={{ background: '#bfdbfe', color: '#1e40af' }}>HP 2</span>
        </div>
      </div>
      <div className="grid grid-cols-8 gap-px" style={{ background: 'var(--gray-200)' }}>
        <div className="bg-white p-1"></div>
        {['月', '火', '水', '木', '金', '土', '日'].map((d, i) => (
          <div key={i} className="bg-white p-1 text-center font-bold">{d}</div>
        ))}
        {['10:00', '11:00', '12:00', '13:00', '14:00', '15:00'].map((t, ti) => (
          <div key={t} className="contents">
            <div className="bg-white p-1 text-right text-[9px]" style={{ color: 'var(--gray-400)' }}>{t}</div>
            {[0, 1, 2, 3, 4, 5, 6].map((di) => {
              const cells = [
                { d: 0, t: 1, type: 'hpb', name: '山田' },
                { d: 2, t: 2, type: 'line', name: '田中' },
                { d: 4, t: 0, type: 'hp', name: '鈴木' },
                { d: 5, t: 3, type: 'line', name: '佐藤' },
                { d: 6, t: 4, type: 'hpb', name: '星野' },
              ];
              const cell = cells.find((c) => c.d === di && c.t === ti);
              if (cell) {
                const colors = {
                  hpb: { bg: '#fef3c7', border: '#f59e0b', fg: '#78350f' },
                  line: { bg: '#dcfce7', border: '#16a34a', fg: '#166534' },
                  hp: { bg: '#dbeafe', border: '#2563eb', fg: '#1e40af' },
                };
                const col = colors[cell.type as keyof typeof colors];
                return (
                  <div key={di} className="bg-white p-0.5">
                    <div className="p-1 text-[9px] font-bold rounded-sm" style={{ background: col.bg, color: col.fg, borderLeft: `2px solid ${col.border}` }}>
                      {cell.name}
                    </div>
                  </div>
                );
              }
              return <div key={di} className="bg-white p-1"></div>;
            })}
          </div>
        ))}
      </div>
    </div>
  );
}

function MockCustomer() {
  return (
    <div className="p-4 text-[10px] space-y-2">
      <div className="flex items-center gap-2.5">
        <div className="w-9 h-9 rounded-full flex items-center justify-center font-bold" style={{ background: 'var(--brand-warm)', color: 'var(--brand)' }}>山</div>
        <div>
          <div className="font-bold text-xs">山田 花子さま</div>
          <div style={{ color: 'var(--gray-500)' }}>来店 6 回 · 累計 ¥51,000</div>
        </div>
      </div>
      <div className="p-2.5 rounded-md" style={{ background: 'var(--gray-50)' }}>
        <div className="font-bold mb-1" style={{ color: 'var(--gray-700)' }}>使用ジェル (前回)</div>
        <div className="space-y-0.5" style={{ color: 'var(--gray-600)' }}>
          <div>・ベース: PREGEL エクセレントベース</div>
          <div>・カラー: プリムドール #127</div>
          <div>・トップ: ノンワイプトップ</div>
        </div>
      </div>
      <div className="p-2.5 rounded-md" style={{ background: '#fef3c7', border: '1px solid #fde68a' }}>
        <div className="font-bold mb-1" style={{ color: '#78350f' }}>⚠ 爪の状態</div>
        <div style={{ color: '#92400e' }}>
          自爪やや薄め · リフト履歴 小指3 · アクリル弱アレルギーあり
        </div>
      </div>
      <div className="p-2.5 rounded-md" style={{ background: '#dcfce7' }}>
        <div className="font-bold mb-1" style={{ color: '#166534' }}>指名</div>
        <div style={{ color: '#15803d' }}>
          トップネイリスト: YUKARI (指名料 ¥1,500 自動加算)
        </div>
      </div>
    </div>
  );
}

function MockSales() {
  const bars = [30, 45, 60, 40, 55, 70, 85, 50, 65, 75, 60, 90, 70, 80, 55];
  const max = Math.max(...bars);
  return (
    <div className="p-4 text-[10px]">
      <div className="flex justify-between items-baseline mb-3">
        <div>
          <div style={{ color: 'var(--gray-500)' }}>今月売上 (JST)</div>
          <div className="text-lg font-bold tabular" style={{ color: 'var(--gray-900)' }}>¥842,500</div>
        </div>
        <span className="px-1.5 py-0.5 rounded-full font-bold text-[9px]" style={{ background: 'var(--color-success-bg)', color: 'var(--color-success)' }}>
          +12.4%
        </span>
      </div>
      <div className="flex items-end gap-0.5 h-16">
        {bars.map((h, i) => (
          <div
            key={i}
            className="flex-1 rounded-sm"
            style={{
              height: `${(h / max) * 100}%`,
              background: i === bars.length - 1 ? 'var(--brand-gold)' : 'var(--brand)',
              opacity: i === bars.length - 1 ? 1 : 0.8,
            }}
          />
        ))}
      </div>
      <div className="flex justify-between mt-2 text-[9px]" style={{ color: 'var(--gray-400)' }}>
        <span>1日</span><span>15日</span>
      </div>
    </div>
  );
}

/* ================================================================== Features */
function Features() {
  const items = [
    { n: '01', t: '予約は、LINEから。', d: 'LINE 公式アカウントからそのままご予約。LIFF 対応でアプリ不要、前日リマインドも自動。', icon: MessageCircle },
    { n: '02', t: 'カレンダーは、ひとつ。', d: 'ホットペッパー・LINE・自社HPの予約が、ひとつのカレンダーに集約されます。', icon: Calendar },
    { n: '03', t: 'HPBからの流れを、追う。', d: 'HPB 経由の新規客のうち、何名が自社に戻ってきたか。独自指標で、静かに改善を重ねていけます。', icon: TrendingUp },
    { n: '04', t: 'ジェルと、指名を、残す。', d: 'PREGEL / Bettygel / ageha 等の銘柄・色番・レイヤー・オフ難度。自爪の薄さ・リフト・アレルギー。指名料 5 階層は自動計算。', icon: Palette },
    { n: '05', t: '配信は、撃ちすぎない。', d: '休眠 28 日基準で対象セグメントを自動抽出。送りすぎない、ちょうどいい距離感を。', icon: Ticket },
    { n: '06', t: 'デザインは、そのまま予約に。', d: '撮影したネイルデザイン (ワンカラー/アート/定額デザイン集) から、お客さまがそのまま指名予約できます。', icon: Sparkles },
  ];
  return (
    <section id="features" className="py-24 md:py-32">
      <div className="max-w-6xl mx-auto px-5 md:px-6">
        <Reveal className="text-center mb-16">
          <p className="text-xs tracking-[0.3em] mb-4 font-bold" style={{ color: 'var(--brand)' }}>FEATURES</p>
          <h2 className="text-2xl md:text-4xl font-bold" style={{ color: 'var(--gray-900)' }}>できること</h2>
        </Reveal>
        <div className="space-y-3">
          {items.map((it, idx) => {
            const Icon = it.icon;
            return (
              <Reveal
                key={it.n}
                delayMs={idx * 80}
                className="grid md:grid-cols-[80px_64px_1fr] gap-4 md:gap-8 items-start p-6 md:p-8 lp-hover-lift"
                style={{ border: '1px solid var(--gray-200)', borderRadius: 'var(--r-lg)', background: 'white' }}
              >
                <div className="text-xs tracking-[0.3em]" style={{ color: 'var(--brand)' }}>{it.n}</div>
                <div
                  className="w-12 h-12 rounded-md flex items-center justify-center"
                  style={{ background: 'var(--brand-warm)' }}
                >
                  <Icon className="w-5 h-5" style={{ color: 'var(--brand)' }} />
                </div>
                <div>
                  <h3 className="text-base md:text-lg font-bold mb-2" style={{ color: 'var(--gray-900)' }}>{it.t}</h3>
                  <p className="text-sm leading-[2.0]" style={{ color: 'var(--gray-600)' }}>{it.d}</p>
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ================================================================== Comparison */
function Comparison() {
  const rows: Array<{ label: string; ours: boolean | string; sb: boolean | string; a: boolean | string; b: boolean | string }> = [
    { label: '月額料金', ours: '¥4,980', sb: 'HPB必須', a: '¥21,000', b: '¥9,800' },
    { label: '初期費用', ours: '¥0', sb: '–', a: '¥100,000', b: '¥0' },
    { label: 'HPB CSV取込', ours: true, sb: true, a: true, b: false },
    { label: 'LINE 公式連携', ours: true, sb: false, a: true, b: true },
    { label: 'HPB→自社 転換率', ours: true, sb: false, a: false, b: false },
    { label: '使用ジェル履歴カルテ', ours: true, sb: false, a: '任意入力', b: '任意入力' },
    { label: 'ネイリスト指名 5階層自動', ours: true, sb: false, a: false, b: false },
    { label: '契約期間の縛り', ours: 'なし', sb: '–', a: '12ヶ月', b: 'なし' },
  ];
  return (
    <section className="py-24 md:py-32" style={{ background: 'var(--gray-50)' }}>
      <div className="max-w-5xl mx-auto px-5 md:px-6">
        <Reveal className="text-center mb-14">
          <p className="text-xs tracking-[0.3em] mb-4 font-bold" style={{ color: 'var(--brand)' }}>COMPARISON</p>
          <h2 className="text-2xl md:text-4xl font-bold" style={{ color: 'var(--gray-900)' }}>他社サービスとの比較</h2>
        </Reveal>
        <Reveal delayMs={120} className="overflow-x-auto" style={{ border: '1px solid var(--gray-200)', borderRadius: 'var(--r-lg)', background: 'white' }}>
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom: '1px solid var(--gray-200)' }}>
                <th className="text-left py-4 px-4 md:px-6 text-[10px] tracking-[0.15em] uppercase" style={{ color: 'var(--gray-500)' }}>項目</th>
                <th className="py-4 px-3 text-center" style={{ background: 'var(--brand-gold-light)', color: 'var(--brand)' }}>
                  <div className="font-bold text-sm">SalonLink</div>
                </th>
                <th className="py-4 px-3 text-center text-xs" style={{ color: 'var(--gray-500)' }}>SALON BOARD</th>
                <th className="py-4 px-3 text-center text-xs" style={{ color: 'var(--gray-500)' }}>大手 A</th>
                <th className="py-4 px-3 text-center text-xs" style={{ color: 'var(--gray-500)' }}>大手 B</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => (
                <tr key={i} style={{ borderBottom: i < rows.length - 1 ? '1px solid var(--gray-100)' : 'none' }}>
                  <td className="py-4 px-4 md:px-6 text-xs md:text-sm" style={{ color: 'var(--gray-700)' }}>{row.label}</td>
                  <CompareCell value={row.ours} emphasis />
                  <CompareCell value={row.sb} />
                  <CompareCell value={row.a} />
                  <CompareCell value={row.b} />
                </tr>
              ))}
            </tbody>
          </table>
        </Reveal>
        <p className="text-xs text-center mt-5" style={{ color: 'var(--gray-500)' }}>
          ※ 価格は税別・2026年4月時点の公開情報を基にした参考比較です。
        </p>
      </div>
    </section>
  );
}

function CompareCell({ value, emphasis }: { value: boolean | string; emphasis?: boolean }) {
  if (typeof value === 'boolean') {
    return (
      <td className="py-4 px-3 text-center" style={emphasis ? { background: 'var(--brand-gold-light)' } : {}}>
        {value ? (
          <CheckCircle2 className="w-4 h-4 mx-auto" style={{ color: emphasis ? 'var(--brand)' : 'var(--gray-400)' }} />
        ) : (
          <span className="text-lg" style={{ color: 'var(--gray-300)' }}>—</span>
        )}
      </td>
    );
  }
  return (
    <td
      className="py-4 px-3 text-center text-xs md:text-sm font-bold tabular"
      style={{ color: emphasis ? 'var(--brand)' : 'var(--gray-600)', background: emphasis ? 'var(--brand-gold-light)' : '' }}
    >
      {value}
    </td>
  );
}

/* ================================================================== ROI */
function Roi() {
  return (
    <section className="py-24 md:py-32">
      <div className="max-w-6xl mx-auto px-5 md:px-6">
        <Reveal className="text-center mb-12">
          <p className="text-xs tracking-[0.3em] mb-4 font-bold" style={{ color: 'var(--brand)' }}>ROI SIMULATOR</p>
          <h2 className="text-2xl md:text-4xl font-bold" style={{ color: 'var(--gray-900)' }}>どれくらい変わるか、試算してみる。</h2>
          <p className="mt-4 text-sm" style={{ color: 'var(--gray-600)' }}>数値を動かして、ご自身のサロンで試してみてください。</p>
        </Reveal>
        <Reveal delayMs={150}>
          <RoiCalculator />
        </Reveal>
      </div>
    </section>
  );
}

/* ================================================================== CaseStudy */
function CaseStudy() {
  return (
    <section className="py-24 md:py-32" style={{ background: 'var(--gray-50)' }}>
      <div className="max-w-4xl mx-auto px-5 md:px-6">
        <Reveal className="text-center mb-12">
          <p className="text-xs tracking-[0.3em] mb-4 font-bold" style={{ color: 'var(--brand)' }}>CASE STUDY (試算)</p>
          <h2 className="text-2xl md:text-4xl font-bold" style={{ color: 'var(--gray-900)' }}>2席ネイルサロンの場合</h2>
          <p className="mt-4 text-sm" style={{ color: 'var(--gray-600)' }}>※ 以下は業界標準値に基づく試算であり、実在の店舗の実績ではありません。</p>
        </Reveal>

        <Reveal
          delayMs={150}
          className="p-8 md:p-12 space-y-8"
          style={{ background: 'white', border: '1px solid var(--gray-200)', borderRadius: 'var(--r-lg)', boxShadow: 'var(--elev-2)' }}
        >
          <div className="space-y-4 text-sm md:text-base leading-[2.1]" style={{ color: 'var(--gray-700)' }}>
            <p>
              「月 3 万円のホットペッパー広告で、月に 15 名の新規客が来る。うち 25% がリピートしてくれる。
              ただ、年に 3 回しか通ってくれず、いつの間にか他店に流れていく。」
            </p>
            <p>
              これが SalonLink 導入前の、典型的な 2 席サロンの構造です。
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 md:gap-4">
            <ShiftBox label="再来周期" before="28日" after="21日" />
            <ShiftBox label="リピート率" before="25%" after="55%" />
            <ShiftBox label="年間来店回数" before="3回" after="6回" />
            <ShiftBox label="年間売上/新規" before="¥34,000" after="¥76,500" highlight />
          </div>

          <div
            className="p-5 text-sm leading-[2.0]"
            style={{ background: 'var(--brand-warm)', borderRadius: 'var(--r-md)', color: 'var(--gray-700)' }}
          >
            年間の新規 180 名に、この「+¥42,500/人」が積み上がります。
            <span className="font-bold" style={{ color: 'var(--brand)' }}> 試算 +¥7,650,000 / 年</span>。
            SalonLink の年間コスト ¥59,760 の、およそ 128 倍です。
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function ShiftBox({ label, before, after, highlight }: { label: string; before: string; after: string; highlight?: boolean }) {
  return (
    <div
      className="p-4"
      style={{
        border: `1px solid ${highlight ? 'var(--brand-gold)' : 'var(--gray-200)'}`,
        borderRadius: 'var(--r-md)',
        background: highlight ? 'var(--brand-gold-light)' : 'white',
      }}
    >
      <div className="text-[10px] tracking-wider uppercase mb-2" style={{ color: 'var(--gray-500)' }}>{label}</div>
      <div className="flex items-baseline gap-2">
        <span className="text-sm line-through" style={{ color: 'var(--gray-400)' }}>{before}</span>
        <ChevronRight className="w-3 h-3" style={{ color: 'var(--gray-400)' }} />
        <span className="text-lg md:text-xl font-bold tabular" style={{ color: highlight ? 'var(--brand)' : 'var(--gray-900)' }}>{after}</span>
      </div>
    </div>
  );
}

/* ================================================================== Gallery */
function Gallery() {
  const items = [
    { img: '/images/lp/slide-03.jpg', title: 'ワンカラー', caption: 'シンプルを、きれいに。' },
    { img: '/images/lp/hero-main.jpg', title: 'アート', caption: '指先に、ちいさな季節を。' },
    { img: '/images/lp/feature-03-customer.jpg', title: 'スカルプ', caption: '長さも、かたちも、自由に。' },
    { img: '/images/lp/feature-01-line.jpg', title: 'ケア', caption: '素の爪から、整える。' },
  ];
  return (
    <section className="py-24 md:py-32">
      <div className="max-w-6xl mx-auto px-5 md:px-6">
        <Reveal className="text-center mb-14">
          <p className="text-xs tracking-[0.3em] mb-4 font-bold" style={{ color: 'var(--brand)' }}>GALLERY</p>
          <h2 className="text-2xl md:text-4xl font-bold" style={{ color: 'var(--gray-900)' }}>ネイルデザインの、ちいさな目録。</h2>
        </Reveal>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          {items.map((it, i) => (
            <Reveal key={i} delayMs={i * 100} direction="up" className="group">
              <div className="relative aspect-[4/5] overflow-hidden lp-image-zoom" style={{ borderRadius: 'var(--r-md)' }}>
                <Image src={it.img} alt={it.title} fill sizes="25vw" className="object-cover" />
              </div>
              <div className="mt-3">
                <div className="text-xs tracking-wider font-bold" style={{ color: 'var(--brand)' }}>{it.title}</div>
                <div className="text-sm mt-1" style={{ color: 'var(--gray-700)' }}>{it.caption}</div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ================================================================== Why */
function Why() {
  const items = [
    { icon: Zap, title: 'すぐ始められる', text: '決済 → ログイン → 最初のお客さま登録まで、約 30 分。マニュアルを読まなくても使えます。' },
    { icon: UserCheck, title: 'ネイル特化', text: 'ジェル銘柄・レイヤー記録・アレルギー・指名料 5 階層。美容室向けの流用ではなく、ネイルに最適化。' },
    { icon: Lock, title: '縛りなし、いつでも解約', text: '契約期間の縛りはありません。毎月の課金日前にキャンセルすれば、翌月から課金停止です。' },
  ];
  return (
    <section className="py-24 md:py-32" style={{ background: 'var(--gray-50)' }}>
      <div className="max-w-5xl mx-auto px-5 md:px-6">
        <Reveal className="text-center mb-14">
          <p className="text-xs tracking-[0.3em] mb-4 font-bold" style={{ color: 'var(--brand)' }}>WHY SALONLINK</p>
          <h2 className="text-2xl md:text-4xl font-bold" style={{ color: 'var(--gray-900)' }}>なぜ SalonLink なのか。</h2>
        </Reveal>
        <div className="grid md:grid-cols-3 gap-5">
          {items.map((it, i) => {
            const Icon = it.icon;
            return (
              <Reveal key={i} delayMs={i * 120} className="p-7 md:p-8 lp-hover-lift" style={{ background: 'white', border: '1px solid var(--gray-200)', borderRadius: 'var(--r-lg)' }}>
                <div
                  className="w-11 h-11 rounded-md flex items-center justify-center mb-5"
                  style={{ background: 'var(--brand-warm)' }}
                >
                  <Icon className="w-5 h-5" style={{ color: 'var(--brand)' }} />
                </div>
                <h3 className="font-bold text-base mb-3" style={{ color: 'var(--gray-900)' }}>{it.title}</h3>
                <p className="text-sm leading-[2.0]" style={{ color: 'var(--gray-600)' }}>{it.text}</p>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ================================================================== Pricing */
function Pricing() {
  return (
    <section id="pricing" className="py-24 md:py-32">
      <div className="max-w-5xl mx-auto px-5 md:px-6">
        <Reveal className="text-center mb-14">
          <p className="text-xs tracking-[0.3em] mb-4 font-bold" style={{ color: 'var(--brand)' }}>PRICING</p>
          <h2 className="text-2xl md:text-4xl font-bold" style={{ color: 'var(--gray-900)' }}>料金プラン</h2>
          <p className="mt-4 text-sm" style={{ color: 'var(--gray-600)' }}>まずは Free プランから、お気軽にお試しください。</p>
        </Reveal>
        <div className="grid md:grid-cols-3 gap-5">
          <Reveal delayMs={0}><Plan name="Free" price="0" desc="まずは触ってみたい方へ" features={['顧客 30名まで', '月間予約 50件まで', '基本カルテ']} /></Reveal>
          <Reveal delayMs={120}><Plan name="Standard" price="4,980" desc="個人・小規模サロンさま向け" features={['顧客 300名', '予約無制限', 'LINE連携 / クーポン', '基本分析', 'HPB CSV取込']} recommended /></Reveal>
          <Reveal delayMs={240}><Plan name="Pro" price="9,980" desc="成長期のサロンさま向け" features={['顧客 無制限', 'AI離反予測', 'デザインギャラリー', '複数スタッフ管理', 'HPB Inbound Webhook']} /></Reveal>
        </div>
      </div>
    </section>
  );
}

function Plan({ name, price, desc, features, recommended }: { name: string; price: string; desc: string; features: string[]; recommended?: boolean }) {
  return (
    <div
      className="p-8 lp-hover-lift"
      style={{
        background: 'white',
        border: `${recommended ? '2px' : '1px'} solid ${recommended ? 'var(--brand)' : 'var(--gray-200)'}`,
        borderRadius: 'var(--r-lg)',
        boxShadow: recommended ? 'var(--elev-3)' : 'var(--elev-1)',
      }}
    >
      {recommended && (
        <div className="inline-block mb-4 px-2.5 py-1 text-[10px] tracking-[0.2em] font-bold" style={{ background: 'var(--brand)', color: 'white', borderRadius: 'var(--r-xs)' }}>
          RECOMMENDED
        </div>
      )}
      <h3 className="text-lg font-bold mb-1" style={{ color: 'var(--gray-900)' }}>{name}</h3>
      <p className="text-xs mb-6" style={{ color: 'var(--gray-500)' }}>{desc}</p>
      <div className="mb-7 pb-7" style={{ borderBottom: '1px solid var(--gray-200)' }}>
        <span className="text-xs align-top" style={{ color: 'var(--gray-600)' }}>¥</span>
        <span className="text-4xl font-bold tabular" style={{ color: 'var(--gray-900)' }}>{price}</span>
        <span className="text-xs ml-1" style={{ color: 'var(--gray-500)' }}>/月 (税別)</span>
      </div>
      <ul className="space-y-2.5 mb-8">
        {features.map((f) => (
          <li key={f} className="flex items-start gap-2.5 text-sm" style={{ color: 'var(--gray-700)' }}>
            <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: 'var(--brand)' }} />
            <span className="leading-[1.7]">{f}</span>
          </li>
        ))}
      </ul>
      <Link
        href="/register"
        className="block text-center py-3 text-xs tracking-[0.2em] font-bold"
        style={{
          background: recommended ? 'var(--gray-900)' : 'white',
          color: recommended ? 'white' : 'var(--gray-900)',
          border: `1px solid var(--gray-900)`,
          borderRadius: 'var(--r-md)',
        }}
      >
        このプランで始める
      </Link>
    </div>
  );
}

/* ================================================================== HomepageOption */
function HomepageOption() {
  return (
    <section className="py-24 md:py-32" style={{ background: 'var(--gray-50)' }}>
      <div className="max-w-5xl mx-auto px-5 md:px-6">
        <Reveal className="text-center mb-14">
          <p className="text-xs tracking-[0.3em] mb-4 font-bold" style={{ color: 'var(--brand)' }}>HOMEPAGE OPTION</p>
          <h2 className="text-2xl md:text-4xl font-bold" style={{ color: 'var(--gray-900)' }}>自社ホームページ制作オプション</h2>
          <p className="mt-4 text-sm" style={{ color: 'var(--gray-600)' }}>
            SalonLink の予約機能を埋め込んだ、サロン専用ホームページを制作します。
          </p>
        </Reveal>

        <div className="grid md:grid-cols-2 gap-5 mb-8">
          <Reveal delayMs={0}><HpPlan price="19,800" name="ライト" features={['1ページ完結LP', 'スマホ最適化', '予約ボタン埋め込み', '納期2週間']} /></Reveal>
          <Reveal delayMs={150}><HpPlan price="49,800" name="スタンダード" features={['複数ページ構成', 'デザイン2案提案', '写真撮影アドバイス', '納期4週間', '3ヶ月無料メンテ']} recommended /></Reveal>
        </div>

        <div
          className="p-5 text-sm"
          style={{ background: 'white', border: '1px solid var(--gray-200)', borderRadius: 'var(--r-md)', color: 'var(--gray-600)' }}
        >
          <span className="font-bold" style={{ color: 'var(--gray-900)' }}>他社相場との比較: </span>
          ネイルサロン向け HP 制作は、一般的に ¥100,000〜¥500,000 が相場です。
          予約システムとの連携部分を自社プロダクトとして内製しているため、この価格でご提供できます。
        </div>
      </div>
    </section>
  );
}

function HpPlan({ price, name, features, recommended }: { price: string; name: string; features: string[]; recommended?: boolean }) {
  return (
    <div
      className="p-8 lp-hover-lift"
      style={{
        background: 'white',
        border: `${recommended ? '2px' : '1px'} solid ${recommended ? 'var(--brand-gold)' : 'var(--gray-200)'}`,
        borderRadius: 'var(--r-lg)',
      }}
    >
      <div className="flex items-baseline justify-between mb-5">
        <div className="font-bold text-lg" style={{ color: 'var(--gray-900)' }}>{name}</div>
        {recommended && (
          <span className="text-[10px] px-2 py-0.5 rounded" style={{ background: 'var(--brand-gold)', color: 'white', fontWeight: 700 }}>POPULAR</span>
        )}
      </div>
      <div className="mb-6 pb-6" style={{ borderBottom: '1px solid var(--gray-200)' }}>
        <span className="text-xs align-top" style={{ color: 'var(--gray-600)' }}>¥</span>
        <span className="text-3xl font-bold tabular" style={{ color: 'var(--gray-900)' }}>{price}</span>
        <span className="text-xs ml-1" style={{ color: 'var(--gray-500)' }}>(税別/一括)</span>
      </div>
      <ul className="space-y-2.5">
        {features.map((f) => (
          <li key={f} className="flex items-start gap-2.5 text-sm" style={{ color: 'var(--gray-700)' }}>
            <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: 'var(--brand-gold)' }} />
            <span>{f}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ================================================================== Security */
function Security() {
  const items = [
    { icon: Lock, text: 'TLS 1.3 による通信暗号化' },
    { icon: Database, text: 'データ保存時 AES-256 暗号化' },
    { icon: FileCheck, text: '日次フルバックアップ・30日保持' },
    { icon: Shield, text: '全操作の監査ログ記録' },
    { icon: UserCheck, text: '管理者/スタッフ権限分離' },
    { icon: Clock, text: '個人情報保護法・改正法に準拠' },
  ];
  return (
    <section className="py-24 md:py-32">
      <div className="max-w-5xl mx-auto px-5 md:px-6">
        <Reveal className="text-center mb-14">
          <p className="text-xs tracking-[0.3em] mb-4 font-bold" style={{ color: 'var(--brand)' }}>SECURITY</p>
          <h2 className="text-2xl md:text-4xl font-bold" style={{ color: 'var(--gray-900)' }}>お客さま情報を、静かにお守りします。</h2>
        </Reveal>
        <div className="grid md:grid-cols-3 gap-4">
          {items.map((it, i) => {
            const Icon = it.icon;
            return (
              <Reveal key={i} delayMs={i * 70} className="flex items-center gap-3 p-4" style={{ background: 'var(--gray-50)', borderRadius: 'var(--r-md)' }}>
                <Icon className="w-5 h-5 flex-shrink-0" style={{ color: 'var(--brand)' }} />
                <span className="text-sm" style={{ color: 'var(--gray-700)' }}>{it.text}</span>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ================================================================== FounderNote */
function FounderNote() {
  return (
    <section className="py-24" style={{ background: 'var(--brand-warm)' }}>
      <Reveal className="max-w-3xl mx-auto px-5 md:px-6 text-center">
        <p className="text-xs tracking-[0.3em] mb-5 font-bold" style={{ color: 'var(--brand)' }}>FOUNDER'S NOTE</p>
        <p className="text-lg md:text-xl leading-[2.1] font-medium" style={{ color: 'var(--gray-900)' }}>
          「ネイリストさまが、本当に集中したいのは、お客さまの爪と向き合う時間のはずです。
          集客も、運用も、道具の側がそっと引き受ける。<br />
          それが SalonLink の、静かな目標です。」
        </p>
        <p className="mt-8 text-xs tracking-widest" style={{ color: 'var(--gray-600)' }}>
          開発チームより
        </p>
      </Reveal>
    </section>
  );
}

/* ================================================================== FAQ */
function Faq() {
  const items = [
    { q: 'HPBとの契約を解約する必要がありますか？', a: 'いいえ。SalonLink は HPB と併用する前提で設計されています。HPB で新規客を獲得しつつ、SalonLink で囲い込みを進める — この段階的な移行が推奨です。' },
    { q: 'データはどこに保存されますか？', a: 'Railway (AWS 東京リージョン相当) の PostgreSQL に暗号化して保存されます。日次バックアップを 30 日保持しています。' },
    { q: 'LINE 公式アカウントを持っていません。' , a: '設定画面から LINE Developers Console へのガイドリンクをご案内します。無料のフリープランで連携可能です。' },
    { q: 'スマホからも操作できますか？', a: 'はい。管理画面はレスポンシブ対応で、iPhone / Android どちらからでも操作可能です。' },
    { q: 'HPB 予約は自動で取り込まれますか？', a: '3つの方法をご用意しています: (1) CSV ダウンロードから取込、(2) HPB 通知メールをコピペして取込、(3) Zapier 等で Inbound Webhook に転送 (Pro プラン)。' },
    { q: '途中でプランを変更できますか？', a: 'はい。設定画面からいつでもプランを変更できます。ダウングレード時は翌請求月から反映されます。' },
    { q: '契約期間の縛りはありますか？', a: 'ありません。月単位でご利用いただけます。' },
    { q: '決済方法は何が使えますか？', a: 'クレジットカード決済 (Stripe 経由) に対応しています。Visa / Master / JCB / Amex / Diners。' },
  ];
  return (
    <section id="faq" className="py-24 md:py-32" style={{ background: 'var(--gray-50)' }}>
      <div className="max-w-3xl mx-auto px-5 md:px-6">
        <Reveal className="text-center mb-14">
          <p className="text-xs tracking-[0.3em] mb-4 font-bold" style={{ color: 'var(--brand)' }}>FAQ</p>
          <h2 className="text-2xl md:text-4xl font-bold" style={{ color: 'var(--gray-900)' }}>よくあるご質問</h2>
        </Reveal>
        <div className="space-y-3">
          {items.map((it, i) => (
            <Reveal key={i} delayMs={i * 50} as="details" className="group p-5 md:p-6 lp-hover-lift" style={{ background: 'white', border: '1px solid var(--gray-200)', borderRadius: 'var(--r-md)' }}>
              <summary className="cursor-pointer font-bold text-sm md:text-base flex items-center justify-between" style={{ color: 'var(--gray-900)' }}>
                <span>{it.q}</span>
                <ChevronRight className="w-4 h-4 transition-transform group-open:rotate-90" style={{ color: 'var(--gray-400)' }} />
              </summary>
              <p className="mt-4 text-sm leading-[2.1]" style={{ color: 'var(--gray-600)' }}>{it.a}</p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ================================================================== FinalCta */
function FinalCta() {
  return (
    <section className="relative py-24 md:py-36 overflow-hidden">
      <div className="absolute inset-0">
        <Image src="/images/lp/slide-03.jpg" alt="" fill sizes="100vw" className="object-cover" />
        <div className="absolute inset-0" style={{ background: 'rgba(42,26,38,0.80)' }} />
      </div>
      <Reveal className="relative max-w-3xl mx-auto px-5 md:px-6 text-center">
        <div className="flex justify-center gap-1 mb-6">
          {[1, 2, 3, 4, 5].map((i) => (
            <Star
              key={i}
              className="w-4 h-4 fill-amber-300 text-amber-300"
              style={{ animation: `lp-fade-up 500ms var(--ease-out-quart) ${i * 100}ms both` }}
            />
          ))}
        </div>
        <h2 className="text-2xl md:text-4xl font-bold leading-[1.6] mb-7 text-white">
          サロンさまの毎日を、<br />もう少しだけ、やさしく。
        </h2>
        <p className="text-sm leading-[2.1] mb-10 text-white/85">
          30分で、最初のお客さまを登録できます。<br />クレジットカード不要、いつでも解約可能です。
        </p>
        <Link
          href="/register"
          className="inline-block px-12 py-4 text-xs tracking-[0.2em] font-bold transition-transform hover:-translate-y-0.5"
          style={{ background: 'white', color: 'var(--gray-900)', borderRadius: 'var(--r-md)' }}
        >
          無料ではじめる
        </Link>
      </Reveal>
    </section>
  );
}

/* ================================================================== Footer */
function Footer() {
  return (
    <footer className="py-12 px-5 md:px-6" style={{ borderTop: '1px solid var(--gray-200)', background: 'white' }}>
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white" style={{ background: 'linear-gradient(135deg, #633f5a 0%, #2a1a26 100%)' }}>
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <div className="font-bold text-sm" style={{ color: 'var(--gray-900)' }}>SalonLink</div>
              <div className="text-[9px] tracking-[0.2em] uppercase" style={{ color: 'var(--gray-500)' }}>for Nail Salons</div>
            </div>
          </div>
          <nav className="flex flex-wrap justify-center gap-5 text-xs" style={{ color: 'var(--gray-600)' }}>
            <Link href="#tour" className="hover:opacity-60">ツアー</Link>
            <Link href="#features" className="hover:opacity-60">機能</Link>
            <Link href="#pricing" className="hover:opacity-60">料金</Link>
            <Link href="#faq" className="hover:opacity-60">FAQ</Link>
            <Link href="/login" className="hover:opacity-60">ログイン</Link>
          </nav>
        </div>
        <div className="mt-8 pt-8 text-center text-xs" style={{ borderTop: '1px solid var(--gray-200)', color: 'var(--gray-500)' }}>
          © 2026 SalonLink. Made for individual nail salons with care.
        </div>
      </div>
    </footer>
  );
}
