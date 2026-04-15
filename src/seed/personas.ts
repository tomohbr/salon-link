// 100名ペルソナ定義 - ネイルサロンテストマーケティング用
import type { CustomerSource } from '@/types/database';

export interface Persona {
  name: string;
  name_kana: string;
  age: number;
  gender: '女性' | '男性';
  occupation: string;
  phone: string;
  email: string;
  source: CustomerSource;
  segment:
    | 'hpb_new_repeat' // HPB新規→リピート成功
    | 'hpb_new_churn' // HPB新規→離脱
    | 'hpb_new_dormant' // HPB新規→LINE登録→休眠
    | 'own_repeater' // 自社経由リピーター
    | 'line_heavy' // LINEヘビー
    | 'coupon_reactive' // クーポン反応層
    | 'vip'; // VIP
  line_registered: boolean;
  visit_count: number;
  avg_spend: number;
  preferred_menu: string;
  visit_interval_days: number;
  first_visit_days_ago: number;
  notes: string;
}

const FIRST_NAMES_F = ['結衣', '美咲', '花音', '葵', '陽菜', '莉子', '凛', '芽依', '心春', '楓', 'さくら', '愛子', '優奈', '真央', 'あかり', '菜々', '真帆', '杏奈', '美優', '咲良', '千夏', '理恵', '由香', '香織', '智美', '麻衣', '紗希', '里奈', '優子', '美穂'];
const LAST_NAMES = ['佐藤', '鈴木', '高橋', '田中', '伊藤', '渡辺', '山本', '中村', '小林', '加藤', '吉田', '山田', '斎藤', '松本', '井上', '木村', '林', '清水', '山崎', '森'];

const OCCUPATIONS = ['OL', '看護師', '美容師', '教員', '営業職', '事務職', '主婦', '学生', 'フリーランス', 'エステティシャン', 'アパレル販売員', '受付', 'デザイナー', 'エンジニア', '保育士'];
const MENUS = ['ワンカラー', 'フレンチネイル', 'グラデーション', 'アートネイル', 'ジェルオフ+ケア', 'ハンドケア', 'フットネイル', 'ニュアンスネイル', 'ビジューネイル', 'マグネットネイル'];

function rand<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}
function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function makeName(i: number) {
  const last = LAST_NAMES[i % LAST_NAMES.length];
  const first = FIRST_NAMES_F[i % FIRST_NAMES_F.length];
  return { name: `${last} ${first}`, kana: `${last}${first}` };
}

function makePersona(i: number, seg: Persona['segment']): Persona {
  const { name, kana } = makeName(i);
  const age = randInt(20, 45);
  const phone = `090-${randInt(1000, 9999)}-${randInt(1000, 9999)}`;
  const email = `persona${i}@example.com`;
  const menu = rand(MENUS);

  const profiles: Record<Persona['segment'], Partial<Persona>> = {
    hpb_new_repeat: {
      source: 'hotpepper',
      line_registered: true,
      visit_count: randInt(3, 8),
      avg_spend: randInt(6000, 10000),
      visit_interval_days: randInt(28, 42),
      first_visit_days_ago: randInt(90, 240),
      notes: 'HPB経由で来店→LINE登録後、自社予約でリピート',
    },
    hpb_new_churn: {
      source: 'hotpepper',
      line_registered: false,
      visit_count: 1,
      avg_spend: randInt(5000, 8000),
      visit_interval_days: 0,
      first_visit_days_ago: randInt(60, 180),
      notes: 'HPBで1回来店したのみ、LINE未登録',
    },
    hpb_new_dormant: {
      source: 'hotpepper',
      line_registered: true,
      visit_count: randInt(1, 2),
      avg_spend: randInt(5500, 8500),
      visit_interval_days: 0,
      first_visit_days_ago: randInt(120, 300),
      notes: 'HPB→LINE登録はしたが3ヶ月以上来店なし',
    },
    own_repeater: {
      source: rand(['instagram', 'referral', 'web'] as CustomerSource[]),
      line_registered: true,
      visit_count: randInt(4, 10),
      avg_spend: randInt(7000, 11000),
      visit_interval_days: randInt(28, 35),
      first_visit_days_ago: randInt(120, 365),
      notes: 'Instagram/紹介経由、高リピート率',
    },
    line_heavy: {
      source: 'line',
      line_registered: true,
      visit_count: randInt(6, 15),
      avg_spend: randInt(7500, 10000),
      visit_interval_days: randInt(21, 30),
      first_visit_days_ago: randInt(180, 400),
      notes: 'LINE予約フル活用、月1以上来店',
    },
    coupon_reactive: {
      source: rand(['hotpepper', 'line'] as CustomerSource[]),
      line_registered: true,
      visit_count: randInt(2, 5),
      avg_spend: randInt(5000, 7500),
      visit_interval_days: randInt(45, 90),
      first_visit_days_ago: randInt(120, 300),
      notes: 'クーポン配信に強く反応して予約',
    },
    vip: {
      source: rand(['referral', 'instagram'] as CustomerSource[]),
      line_registered: true,
      visit_count: randInt(12, 24),
      avg_spend: randInt(12000, 18000),
      visit_interval_days: randInt(14, 21),
      first_visit_days_ago: randInt(300, 600),
      notes: 'VIP顧客、高単価メニュー常連',
    },
  };

  return {
    name,
    name_kana: kana,
    age,
    gender: '女性',
    occupation: rand(OCCUPATIONS),
    phone,
    email,
    preferred_menu: menu,
    segment: seg,
    source: 'other',
    line_registered: false,
    visit_count: 1,
    avg_spend: 6000,
    visit_interval_days: 30,
    first_visit_days_ago: 60,
    notes: '',
    ...profiles[seg],
  } as Persona;
}

export function generatePersonas(): Persona[] {
  const personas: Persona[] = [];
  const segments: [Persona['segment'], number][] = [
    ['hpb_new_repeat', 25],
    ['hpb_new_churn', 20],
    ['hpb_new_dormant', 15],
    ['own_repeater', 15],
    ['line_heavy', 10],
    ['coupon_reactive', 10],
    ['vip', 5],
  ];
  let i = 0;
  for (const [seg, count] of segments) {
    for (let j = 0; j < count; j++) {
      personas.push(makePersona(i++, seg));
    }
  }
  return personas;
}
