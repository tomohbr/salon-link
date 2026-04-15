# SalonLink — ネイルサロン向け顧客囲い込みSaaS

ホットペッパービューティー依存から脱却し、自社集客 × LINE連携で顧客をリピーター化するためのSaaSアプリケーション。
月額 **¥3,980** の業界最安クラス。

## 実装済み機能

### 🔐 認証（3ロール）
- **SuperAdmin（SaaS運営者）**: 全店舗を管理する `/superadmin` 画面
- **Admin（店舗オーナー）**: 全機能アクセス可（ダッシュボード / 予約 / 顧客 / メニュー / クーポン / 配信 / デザイン / 分析 / 設定）
- **Staff（スタッフ）**: 予約 / 顧客 / カルテ / メニュー のみアクセス可
- JWT (jose) + bcrypt + HttpOnly Cookie セッション

### 💳 登録フロー（決済ゲート）
1. `/register` で店舗名・オーナー名・メール・パスワード・プラン選択
2. Stripe Checkout にリダイレクト（月額サブスクリプション）
3. 決済完了後、Webhook 経由で Salon が `active` 化
4. `/login` からログイン可能

※ Stripe キー未設定時は "demo mode" で動作し、決済をスキップして即 active 化

### 💾 データ永続化
- **PostgreSQL** (Railway managed) + **Prisma ORM**
- 全データが DB に保存されるため、コードを更新・再デプロイしてもデータは残存
- スキーマ更新は `prisma db push` で反映（破壊的変更時のみ migration 推奨）

### 🎯 差別化機能
- **HPB→自社移行率の可視化** — 他社にない独自KPI
- **セグメント別LINE配信** — 休眠・VIP・初回来店者など
- **デザインギャラリー** — ネイリー型のビジュアル訴求を管理SaaSに統合
- **離反リスクアラート** — 90日以上来店なしのLINE友だちを自動検知

## 🚀 Railway へのデプロイ

### 前提
- GitHub アカウント（リポジトリ作成済み）
- Railway アカウント（無料枠で開始可）
- （任意）Stripe テストキー

### 手順

1. **GitHub にプッシュ** (既に完了している場合はスキップ)
   ```bash
   cd salon-link
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/<your-user>/salon-link.git
   git push -u origin main
   ```

2. **Railway プロジェクト作成**
   - https://railway.com/new にアクセス
   - "Deploy from GitHub repo" を選択し、`salon-link` を選ぶ
   - Nixpacks が自動検出される（`nixpacks.toml` 同梱）

3. **PostgreSQL を追加**
   - Railway プロジェクト画面で "+ New" → "Database" → "PostgreSQL"
   - 追加するだけで `DATABASE_URL` が自動的に Next.js サービスに注入される

4. **環境変数を設定**（Variables タブ）
   ```
   DATABASE_URL               = (自動注入)
   SESSION_SECRET             = <openssl rand -base64 32 で生成>
   NEXT_PUBLIC_APP_URL        = https://<your-app>.up.railway.app
   # 以下は任意（Stripe 実決済時のみ）
   STRIPE_SECRET_KEY          = sk_test_...
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY = pk_test_...
   STRIPE_WEBHOOK_SECRET      = whsec_...
   # LINE（任意）
   LINE_CHANNEL_SECRET        = ...
   LINE_CHANNEL_ACCESS_TOKEN  = ...
   ```

5. **デプロイ**
   - Railway が自動で `npm run build` → `prisma db push` → `seed.ts` → `npm start` を実行
   - 初回のみ SuperAdmin・デモサロン・100ペルソナが自動投入される

6. **ドメイン生成**
   - Settings → Networking → "Generate Domain" をクリック
   - `https://<your-app>.up.railway.app` が払い出される

### 初期ログイン情報（seed 実行後）

| ロール | メール | パスワード | 画面 |
|---|---|---|---|
| SuperAdmin | `super@salonlink.demo` | `super1234` | `/superadmin` |
| 管理者 | `owner@salonlink.demo` | `owner1234` | `/dashboard` |
| スタッフ | `staff@salonlink.demo` | `staff1234` | `/dashboard` (権限制限) |

## 💳 Stripe 本番モードへの切替

現状 `STRIPE_SECRET_KEY` が未設定の「デモモード」で稼働しており、/register からの新規登録は決済なしで完了します。本番課金に切り替えるには Railway の環境変数に以下を追加し、再デプロイするだけです:

```bash
railway variables \
  --set "STRIPE_SECRET_KEY=sk_test_..." \
  --set "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_..." \
  --set "STRIPE_WEBHOOK_SECRET=whsec_..."
railway redeploy
```

その後 Stripe Dashboard で Webhook エンドポイントを `https://<your-domain>/api/stripe/webhook` に設定し、`checkout.session.completed` イベントを購読してください。

### 知り合いサロンを決済なしで登録する方法

本番モードに切替後でも、知り合いや特別な顧客を決済バイパスで登録できます:

1. SuperAdmin (`super@salonlink.demo`) でログイン
2. `/superadmin` 画面右上の「**+ 新規店舗を追加(決済スキップ)**」ボタンをクリック
3. 店舗名・オーナー名・メール・初期パスワード・プランを入力して作成
4. 作成完了後に表示される認証情報(Email/Password)を相手にお伝えする
5. 相手は通常の `/login` からログインして利用開始

この方法で作成された店舗は Stripe 決済を経由せず、`status=active` のまま発行されます。通常の `/register` ルートは Stripe 本番モード設定時は必ず決済を要求します。

## ローカル開発

```bash
# 1. Postgres を起動 (Docker等)
docker run -d -p 5432:5432 -e POSTGRES_PASSWORD=postgres --name salonlink-pg postgres:16

# 2. .env を作成
cp .env.example .env

# 3. DB スキーマ投入とシード
npx prisma db push
npm run db:seed

# 4. 開発サーバー
npm run dev  # → http://localhost:3000
```

## 技術スタック

| レイヤー | 技術 |
|---|---|
| Framework | Next.js 16 (App Router) + React 19 |
| Styling | Tailwind CSS v4 + shadcn/ui |
| Database | PostgreSQL (Railway) + Prisma 6 |
| Auth | jose (JWT) + bcryptjs |
| Payment | Stripe Checkout (subscription) |
| LINE | @line/bot-sdk + Messaging API |
| Deploy | Railway (Nixpacks) |

## 料金プラン

| プラン | 料金 | 対象 |
|---|---|---|
| Free | ¥0 | 顧客30名・月予約50件まで |
| **Light** | **¥3,980/月** | 顧客300名・予約無制限・LINE連携・クーポン・分析 |
| Standard | ¥7,980/月 | 顧客無制限・AI分析・デザインギャラリー |

競合（リピッテ ¥8,800・RE:RE ¥9,800・リザービア ¥21,000）より **¥5,000〜¥17,000/月 安価**。
