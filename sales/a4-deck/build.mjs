/**
 * SalonLink 営業資料 A4 PPT 生成
 *
 * 使い方:
 *   node sales/a4-deck/build.mjs
 *
 * 出力: sales/output/SalonLink_概要資料_v1.pptx
 *      (PowerPoint で開いて [ファイル → 名前を付けて保存] → PDF で書出すと添付用 PDF に)
 *
 * 設計方針:
 *  - A4 縦 (PowerPoint カスタムサイズ: 8.27 x 11.69 inch)
 *  - 2 ページ構成 (1: 価値訴求 / 2: 機能と料金)
 *  - ブランドカラー (茶 + ブラスゴールド) で本 LP との一貫性
 */

import pptxgen from 'pptxgenjs';

const P = new pptxgen();
P.defineLayout({ name: 'A4P', width: 8.27, height: 11.69 });
P.layout = 'A4P';

// ─── ブランドカラー ───
const C = {
  ink:      '1A1A1A',
  inkSoft:  '4A4A4A',
  paper:    'FAF5F0',
  paperAlt: 'F0E6E0',
  gold:     '633F5A',
  goldHi:   '8A6580',
  accent:   '2A1A26',
  line:     'D4C5CB',
};

// ─── 共通スタイル ───
const FONT = 'Yu Gothic';
const FONT_SERIF = 'Georgia';

/* ═══════════════════════════════════════════════
   Page 1: ヒーロー + 課題 + ソリューション
   ═══════════════════════════════════════════════ */
const s1 = P.addSlide();
s1.background = { color: C.paper };

// ヘッダ
s1.addText('SalonLink', {
  x: 0.4, y: 0.4, w: 4.0, h: 0.4,
  fontFace: FONT_SERIF, fontSize: 18, italic: true, color: C.ink,
});
s1.addText('FOR NAIL SALONS', {
  x: 0.4, y: 0.78, w: 4.0, h: 0.2,
  fontFace: FONT, fontSize: 8, color: C.gold, charSpacing: 32,
});
s1.addText('概要資料 v1.0', {
  x: 4.5, y: 0.4, w: 3.4, h: 0.3,
  fontFace: FONT, fontSize: 9, color: C.inkSoft, align: 'right',
  charSpacing: 12,
});

// 上の罫線
s1.addShape(P.ShapeType.line, {
  x: 0.4, y: 1.1, w: 7.5, h: 0,
  line: { color: C.line, width: 0.5 },
});

// メインタグライン
s1.addText([
  { text: '広告に依存しないお店へ、\n', options: { fontSize: 28, color: C.ink, fontFace: FONT_SERIF, italic: true, breakLine: true } },
  { text: '静かに切り替えていく。', options: { fontSize: 28, color: C.accent, fontFace: FONT_SERIF, italic: true } },
], {
  x: 0.4, y: 1.4, w: 7.5, h: 1.8,
  paraSpaceBefore: 4,
  valign: 'middle',
});

// リード文
s1.addText(
  'SalonLink は、HPB と併用しながら「リピート基盤」を整える、\nネイルサロン専用の顧客管理・予約一元化ツールです。',
  {
    x: 0.4, y: 3.2, w: 7.5, h: 0.9,
    fontFace: FONT, fontSize: 11, color: C.inkSoft, lineSpacingMultiple: 1.6,
  }
);

// 課題ブロック
s1.addText('Problem ・ よくあるお悩み', {
  x: 0.4, y: 4.3, w: 7.5, h: 0.3,
  fontFace: FONT, fontSize: 9, color: C.gold, charSpacing: 28, bold: true,
});

const problems = [
  '毎月の HPB 広告費が削れない',
  '新規は来るが、リピートに繋がらない',
  '紙カルテ・個人 LINE で情報が分散',
  'HPB ・ LINE ・ 自社の予約がダブルブッキング',
];
problems.forEach((p, i) => {
  s1.addText(`・ ${p}`, {
    x: 0.6, y: 4.7 + i * 0.32, w: 7.3, h: 0.28,
    fontFace: FONT, fontSize: 10.5, color: C.ink,
  });
});

// 解決ブロック (ハイライト)
s1.addShape(P.ShapeType.rect, {
  x: 0.4, y: 6.2, w: 7.5, h: 2.6,
  fill: { color: C.paperAlt },
  line: { color: C.line, width: 0.5 },
});

s1.addText('Solution ・ 私たちが整えるもの', {
  x: 0.6, y: 6.35, w: 7.1, h: 0.3,
  fontFace: FONT, fontSize: 9, color: C.accent, charSpacing: 28, bold: true,
});

const solutions = [
  ['01', 'HPB 予約メールを 30 秒以内に自社カレンダーへ自動同期', 'ダブルブッキング 0、予約衝突なし'],
  ['02', 'LINE 公式アカウントと予約 ・ カルテを 1 本に統合', '常連へのパーソナル配信が容易に'],
  ['03', 'ジェルカルテ・ネイリスト指名・休眠 90 日アラート', 'ネイルサロン業務にぴたりと合う設計'],
  ['04', 'HPB → 自社の転換率を独自 KPI で可視化', '広告費を「下げる判断」ができる'],
];

