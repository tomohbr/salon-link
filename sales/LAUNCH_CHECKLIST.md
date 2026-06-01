# 🚀 ローンチ前チェックリスト ・ 総点検レポート

実施日: 2026 年 5 月 25 日 (UTC) / 2026 年 5 月 26 日 (JST)
点検者: 私 (自動 + ヒアリングなし、本番 HTTP / API レベルで確認)

---

## ✅ 完了項目

### 1. URL 疎通

| App | パス | Status | 備考 |
|---|---|---|---|
| HSL | `/` | 200 | LP |
| HSL | `/register` | 200 | 新規登録 |
| HSL | `/login` | 200 | ログイン |
| HSL | `/legal/terms` | 200 | 利用規約 |
| HSL | `/legal/privacy` | 200 | プライバシーポリシー |
| HSL | `/legal/tokushoho` | 200 | 特商法表記 |
| HSL | `/book/hair-salon-demo` | 200 | サンプル予約 |
| HSL | `/book/salon-ad76iza2-q47p` | 200 | marici 予約 |
| HSL | `/api/inquiry` (POST) | 200 / 400 / 429 | 正常、レート制限あり |
| HSL | `/robots.txt` | 200 | |
| HSL | `/sitemap.xml` | 200 | |
| NSL | `/` | 200 | LP |
| NSL | `/register` | 200 | |
| NSL | `/login` | 200 | |
| NSL | `/legal/*` | 200 (3 ページ) | |

### 2. 問合せフォーム実通信テスト

- POST /api/inquiry に空ボディ → **400 `{"error":"必須項目が不足しています"}`** 期待通り
- POST /api/inquiry に正常データ → **200 `{"ok":true}`** Resend API 到達確認
- レート制限: **1 IP につき 3 件 / 5 分** で 4 回目以降 429 ✅

### 3. 法務ページ実体

- `/legal/tokushoho` に「特定商取引」「販売事業者」「お問合せ窓口」のキーワード存在確認 ✅

### 4. SEO

- robots.txt 配信中
- sitemap.xml 配信中
- OG (og:title / og:description / og:url) 正常出力

### 5. TypeScript

- HSL: `npx tsc --noEmit` ✅ パス (エラー 0)
- NSL: `npx tsc --noEmit` ✅ パス (エラー 0)

---

## 🔧 今回修正した項目

### セキュリティヘッダ ・ 全面追加

ローンチ前点検で **HSTS / X-Frame-Options / X-Content-Type-Options / Referrer-Policy / Permissions-Policy** がゼロだったため、HSL/NSL 両方の `next.config.ts` で全パスに付与:

```
Strict-Transport-Security: max-age=31536000; includeSubDomains
X-Frame-Options: SAMEORIGIN
X-Content-Type-Options: nosniff
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: camera=(), microphone=(), geolocation=(), payment=(self), interest-cohort=()
X-XSS-Protection: 0
```

これで **securityheaders.com の評価が D 〜 F から A** に上がる見込み。

---

## ⚠️ 既知の警告 (ローンチを止めはしないが将来対応)

| 項目 | 影響 | 対応案 |
|---|---|---|
| Resend が sandbox 状態 (onboarding@resend.dev) | 任意のメアドに送信不可、自分宛のみ可 | 独自ドメイン取得後に Resend で domain auth |
| Stripe が test mode | 課金が実通信しない | 本番キー取得後 Railway env 更新 |
| `/health` エンドポイント未実装 (404) | モニタリング監視に使えない | 30 分実装で追加可、ローンチに必須ではない |
| HPB 即時連携 (Cloudflare Worker) 未起動 | Zapier / 手動取込で代替中 | ドメイン取得後の Phase 6 で実装 |
| 特商法表記の事業者情報「〔〕」が未確定 | 個人情報を後で埋める前提で公開済 | 屋号 / 住所 / 電話番号確定したら即書換可 |

---

## 📋 ローンチ前にユーザー側で必要な最後の作業

### a. 特商法表記の事業者情報を埋める

`src/app/legal/tokushoho/page.tsx` の以下 4 箇所:

```
販売事業者     〔事業者名〕
運営責任者     〔代表者氏名〕
所在地         〔所在地〕  ← 「請求があれば遅滞なく開示」も可
電話番号       〔電話番号〕
```

### b. Stripe 本番キー (Phase 4)

- https://dashboard.stripe.com/ でアカウント作成
- API Keys ページから本番キー取得
- Railway に環境変数追加: `STRIPE_SECRET_KEY`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`, `STRIPE_WEBHOOK_SECRET`
- Stripe Webhook URL に `https://salon-link-web-production.up.railway.app/api/stripe/webhook` を登録

### c. (任意) 独自ドメイン取得 → Resend ドメイン認証

- `hair-salon-link.app` 等を取得
- Cloudflare 経由で Resend に DKIM 認証
- これで任意のメアドに送信可能になり、営業メールの配信成功率が大幅向上

---

## 結論

**現状で「営業を始めて問題ない」状態**:

- 機能面: ✅
- 法務面: ✅ (事業者情報は最終確認次第)
- セキュリティ面: ✅ (今回ヘッダ追加)
- メール面: ⚠️ 自分宛は OK / 他人宛は要ドメイン認証
- 課金面: ⚠️ Free プランのみで運用開始は可、有料プランは Stripe 本番化後

**営業初動 (Free プランで導入実績を作る)** は **今日からスタート可能**。
**有料プランでの本格営業** は Stripe 本番化後 (15 分作業)。
