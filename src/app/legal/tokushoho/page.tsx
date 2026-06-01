import { LegalHeading, Definition } from '../_components';

export const metadata = {
  title: '特定商取引法に基づく表記 — SalonLink',
  description: '特定商取引法に基づく表記',
};

export default function TokushohoPage() {
  return (
    <>
      <LegalHeading title="特定商取引法に基づく表記" lastUpdated="2026 年 5 月 25 日" />
      <p className="text-[13.5px] text-stone-700 mb-10 leading-[2.05]">
        「特定商取引に関する法律」第 11 条 (通信販売についての広告) に基づく表記です。
      </p>

      <dl className="space-y-0">
        <Definition term="販売事業者" def="芝原 朋弥 (個人事業主)" />
        <Definition term="運営責任者" def="芝原 朋弥" />
        <Definition term="所在地" def={<span>請求があれば遅滞なく開示いたします。<br /><span className="text-[11px] text-stone-500">※ 必要な場合は下記メールアドレス宛にご連絡ください。</span></span>} />
        <Definition term="電話番号" def={<span>請求があれば遅滞なく開示いたします。<br /><span className="text-[11px] text-stone-500">※ お問合せは原則メール (shibahara.724@gmail.com) で受け付けております。受付時間: 平日 10:00 — 18:00</span></span>} />
        <Definition term="メールアドレス" def="shibahara.724@gmail.com" />
        <Definition term="販売価格" def={
          <div className="space-y-1">
            <div>Free プラン: 月額 ¥0 (税込)</div>
            <div>Standard プラン: 月額 ¥4,980 (税別) / ¥5,478 (税込)</div>
            <div>Pro プラン: 月額 ¥9,980 (税別) / ¥10,978 (税込)</div>
            <div className="text-[11px] text-stone-500 mt-2">※ ホームページ制作などの別途オプションは、本サービスとは別契約となります。</div>
          </div>
        } />
        <Definition term="商品代金以外の必要料金" def="消費税、振込手数料 (お客様負担)" />
        <Definition term="支払方法" def="クレジットカード (Visa / Mastercard / JCB / American Express)" />
        <Definition term="支払時期" def="お申込み時に登録されたクレジットカードに対して、毎月初日に当月分の利用料金が課金されます。" />
        <Definition term="サービス提供時期" def="お申込み完了後、即時ご利用いただけます。" />
        <Definition term="返品・解約について" def={
          <div className="space-y-1">
            <div>本サービスはサブスクリプション型のソフトウェアサービスのため、性質上「返品」の概念はありません。</div>
            <div>解約は、本サービスの管理画面からお客様自身でいつでも行うことができます。</div>
            <div>解約日までに発生した利用料金は、日割り精算は行わず、当該月の料金は全額発生するものとします。</div>
            <div>解約後 30 日間は、顧客データを CSV 形式でダウンロードいただけます。</div>
          </div>
        } />
        <Definition term="動作環境" def={
          <div className="space-y-1">
            <div>本サービスは Web ブラウザでご利用いただきます。</div>
            <div>推奨ブラウザ: Chrome / Safari / Edge / Firefox の最新版</div>
            <div>モバイルもデスクトップも対応</div>
          </div>
        } />
        <Definition term="サポート" def={
          <div className="space-y-1">
            <div>メールサポート (shibahara.724@gmail.com)</div>
            <div>Pro プランでは初期設定サポート付き</div>
            <div>FAQ: <a href="/#faq" className="underline underline-offset-2" style={{ color: '#633f5a' }}>ホーム → FAQ</a></div>
          </div>
        } />
      </dl>

      <div className="mt-12 p-4 bg-stone-50 border border-stone-200 rounded text-[12px] text-stone-600 leading-[1.95]">
        本表記に記載のない事項については、<a href="/legal/terms" className="underline underline-offset-2" style={{ color: '#633f5a' }}>利用規約</a>・<a href="/legal/privacy" className="underline underline-offset-2" style={{ color: '#633f5a' }}>プライバシーポリシー</a>に従います。
      </div>
    </>
  );
}