solutions.forEach(([n, t, d], i) => {
  const y = 6.85 + i * 0.48;
  s1.addText(n, {
    x: 0.6, y, w: 0.5, h: 0.4,
    fontFace: FONT_SERIF, italic: true, fontSize: 16, color: C.gold,
  });
  s1.addText(t, {
    x: 1.1, y, w: 6.8, h: 0.22,
    fontFace: FONT, fontSize: 10, color: C.ink, bold: true,
  });
  s1.addText('→ ' + d, {
    x: 1.1, y: y + 0.22, w: 6.8, h: 0.2,
    fontFace: FONT, fontSize: 9, color: C.inkSoft,
  });
});

// フッタ
s1.addShape(P.ShapeType.line, {
  x: 0.4, y: 11.1, w: 7.5, h: 0,
  line: { color: C.line, width: 0.5 },
});
s1.addText('Page 1 / 2 ・ SalonLink — for Hair Salons', {
  x: 0.4, y: 11.25, w: 7.5, h: 0.25,
  fontFace: FONT, fontSize: 7, color: C.inkSoft, align: 'left', charSpacing: 12,
});

/* ═══════════════════════════════════════════════
   Page 2: 機能一覧 + 料金 + コンタクト
   ═══════════════════════════════════════════════ */
const s2 = P.addSlide();
s2.background = { color: C.paper };

// ヘッダ
s2.addText('SalonLink', {
  x: 0.4, y: 0.4, w: 4.0, h: 0.4,
  fontFace: FONT_SERIF, italic: true, fontSize: 18, color: C.ink,
});
s2.addText('概要資料 v1.0', {
  x: 4.5, y: 0.4, w: 3.4, h: 0.3,
  fontFace: FONT, fontSize: 9, color: C.inkSoft, align: 'right',
});
s2.addShape(P.ShapeType.line, {
  x: 0.4, y: 1.1, w: 7.5, h: 0,
  line: { color: C.line, width: 0.5 },
});

// 機能一覧
s2.addText('Features ・ 主な機能', {
  x: 0.4, y: 1.3, w: 7.5, h: 0.3,
  fontFace: FONT, fontSize: 9, color: C.gold, charSpacing: 28, bold: true,
});

const features = [
  ['予約一元化', 'HPB / LINE / 自社 HP の予約を 1 カレンダーで管理。CSV 一括取込対応'],
  ['LINE 公式連携', '友だち登録 → 予約 → 配信を 1 本のフローに。前日リマインド自動'],
  ['ジェルカルテ', 'ジェル銘柄・色番・ベース/トップ・アレルギー・自爪の状態を記録'],
  ['指名管理 (5 階層)', 'トップ / シニア / スタンダード / ジュニア / アシスタント の指名料を自動計算'],
  ['HPB 自動同期', '予約メールを 30 秒以内に自社カレンダーへ反映 (専用 Webhook)'],
  ['離反予測 AI', '休眠 90 日超 ・ 来店頻度低下のお客様を抽出し、個別配信案を提案'],
  ['ホットペッパー転換率', 'HPB 新規 → LINE/自社リピートの割合を独自 KPI で可視化'],
  ['デザインギャラリー', 'ネイル作品を投稿 → お客様がそのまま指名予約に進める'],
];

features.forEach(([t, d], i) => {
  const row = Math.floor(i / 2);
  const col = i % 2;
  const x = 0.4 + col * 3.85;
  const y = 1.75 + row * 0.85;

  s2.addText(`● ${t}`, {
    x, y, w: 3.75, h: 0.28,
    fontFace: FONT, fontSize: 10, color: C.accent, bold: true,
  });
  s2.addText(d, {
    x, y: y + 0.28, w: 3.75, h: 0.5,
    fontFace: FONT, fontSize: 9, color: C.inkSoft, lineSpacingMultiple: 1.4,
  });
});

// 料金プラン
s2.addText('Pricing ・ 料金プラン', {
  x: 0.4, y: 5.4, w: 7.5, h: 0.3,
  fontFace: FONT, fontSize: 9, color: C.gold, charSpacing: 28, bold: true,
});

const plans = [
  { name: 'Free',     price: '¥0',     features: '個人 / 試験導入', detail: '顧客 30 名 ・ 月 50 予約', recommended: false },
  { name: 'Standard', price: '¥4,980', features: '個人〜小規模',    detail: '顧客 500 名 ・ LINE 連携 ・ カルテ', recommended: true },
  { name: 'Pro',      price: '¥9,980', features: '複数スタッフ',    detail: '顧客無制限 ・ AI 離反予測', recommended: false },
];

