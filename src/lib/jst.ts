// Railway は UTC で動作するため、日付境界は必ず JST で計算する。
// toISOString() を日付操作に使うと UTC+9 で日またぎ事故が起きる。

const TZ = 'Asia/Tokyo';
const FORMATTER = new Intl.DateTimeFormat('en-CA', {
  timeZone: TZ,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
});

/** JST 基準の YYYY-MM-DD を返す */
export function jstDate(d: Date = new Date()): string {
  return FORMATTER.format(d); // en-CA は YYYY-MM-DD 形式
}

/** JST 基準の「当月1日」と「次月1日」の Date を返す (UTC Date オブジェクト) */
export function getJstMonthBounds(ref: Date = new Date()): { start: Date; end: Date; startStr: string; endStr: string } {
  const ymd = jstDate(ref); // "2026-04-15"
  const [y, m] = ymd.split('-').map(Number);
  // JST の 00:00 は UTC では前日の 15:00 (UTC+9) → JST 00:00 = UTC-9h
  // 直接 JST 付きの ISO にして Date で解釈させる
  const startStr = `${y}-${String(m).padStart(2, '0')}-01`;
  const nextY = m === 12 ? y + 1 : y;
  const nextM = m === 12 ? 1 : m + 1;
  const endStr = `${nextY}-${String(nextM).padStart(2, '0')}-01`;
  return {
    start: new Date(`${startStr}T00:00:00+09:00`),
    end: new Date(`${endStr}T00:00:00+09:00`),
    startStr,
    endStr,
  };
}

/** 任意日付の JST 0:00 〜 翌日 0:00 */
export function getJstDayBounds(ymd: string): { start: Date; end: Date } {
  const start = new Date(`${ymd}T00:00:00+09:00`);
  const end = new Date(start.getTime() + 24 * 60 * 60 * 1000);
  return { start, end };
}

/** 当月の各日を YYYY-MM-DD で返す */
export function listMonthDays(ref: Date = new Date()): string[] {
  const { start, end } = getJstMonthBounds(ref);
  const days: string[] = [];
  for (let d = new Date(start); d < end; d.setDate(d.getDate() + 1)) {
    days.push(jstDate(d));
  }
  return days;
}

/** YYYY-MM-DD → "4/15(火)" 等 */
export function fmtJstShort(ymd: string): string {
  const d = new Date(`${ymd}T00:00:00+09:00`);
  const dow = ['日', '月', '火', '水', '木', '金', '土'][d.getDay()];
  return `${d.getMonth() + 1}/${d.getDate()}(${dow})`;
}
