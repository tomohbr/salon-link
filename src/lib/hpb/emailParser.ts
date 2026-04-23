// HPB 予約通知メールパーサ (ネイルカテゴリ対応)
// ホットペッパービューティー からの「新規予約確定 / 変更 / キャンセル」メール本文を
// 正規表現で抽出する。Zapier などで転送されたメール本文を受け取る想定。
//
// 同じメールを何度受けても冪等になるよう externalId (HPB 予約番号) を必ず抽出する。

export type ParsedHpbEventType = 'new' | 'update' | 'cancel' | 'unknown';

export interface ParsedHpbBooking {
  eventType: ParsedHpbEventType;
  externalId: string | null;   // HPB 予約番号 (例 "HB12345678")
  customerName: string | null;
  customerNameKana: string | null;
  phone: string | null;
  email: string | null;
  date: string | null;         // YYYY-MM-DD
  startTime: string | null;    // HH:MM
  endTime: string | null;      // HH:MM
  menuName: string | null;
  price: number | null;
  staffName: string | null;
  raw: string;
}

function extract(pattern: RegExp, src: string): string | null {
  const m = src.match(pattern);
  return m ? m[1].trim() : null;
}

function normalizeDate(s: string | null): string | null {
  if (!s) return null;
  // "2026/04/22" / "2026年4月22日" / "2026-04-22"
  const m = s.match(/(\d{4})[\/\-年](\d{1,2})[\/\-月](\d{1,2})/);
  if (!m) return null;
  return `${m[1]}-${m[2].padStart(2, '0')}-${m[3].padStart(2, '0')}`;
}

function normalizeTime(s: string | null): string | null {
  if (!s) return null;
  const m = s.match(/(\d{1,2})[:時](\d{1,2})/);
  if (!m) return null;
  return `${m[1].padStart(2, '0')}:${m[2].padStart(2, '0')}`;
}

function normalizePrice(s: string | null): number | null {
  if (!s) return null;
  const n = parseInt(s.replace(/[¥,円\s]/g, ''), 10);
  return isNaN(n) ? null : n;
}

function detectEventType(raw: string): ParsedHpbEventType {
  // 件名・本文から判定
  if (/キャンセル|取り消し|お取消/i.test(raw)) return 'cancel';
  if (/変更|予約を変更|変更のお知らせ/i.test(raw)) return 'update';
  if (/予約確定|ご予約確定|予約完了|ご予約のご案内/i.test(raw)) return 'new';
  if (/ご予約/i.test(raw)) return 'new';
  return 'unknown';
}

