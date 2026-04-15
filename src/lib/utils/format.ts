export const yen = (n: number) => `¥${n.toLocaleString('ja-JP')}`;
export const pct = (n: number) => `${(n * 100).toFixed(1)}%`;
export const fmtDate = (d: string | Date) => {
  const date = typeof d === 'string' ? new Date(d) : d;
  return `${date.getFullYear()}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getDate().toString().padStart(2, '0')}`;
};
export const fmtDateTime = (d: string | Date) => {
  const date = typeof d === 'string' ? new Date(d) : d;
  return `${fmtDate(date)} ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
};
export const daysBetween = (a: Date, b: Date) =>
  Math.floor((b.getTime() - a.getTime()) / (1000 * 60 * 60 * 24));

export const sourceLabel = (source: string): string => {
  const map: Record<string, string> = {
    hotpepper: 'ホットペッパー',
    line: 'LINE',
    instagram: 'Instagram',
    referral: '紹介',
    walk_in: '飛び込み',
    web: '自社Web',
    other: 'その他',
    phone: '電話',
    manual: '手動',
  };
  return map[source] ?? source;
};

export const statusLabel = (status: string): string => {
  const map: Record<string, string> = {
    pending: '未確定',
    confirmed: '確定',
    completed: '完了',
    cancelled: 'キャンセル',
    no_show: '無断キャンセル',
  };
  return map[status] ?? status;
};
