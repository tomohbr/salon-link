# ⏭️ ローンチ後 → 拡張までの「次の一手」

Phase 1〜5 + Phase 3 (営業マテリアル) は完了。
ここからは **「ユーザー側で 10〜30 分の作業」** が必要なステップを、優先順位とともに整理。

## 🥇 最優先 (ローンチ品質を完成させる)

### A. 特商法の事業者情報を埋める ← 5 分

`src/app/legal/tokushoho/page.tsx` の以下 4 箇所:

```
販売事業者     〔事業者名〕         ← 個人事業主なら屋号 or 本名
運営責任者     〔代表者氏名〕       ← 本名
所在地         〔住所〕             ← 自宅住所 or バーチャルオフィス
電話番号       〔電話番号〕         ← 公開用、転送可
```

**プライバシー重視で住所を公開したくない場合**:
- 「請求があれば遅滞なく開示する」と記載する形で合法 (消費者庁ガイドライン)
- またはバーチャルオフィス取得 (月 ¥1,000〜)

NSL も同様に `salon-link/src/app/legal/tokushoho/page.tsx` を書換え。

→ 「氏名・屋号・住所方針 (公開 or 開示請求対応)・電話番号」を教えてもらえれば、私が両アプリ一気に書換可能。

---

## 🥈 営業を加速する (収益化に直結)

### B. Stripe 本番化 ← 15 分 (ブラウザサポート可)

#### Step 1: Stripe アカウント作成
1. https://dashboard.stripe.com/register
2. メアド (運営用) でサインアップ
3. ビジネス情報入力 (法人/個人事業主、業種、銀行口座)
4. 本人確認書類アップロード (運転免許証 / マイナンバーカード)
5. 審査通過まで通常 1〜3 営業日

#### Step 2: 本番 API キー取得
1. 左上 「テストモード」スイッチ → OFF (本番モードへ)
2. **Developers → API keys**
3. **Publishable key** をコピー: `pk_live_...`
4. **Secret key** を「Reveal」してコピー: `sk_live_...`

#### Step 3: Webhook 設定
1. **Developers → Webhooks → Add endpoint**
2. URL: `https://salon-link-web-production.up.railway.app/api/stripe/webhook`
3. Events: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`, `invoice.payment_failed`
4. **Signing secret** をコピー: `whsec_...`

#### Step 4: 商品 (Product) 作成 ← Stripe ダッシュボードで
- Standard プラン: ¥4,980 / 月 (税別)
- Pro プラン: ¥9,980 / 月 (税別)
- 各プランの **Price ID** (`price_...`) をメモ

#### Step 5: Railway に環境変数追加
HSL の Railway → Variables → Raw Editor で追記:

```
STRIPE_SECRET_KEY="sk_live_..."
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_live_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
STRIPE_PRICE_STANDARD="price_..."
STRIPE_PRICE_PRO="price_..."
```

NSL も同様 (別 Stripe アカウント / 同じアカウント内で別商品どちらでも可)。

#### Step 6: テスト
1. 本番 LP → 新規登録 → Standard プラン選択
2. **テストカード `4242 4242 4242 4242`** で決済テスト → Stripe 側で「成功」になることを確認
3. 本物のカードでも 1 度動作確認 (返金可能)

→ 「Stripe 登録始める」と言えば、ブラウザで一緒に進めます。

---

## 🥉 配信品質を上げる (本格営業の前提)

### C. 独自ドメイン取得 → Resend ドメイン認証 ← 30 分 + 待ち時間

#### 現状の制約

- `EMAIL_FROM = "SalonLink <onboarding@resend.dev>"` で送信中
- これは **Resend サンドボックス** → 自分のメアド以外には送信できない
- 営業メールを大規模に送るには **独自ドメイン認証** が必要

#### Step 1: ドメイン取得 (10 分)
- Cloudflare Registrar で `hair-salon-link.app` 取得 (年 ~$12)
- または既に持ってる別のドメインを使う

#### Step 2: Cloudflare にドメイン登録 (Cloudflare Registrar 取得の場合は自動済)

#### Step 3: Resend にドメイン追加
1. https://resend.com/domains → Add Domain
2. `hair-salon-link.app` を入力
3. Resend が表示する DNS レコード (DKIM x3 / SPF / MX) を Cloudflare にコピペ
4. Verify → 待つ (1〜30 分で完了)

#### Step 4: Railway 環境変数を切替
```
EMAIL_FROM="SalonLink <hello@hair-salon-link.app>"
```

→ これで任意のメアドに営業メール送信可能、配信成功率 95%+ に。

### D. HPB 即時連携 (Cloudflare Email Workers) ← 30 分

ドメイン取得後にやれる。詳細は `cloudflare/email-worker/README.md` (運営側 8 ステップ)。
営業上の最大の差別化武器、サロンの導入意欲が大きく上がる。

---

## 📈 売上に直結する (営業の実行)

### E. 営業初動 ・ 最初の 10 件

#### Step 1: リサーチ (60 分)
- `sales/target-list/README.md` の手順で HPB 検索 → リストアップ
- 熊本市 / 福岡市 / 鹿児島市など、近場から開始
- `sales/target-list/target-list-template.csv` に 10 件記録

#### Step 2: 初回メール送付 (火・水・木 9:30〜)
- `sales/email-templates/01-cold-hpb-salon.md` のテンプレを使用
- **1 通ずつ手動**で店舗名・代表者名を差し込む
- Gmail から送付 (1 日 10 通まで Gmail で十分)

#### Step 3: フォローアップ管理
- 1 週反応なし → 02-followup
- 2 週反応なし → 03-final-touch
- 返信あり → 04-demo-invite

→ ターゲットリストを 5 件くらい一緒にリサーチしましょうか? 既存の導入店舗を見本にすれば 5 件 30 分で揃います。

---

## 📍 既知の小ネタ修正 (任意・優先度低)

### F. 営業資料 PDF を Resend 添付対応

現状 `sales/output/SalonLink_概要資料_v1.pptx` (PPT)。
PowerPoint で開いて PDF エクスポートして `sales/output/...v1.pdf` 配置。
あとは Resend 経由でも添付できる仕組みを `sendMail` ラッパに追加可能。

### G. NSL 用 A4 営業資料

現状 HSL 用のみ。NSL は色・文面を変えて同じ build スクリプトで生成可能。15 分でできる。

### H. /api/health のレスポンス整合性

HSL は `{"status": "healthy"}` / NSL は `{"status": "ok"}` で形式が違う。監視ツール導入時に統一推奨。10 分で整合可。

---

## 🎯 推奨ロードマップ

```
今日             A (特商法埋め)                   → 法的に万全
                 E の 5 件リサーチ                 → 営業の最初の一歩
今週中           B (Stripe 本番化)                → 課金開始
                 営業初回メール 10 通送付          → 反応待ち
2 週間以内       C (独自ドメイン + Resend 認証)    → 配信品質
                 D (HPB 即時連携)                  → 差別化完成
1 ヶ月後         G / H など小ネタ                 → 整える
```

## いま、次にやってほしいことを教えてください

- **A**: 事業者情報を貰って書換
- **B**: Stripe 始める (ブラウザサポート)
- **C/D**: ドメインから始める
- **E**: 営業ターゲット 5〜10 件のリサーチを一緒に
- **F/G/H**: 小ネタ整理
- **その他**: 自由記述