/** 1通分のメール本文をパースする */
export function parseHpbEmail(raw: string): ParsedHpbBooking[] {
  if (!raw) return [];

  // 複数予約が1通に入っている可能性は低いが、区切りで分割できるようにする
  const blocks = raw.split(/(?=予約番号[:：]|ご予約番号[:：]|HB-?\d{6,})/);
  const results: ParsedHpbBooking[] = [];

  for (const block of blocks) {
    // 予約番号が無いブロックはスキップ
    let externalId =
      extract(/予約番号[:：]\s*([A-Z0-9\-]+)/i, block) ||
      extract(/ご予約番号[:：]\s*([A-Z0-9\-]+)/i, block) ||
      extract(/(HB[-]?\d{6,})/i, block);

    // block にないがメール全体にはあるケース
    if (!externalId) {
      externalId =
        extract(/予約番号[:：]\s*([A-Z0-9\-]+)/i, raw) ||
        extract(/ご予約番号[:：]\s*([A-Z0-9\-]+)/i, raw) ||
        extract(/(HB[-]?\d{6,})/i, raw);
    }
    if (!externalId && results.length > 0) continue; // 重複

    const dateStr =
      extract(/ご来店[日時]*[:：]\s*(\d{4}[\/\-年]\s*\d{1,2}[\/\-月]\s*\d{1,2})/, block) ||
      extract(/(\d{4}[\/\-年]\s*\d{1,2}[\/\-月]\s*\d{1,2})日?\s*\([月火水木金土日]\)/, block) ||
      extract(/(\d{4}[\/\-年]\s*\d{1,2}[\/\-月]\s*\d{1,2})/, block);

    const timeRange =
      block.match(/(\d{1,2}[:時]\d{1,2})\s*[~〜\-–]\s*(\d{1,2}[:時]\d{1,2})/);
    const startTimeStr = timeRange ? timeRange[1] : extract(/開始時[刻間][:：]\s*(\d{1,2}[:時]\d{1,2})/, block);
    const endTimeStr = timeRange ? timeRange[2] : extract(/終了時[刻間][:：]\s*(\d{1,2}[:時]\d{1,2})/, block);

    const customerName =
      extract(/(?:お|ご)?(?:客様|予約者|お名前)[:：\s]+([^\n\r]+?)(?:\s*様|\n|\r)/, block) ||
      extract(/(?:お|ご)?(?:客様|予約者|お名前)[:：\s]+([^\n\r]+)/, block);

    const customerNameKana = extract(/フリガナ[:：]\s*([^\n\r]+)/, block);
    const phone = extract(/(?:電話|TEL|T E L)[:：\s]*([\d\-]{10,15})/, block);
    const email = extract(/([A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,})/, block);

    const menuName =
      extract(/(?:メニュー|施術メニュー|ご予約内容)[:：]\s*([^\n\r]+)/, block) ||
      extract(/(?:メニュー|施術メニュー)[:：]\s*([^\n\r]+)/, raw);

    const priceStr =
      extract(/(?:料金|金額|税込金額|合計)[:：]\s*([¥\d,円\s]+)/, block);

    const staffName = extract(/(?:指名|スタッフ|ネイリスト)[:：]\s*([^\n\r]+?)(?:\s*様|\n|\r)/, block);

    results.push({
      eventType: detectEventType(raw),
      externalId: externalId || null,
      customerName: customerName?.replace(/[様さん]$/, '').trim() || null,
      customerNameKana,
      phone: phone?.replace(/[^\d]/g, '').replace(/^(\d{2,4})(\d{4})(\d{4})$/, '$1-$2-$3') || null,
      email,
      date: normalizeDate(dateStr),
      startTime: normalizeTime(startTimeStr),
      endTime: normalizeTime(endTimeStr),
      menuName: menuName?.trim() || null,
      price: normalizePrice(priceStr),
      staffName: staffName?.trim() || null,
      raw: block,
    });
  }

  // 結果なしの場合でも raw 全体から 1 件取ってみる
  if (results.length === 0) {
    const externalId =
      extract(/予約番号[:：]\s*([A-Z0-9\-]+)/i, raw) ||
      extract(/(HB[-]?\d{6,})/i, raw);
    if (externalId) {
      const dateStr = extract(/(\d{4}[\/\-年]\s*\d{1,2}[\/\-月]\s*\d{1,2})/, raw);
      const tr = raw.match(/(\d{1,2}[:時]\d{1,2})\s*[~〜\-–]\s*(\d{1,2}[:時]\d{1,2})/);
      return [
        {
          eventType: detectEventType(raw),
          externalId,
          customerName: extract(/(?:お|ご)?(?:客様|予約者|お名前)[:：\s]+([^\n\r]+?)(?:\s*様|\n|\r)/, raw) || null,
          customerNameKana: null,
          phone: null,
          email: null,
          date: normalizeDate(dateStr),
          startTime: tr ? normalizeTime(tr[1]) : null,
          endTime: tr ? normalizeTime(tr[2]) : null,
          menuName: extract(/(?:メニュー|施術メニュー)[:：]\s*([^\n\r]+)/, raw),
          price: normalizePrice(extract(/(?:料金|金額|税込金額)[:：]\s*([¥\d,円\s]+)/, raw)),
          staffName: extract(/(?:指名|スタッフ|ネイリスト)[:：]\s*([^\n\r]+?)(?:\s*様|\n|\r)/, raw),
          raw,
        },
      ];
    }
  }

  return results.filter((r) => r.externalId);
}
