// CSV エクスポートユーティリティ
// Excel / Google Sheets で文字化けしないよう UTF-8 BOM 付き。

/** 値を CSV フィールドにエスケープ */
function escapeCell(v: unknown): string {
  if (v == null) return '';
  const s = String(v);
  if (/[",\n\r]/.test(s)) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

/** 配列データを CSV 文字列に変換 (UTF-8 BOM 付き) */
export function toCsv<T extends Record<string, unknown>>(
  headers: Array<{ key: keyof T & string; label: string }>,
  rows: T[]
): string {
  const BOM = '\uFEFF';
  const headerLine = headers.map((h) => escapeCell(h.label)).join(',');
  const lines = rows.map((row) => headers.map((h) => escapeCell(row[h.key])).join(','));
  return BOM + [headerLine, ...lines].join('\r\n');
}

/** ダウンロード用 Response を返す (API Route から使う) */
export function csvResponse(csv: string, filename: string): Response {
  return new Response(csv, {
    status: 200,
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="${encodeURIComponent(filename)}"; filename*=UTF-8''${encodeURIComponent(filename)}`,
      'Cache-Control': 'no-store',
    },
  });
}
