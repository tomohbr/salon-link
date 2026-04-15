// SalonBoard CSV取込パーサー
//
// SalonBoardの顧客CSV・予約CSVは店舗ごとに微妙にフォーマットが異なるため、
// ヘッダー名のマッチングで柔軟に取り込む。
//
// 対応カラム名 (いずれかがあれば認識):
//   日付        : 予約日 / 来店日 / 日付 / date
//   時間        : 予約時間 / 開始時間 / 時間 / time / start_time
//   顧客名      : 顧客名 / お客様名 / 氏名 / name
//   電話番号    : 電話番号 / 電話 / TEL / phone / tel
//   メニュー    : メニュー / メニュー名 / menu / 施術内容
//   金額        : 金額 / 料金 / 税込金額 / price / amount
//   所要時間    : 所要時間 / 施術時間 / duration / duration_minutes

type Row = Record<string, string>;

const COL_ALIASES: Record<string, string[]> = {
  date: ['日付', '予約日', '来店日', 'date', '年月日'],
  time: ['時間', '予約時間', '開始時間', '時刻', 'time', 'start_time', '開始'],
  customerName: ['顧客名', 'お客様名', '氏名', '名前', 'name', 'customer_name'],
  phone: ['電話番号', '電話', 'TEL', 'tel', 'phone'],
  menuName: ['メニュー', 'メニュー名', 'menu', '施術内容', '施術メニュー'],
  price: ['金額', '料金', '税込金額', 'price', 'amount', '合計金額'],
  duration: ['所要時間', '施術時間', 'duration', 'duration_minutes', '時間(分)'],
};

/**
 * CSV文字列をパースして行オブジェクト配列を返す
 * SalonBoardのCSVはShift-JISで出力されるが、本関数はUTF-8デコード済み前提
 */
export function parseCSV(text: string): Row[] {
  // BOM除去
  text = text.replace(/^\uFEFF/, '').trim();
  if (!text) return [];

  const lines = splitCSVLines(text);
  if (lines.length === 0) return [];

  const headers = parseCSVLine(lines[0]);
  const rows: Row[] = [];
  for (let i = 1; i < lines.length; i++) {
    if (!lines[i].trim()) continue;
    const cells = parseCSVLine(lines[i]);
    const row: Row = {};
    headers.forEach((h, idx) => {
      row[h.trim()] = (cells[idx] ?? '').trim();
    });
    rows.push(row);
  }
  return rows;
}

function splitCSVLines(text: string): string[] {
  const lines: string[] = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (ch === '"') {
      if (inQuotes && text[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
        current += ch;
      }
    } else if ((ch === '\n' || ch === '\r') && !inQuotes) {
      if (current) lines.push(current);
      current = '';
      if (ch === '\r' && text[i + 1] === '\n') i++;
    } else {
      current += ch;
    }
  }
  if (current) lines.push(current);
  return lines;
}

function parseCSVLine(line: string): string[] {
  const out: string[] = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (ch === ',' && !inQuotes) {
      out.push(current);
      current = '';
    } else {
      current += ch;
    }
  }
  out.push(current);
  return out;
}

function pickColumn(row: Row, key: keyof typeof COL_ALIASES): string {
  const aliases = COL_ALIASES[key];
  for (const alias of aliases) {
    for (const k of Object.keys(row)) {
      if (k.toLowerCase() === alias.toLowerCase() || k.includes(alias)) {
        return row[k];
      }
    }
  }
  return '';
}

/**
 * 日付文字列を YYYY-MM-DD に正規化
 * 入力例: "2026/04/20", "2026-04-20", "2026年4月20日", "04/20"
 */
export function normalizeDate(s: string): string | null {
  if (!s) return null;
  s = s.trim();

  // 2026/04/20 or 2026-04-20
  let m = s.match(/^(\d{4})[\/\-年](\d{1,2})[\/\-月](\d{1,2})/);
  if (m) {
    return `${m[1]}-${m[2].padStart(2, '0')}-${m[3].padStart(2, '0')}`;
  }

  // 04/20 (assume current year)
  m = s.match(/^(\d{1,2})[\/\-](\d{1,2})$/);
  if (m) {
    const year = new Date().getFullYear();
    return `${year}-${m[1].padStart(2, '0')}-${m[2].padStart(2, '0')}`;
  }

  return null;
}

/**
 * 時刻を HH:MM に正規化
 * 入力例: "14:30", "14時30分", "1430", "14:30-15:30" (開始のみ抽出)
 */
export function normalizeTime(s: string): string | null {
  if (!s) return null;
  s = s.trim();

  let m = s.match(/^(\d{1,2})[:\s時](\d{1,2})/);
  if (m) {
    return `${m[1].padStart(2, '0')}:${m[2].padStart(2, '0')}`;
  }
  m = s.match(/^(\d{2})(\d{2})$/);
  if (m) {
    return `${m[1]}:${m[2]}`;
  }
  return null;
}

/**
 * 金額を数値に正規化
 * 入力例: "6,600", "¥6600", "6600円", "6600"
 */
export function normalizePrice(s: string): number {
  if (!s) return 0;
  const num = s.replace(/[¥,円\s]/g, '');
  const n = parseInt(num, 10);
  return isNaN(n) ? 0 : n;
}

export interface ImportedRow {
  date: string;
  startTime: string;
  customerName: string;
  phone: string;
  menuName: string;
  price: number;
  duration: number;
  rawRow: Row;
}

export interface ImportResult {
  imported: ImportedRow[];
  skipped: Array<{ row: Row; reason: string }>;
}

export function parseHpbCsv(text: string): ImportResult {
  const rows = parseCSV(text);
  const imported: ImportedRow[] = [];
  const skipped: Array<{ row: Row; reason: string }> = [];

  for (const row of rows) {
    const dateStr = pickColumn(row, 'date');
    const timeStr = pickColumn(row, 'time');
    const customerName = pickColumn(row, 'customerName');
    const phone = pickColumn(row, 'phone');
    const menuName = pickColumn(row, 'menuName');
    const priceStr = pickColumn(row, 'price');
    const durationStr = pickColumn(row, 'duration');

    const date = normalizeDate(dateStr);
    const startTime = normalizeTime(timeStr);

    if (!date) {
      skipped.push({ row, reason: `日付を認識できません: "${dateStr}"` });
      continue;
    }
    if (!startTime) {
      skipped.push({ row, reason: `時刻を認識できません: "${timeStr}"` });
      continue;
    }
    if (!customerName) {
      skipped.push({ row, reason: '顧客名が空です' });
      continue;
    }

    imported.push({
      date,
      startTime,
      customerName,
      phone: phone || '',
      menuName: menuName || '（メニュー未指定）',
      price: normalizePrice(priceStr),
      duration: parseInt(durationStr, 10) || 60,
      rawRow: row,
    });
  }

  return { imported, skipped };
}