plans.forEach((p, i) => {
  const x = 0.4 + i * 2.55;
  const y = 5.85;
  const w = 2.4;
  const h = 1.8;

  s2.addShape(P.ShapeType.rect, {
    x, y, w, h,
    fill: { color: p.recommended ? C.ink : C.paperAlt },
    line: { color: p.recommended ? C.gold : C.line, width: p.recommended ? 1.5 : 0.5 },
  });

  if (p.recommended) {
    s2.addText('RECOMMENDED', {
      x, y: y - 0.16, w, h: 0.22,
      fontFace: FONT, fontSize: 7, color: C.goldHi,
      align: 'center', charSpacing: 24, bold: true,
    });
  }

  s2.addText(p.name, {
    x: x + 0.15, y: y + 0.15, w: w - 0.3, h: 0.3,
    fontFace: FONT_SERIF, fontSize: 14, italic: true,
    color: p.recommended ? C.paper : C.ink,
    align: 'center',
  });
  s2.addText(p.features, {
    x: x + 0.15, y: y + 0.5, w: w - 0.3, h: 0.2,
    fontFace: FONT, fontSize: 8,
    color: p.recommended ? '#AA9F88' : C.inkSoft,
    align: 'center', charSpacing: 8,
  });
  s2.addText([
    { text: p.price, options: { fontSize: 22, fontFace: FONT_SERIF, color: p.recommended ? C.goldHi : C.ink } },
    { text: ' /月 (税別)', options: { fontSize: 8, color: p.recommended ? '#AA9F88' : C.inkSoft } },
  ], {
    x: x + 0.15, y: y + 0.85, w: w - 0.3, h: 0.4,
    align: 'center',
  });
  s2.addText(p.detail, {
    x: x + 0.15, y: y + 1.3, w: w - 0.3, h: 0.4,
    fontFace: FONT, fontSize: 8,
    color: p.recommended ? '#CFC4AD' : C.inkSoft,
    align: 'center', lineSpacingMultiple: 1.4,
  });
});

// 注釈
s2.addText('※ 初期費用 ¥0 / 月単位で解約可能 / 解約後 30 日間 CSV ダウンロード可', {
  x: 0.4, y: 7.85, w: 7.5, h: 0.25,
  fontFace: FONT, fontSize: 8, color: C.inkSoft,
  align: 'center', italic: true,
});

// 導入の流れ
s2.addText('Onboarding ・ 導入の流れ (最短 30 分)', {
  x: 0.4, y: 8.4, w: 7.5, h: 0.3,
  fontFace: FONT, fontSize: 9, color: C.gold, charSpacing: 28, bold: true,
});

const steps = [
  ['01', 'アカウント作成', '無料、クレカ不要'],
  ['02', '店舗情報の入力', '営業時間 ・ メニュー'],
  ['03', 'HPB CSV を取込', '既存顧客が引継ぎ可'],
  ['04', 'LINE 公式を接続', 'Channel ID 入力のみ'],
];

steps.forEach(([n, t, d], i) => {
  const x = 0.4 + i * 1.9;
  const y = 8.85;
  s2.addShape(P.ShapeType.rect, {
    x, y, w: 1.8, h: 1.05,
    fill: { color: C.paperAlt },
    line: { color: C.line, width: 0.5 },
  });
  s2.addText(n, {
    x: x + 0.15, y: y + 0.1, w: 1.5, h: 0.3,
    fontFace: FONT_SERIF, italic: true, fontSize: 14, color: C.gold,
  });
  s2.addText(t, {
    x: x + 0.15, y: y + 0.45, w: 1.5, h: 0.25,
    fontFace: FONT, fontSize: 10, color: C.ink, bold: true,
  });
  s2.addText(d, {
    x: x + 0.15, y: y + 0.7, w: 1.5, h: 0.3,
    fontFace: FONT, fontSize: 8, color: C.inkSoft,
  });
});

// CTA + コンタクト
s2.addShape(P.ShapeType.rect, {
  x: 0.4, y: 10.15, w: 7.5, h: 0.85,
  fill: { color: C.ink },
});
s2.addText([
  { text: 'ご質問・デモのお申込みはこちらまで\n', options: { fontSize: 10, color: C.goldHi, charSpacing: 14, breakLine: true } },
  { text: 'shibahara.724@gmail.com   /   ', options: { fontSize: 12, color: C.paper, italic: true, fontFace: FONT_SERIF } },
  { text: 'https://salon-link-web-production.up.railway.app/', options: { fontSize: 11, color: C.goldHi } },
], {
  x: 0.5, y: 10.2, w: 7.3, h: 0.75,
  align: 'center', valign: 'middle',
});

// フッタ
s2.addText('Page 2 / 2 ・ © 2026 SalonLink', {
  x: 0.4, y: 11.25, w: 7.5, h: 0.25,
  fontFace: FONT, fontSize: 7, color: C.inkSoft, align: 'left', charSpacing: 12,
});

/* ═══════════════════════════════════════════════
   Write
   ═══════════════════════════════════════════════ */
const out = 'sales/output/SalonLink_概要資料_v1.pptx';
await P.writeFile({ fileName: out });
console.log('✅ generated:', out);
console.log('→ PowerPoint で開いて [ファイル → 名前を付けて保存] → PDF で書出して添付用 PDF に');
