import { LegalHeading, Section } from '../_components';

export const metadata = {
  title: 'プライバシーポリシー — SalonLink',
  description: 'SalonLink の個人情報の取扱いに関するプライバシーポリシー。',
};

export default function PrivacyPage() {
  return (
    <>
      <LegalHeading title="プライバシーポリシー" lastUpdated="2026 年 5 月 25 日" />
      <p className="text-[13.5px] text-stone-700 mb-10 leading-[2.05]">
        SalonLink (以下「本サービス」) を運営する事業者 (以下「当方」) は、本サービスを通じて取得する個人情報を、日本の「個人情報の保護に関する法律」 (以下「個人情報保護法」) その他関連法令を遵守し、以下のとおり適切に取り扱います。
      </p>

      <Section n="第 1 条" title="取得する個人情報の項目">
        <p>1. 利用者 (サロンオーナー / スタッフ) から取得する情報:</p>
        <ul className="list-disc pl-6 space-y-1">
          <li>氏名、メールアドレス、電話番号</li>
          <li>店舗情報 (店舗名、住所、営業時間、メニュー、料金)</li>
          <li>パスワード (ハッシュ化して保管)</li>
          <li>クレジットカード情報 (Stripe にて保管、当方は直接保持しません)</li>
          <li>IP アドレス、ユーザーエージェント、操作ログ</li>
        </ul>
        <p>2. 利用者が本サービスに登録する顧客情報 (以下「顧客データ」):</p>
        <ul className="list-disc pl-6 space-y-1">
          <li>顧客の氏名、フリガナ、電話番号、メールアドレス、生年月日、性別</li>
          <li>来店履歴、予約履歴、施術内容 (使用ジェル等)、アレルギー情報</li>
          <li>LINE 公式アカウントの友だち情報 (Channel ID 経由)</li>
        </ul>
      </Section>

      <Section n="第 2 条" title="個人情報の利用目的">
        <p>当方は、取得した個人情報を以下の目的で利用します。</p>
        <ul className="list-disc pl-6 space-y-1">
          <li>本サービスの提供・運営・改善</li>
          <li>利用者の本人確認、認証</li>
          <li>利用料金の請求</li>
          <li>本サービスに関する案内、お問合せ対応</li>
          <li>不正アクセス・不正利用の調査、防止</li>
          <li>統計データの作成 (個人を特定できない形式に加工した上で利用)</li>
          <li>その他、上記利用目的に付随する目的</li>
        </ul>
      </Section>

      <Section n="第 3 条" title="顧客データの取扱い">
        <p>1. 顧客データは、利用者 (サロンオーナー) が顧客から取得し、本サービスに保存するものです。これらのデータの管理責任は利用者にあり、当方はサービスの提供に必要な範囲でのみ取り扱います。</p>
        <p>2. 当方は、顧客データを利用者の同意なく、目的外に利用したり、第三者に提供したりすることはありません。</p>
        <p>3. 当方は、サロン間の顧客データを完全に分離して保管します (マルチテナント設計)。他のサロンが他店の顧客データにアクセスすることはできません。</p>
      </Section>

      <Section n="第 4 条" title="個人情報の第三者提供">
        <p>当方は、以下の場合を除き、取得した個人情報を第三者に提供しません。</p>
        <ul className="list-disc pl-6 space-y-1">
          <li>利用者の同意がある場合</li>
          <li>法令に基づく場合</li>
          <li>人の生命、身体または財産の保護のために必要がある場合であって、本人の同意を得ることが困難である場合</li>
          <li>業務委託先に対して、利用目的の達成に必要な範囲で開示する場合 (Stripe・Railway 等のクラウドサービス事業者を含む)</li>
        </ul>
      </Section>

      <Section n="第 5 条" title="個人情報の安全管理措置">
        <p>当方は、個人情報の漏えい、滅失または毀損の防止のため、以下を含む安全管理措置を講じています。</p>
        <ul className="list-disc pl-6 space-y-1">
          <li>通信の暗号化 (TLS 1.3)</li>
          <li>データベース暗号化 (AES-256 相当)</li>
          <li>パスワードのハッシュ化 (bcrypt)</li>
          <li>マルチテナント分離 (アプリケーション層 + DB スコープ)</li>
          <li>監査ログの記録</li>
          <li>日次バックアップ (別リージョン)</li>
          <li>アクセス権限の最小化</li>
        </ul>
      </Section>

      <Section n="第 6 条" title="Cookie および類似技術">
        <p>1. 本サービスは、認証セッションの維持のために HttpOnly な Cookie を使用します。</p>
        <p>2. 本サービスは、行動ターゲティング広告を目的とした第三者 Cookie を設置しません。</p>
        <p>3. アクセス解析 (Google Analytics 等) を導入する場合は、別途明記いたします。</p>
      </Section>

      <Section n="第 7 条" title="個人情報の保有期間および削除">
        <p>1. 当方は、利用者が本サービスを解約した日から 30 日間、顧客データの CSV エクスポートを可能な状態に保ちます。</p>
        <p>2. 解約後 30 日経過した個人情報は、法令で保管が義務付けられている場合を除き、速やかに削除します。</p>
      </Section>

      <Section n="第 8 条" title="開示・訂正・利用停止等の請求">
        <p>1. 利用者本人およびその顧客 (利用者を通じて) は、当方に対して、自己の個人情報の開示、訂正、追加、削除、利用停止等を求めることができます。</p>
        <p>2. 上記請求は、第 10 条記載のお問合せ窓口までご連絡ください。本人確認後、速やかに対応いたします。</p>
      </Section>

      <Section n="第 9 条" title="プライバシーポリシーの変更">
        <p>当方は、必要に応じて本ポリシーを変更することがあります。変更後のポリシーは、本サービス上に掲示された時点から効力を生じるものとします。</p>
      </Section>

      <Section n="第 10 条" title="お問合せ窓口">
        <p>個人情報の取扱いに関するお問合せ、苦情、開示等のご請求は下記窓口までお願いします。</p>
        <div className="mt-3 p-4 bg-stone-50 border border-stone-200 rounded">
          <div className="text-[12px] text-stone-500 mb-1">個人情報お問合せ窓口</div>
          <div className="text-[13.5px] text-stone-900">shibahara.724@gmail.com</div>
        </div>
      </Section>

      <p className="mt-12 text-[12px] text-stone-500 tracking-wide">制定: 2026 年 5 月 25 日</p>
    </>
  );
}
