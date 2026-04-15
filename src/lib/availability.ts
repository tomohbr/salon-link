// 空き枠エンジン - HPB・LINE・自社HPすべてが参照する単一の空き枠計算ロジック
// すべての予約は source (hotpepper/line/web) に関係なく同じ `reservations` テーブルに格納され、
// この関数がその全予約を参照して空き枠を算出する。
// → HPBで埋まった枠はLINE/自社HPでも「予約不可」と表示される。

import { prisma } from './db';

export type BusinessHoursMap = Record<string, { open: string; close: string; is_closed: boolean }>;

const DEFAULT_HOURS: BusinessHoursMap = {
  mon: { open: '10:00', close: '20:00', is_closed: false },
  tue: { open: '10:00', close: '20:00', is_closed: false },
  wed: { open: '10:00', close: '20:00', is_closed: true },
  thu: { open: '10:00', close: '20:00', is_closed: false },
  fri: { open: '10:00', close: '20:00', is_closed: false },
  sat: { open: '09:00', close: '19:00', is_closed: false },
  sun: { open: '09:00', close: '19:00', is_closed: false },
};

const DOW_KEYS = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'] as const;

export interface Slot {
  time: string; // "HH:MM"
  available: boolean;
  reason?: 'booked' | 'closed' | 'past';
  bookedBy?: { source: string; customerName: string | null };
}

export function parseBusinessHours(raw: unknown): BusinessHoursMap {
  if (!raw || typeof raw !== 'object') return DEFAULT_HOURS;
  const obj = raw as Record<string, unknown>;
  if (!obj.mon && !obj.sun) return DEFAULT_HOURS;
  return raw as BusinessHoursMap;
}

function toMinutes(hhmm: string): number {
  const [h, m] = hhmm.split(':').map(Number);
  return h * 60 + m;
}
function toHHMM(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

/**
 * 指定日の空き枠を算出する
 *
 * @param salonId     店舗ID
 * @param date        "YYYY-MM-DD"
 * @param durationMin 施術時間（分）
 * @param slotInterval 枠間隔（分） — デフォルト30分
 * @returns 全時間枠（予約済/空き/休業を含む）
 */
export async function getAvailableSlots(
  salonId: string,
  date: string,
  durationMin: number,
  slotInterval = 30
): Promise<Slot[]> {
  const salon = await prisma.salon.findUnique({
    where: { id: salonId },
    select: { businessHours: true },
  });
  if (!salon) return [];

  const hours = parseBusinessHours(salon.businessHours);
  const d = new Date(date + 'T00:00:00');
  const dowKey = DOW_KEYS[d.getDay()];
  const dayHours = hours[dowKey];

  if (!dayHours || dayHours.is_closed) {
    return [{ time: '--:--', available: false, reason: 'closed' }];
  }

  // 当日の全予約を取得（HPB/LINE/Web すべて）
  const reservations = await prisma.reservation.findMany({
    where: {
      salonId,
      date,
      status: { in: ['pending', 'confirmed', 'completed'] },
    },
    include: { customer: { select: { name: true } } },
  });

  const openMin = toMinutes(dayHours.open);
  const closeMin = toMinutes(dayHours.close);
  const nowMin = isToday(date) ? new Date().getHours() * 60 + new Date().getMinutes() : -1;

  const slots: Slot[] = [];
  for (let t = openMin; t + durationMin <= closeMin; t += slotInterval) {
    const slotEnd = t + durationMin;
    const time = toHHMM(t);

    // 過去枠
    if (nowMin >= 0 && t < nowMin) {
      slots.push({ time, available: false, reason: 'past' });
      continue;
    }

    // 他の予約と重複？
    const conflict = reservations.find((r) => {
      const rs = toMinutes(r.startTime);
      const re = toMinutes(r.endTime);
      return t < re && slotEnd > rs; // overlap
    });

    if (conflict) {
      slots.push({
        time,
        available: false,
        reason: 'booked',
        bookedBy: {
          source: conflict.source,
          customerName: conflict.customer?.name ?? null,
        },
      });
    } else {
      slots.push({ time, available: true });
    }
  }

  return slots;
}

function isToday(date: string): boolean {
  const today = new Date().toISOString().slice(0, 10);
  return date === today;
}

/**
 * 週の予約グリッド（管理画面の週カレンダー用）
 * 各日ごとに営業時間内のスロットと予約情報を返す
 */
export async function getWeekCalendar(salonId: string, startDate: string) {
  const salon = await prisma.salon.findUnique({
    where: { id: salonId },
    select: { businessHours: true },
  });
  const hours = parseBusinessHours(salon?.businessHours);

  const start = new Date(startDate + 'T00:00:00');
  const days: { date: string; dow: string; hours: { open: string; close: string; closed: boolean }; reservations: Array<{ id: string; startTime: string; endTime: string; menuName: string | null; source: string; customerName: string | null }> }[] = [];

  // 1週間分の予約をまとめて取得
  const dateStrs: string[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    dateStrs.push(d.toISOString().slice(0, 10));
  }

  const allRes = await prisma.reservation.findMany({
    where: {
      salonId,
      date: { in: dateStrs },
      status: { in: ['pending', 'confirmed', 'completed'] },
    },
    include: { customer: { select: { name: true } } },
    orderBy: [{ date: 'asc' }, { startTime: 'asc' }],
  });

  for (let i = 0; i < 7; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    const dateStr = d.toISOString().slice(0, 10);
    const dowKey = DOW_KEYS[d.getDay()];
    const dh = hours[dowKey];
    days.push({
      date: dateStr,
      dow: ['日', '月', '火', '水', '木', '金', '土'][d.getDay()],
      hours: { open: dh?.open ?? '10:00', close: dh?.close ?? '20:00', closed: dh?.is_closed ?? false },
      reservations: allRes
        .filter((r) => r.date === dateStr)
        .map((r) => ({
          id: r.id,
          startTime: r.startTime,
          endTime: r.endTime,
          menuName: r.menuName,
          source: r.source,
          customerName: r.customer?.name ?? null,
        })),
    });
  }
  return days;
}
