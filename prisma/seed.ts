// Prisma seed: SuperAdmin + デモサロン + 100ペルソナ
// 実行: npx tsx prisma/seed.ts
// Idempotent: 既存データがあればスキップ

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { generatePersonas } from '../src/seed/personas';

const prisma = new PrismaClient();

function daysAgo(n: number) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().slice(0, 10);
}

async function main() {
  console.log('🌱 Seeding database...');

  // SuperAdmin
  const superEmail = 'super@salonlink.demo';
  let superUser = await prisma.user.findUnique({ where: { email: superEmail } });
  if (!superUser) {
    superUser = await prisma.user.create({
      data: {
        email: superEmail,
        passwordHash: await bcrypt.hash('super1234', 10),
        name: 'Super Admin',
        role: 'superadmin',
      },
    });
    console.log('✓ Created superadmin: super@salonlink.demo / super1234');
  }

  // Demo Salon (決済済み active 状態)
  let demoSalon = await prisma.salon.findUnique({ where: { slug: 'nail-salon-demo' } });
  if (demoSalon) {
    console.log('✓ Demo salon already exists, skipping seed');
    return;
  }

  demoSalon = await prisma.salon.create({
    data: {
      slug: 'nail-salon-demo',
      name: 'Nail Salon LUMIÈRE',
      ownerEmail: 'owner@salonlink.demo',
      address: '東京都渋谷区神宮前1-2-3 アートビル2F',
      phone: '03-1234-5678',
      description: '神宮前のプライベートネイルサロン。',
      plan: 'light',
      status: 'active',
    },
  });

  // Admin user
  await prisma.user.create({
    data: {
      email: 'owner@salonlink.demo',
      passwordHash: await bcrypt.hash('owner1234', 10),
      name: '佐藤 ゆかり',
      role: 'admin',
      salonId: demoSalon.id,
    },
  });
  console.log('✓ Created admin: owner@salonlink.demo / owner1234');

  // Staff user
  await prisma.user.create({
    data: {
      email: 'staff@salonlink.demo',
      passwordHash: await bcrypt.hash('staff1234', 10),
      name: '田中 まり',
      role: 'staff',
      salonId: demoSalon.id,
    },
  });
  console.log('✓ Created staff: staff@salonlink.demo / staff1234');

  // Staff records
  const staffRecords = await Promise.all([
    prisma.staff.create({ data: { salonId: demoSalon.id, name: '佐藤 ゆかり', role: 'オーナー', bio: 'JNA本部認定講師', sortOrder: 0 } }),
    prisma.staff.create({ data: { salonId: demoSalon.id, name: '田中 まり', role: 'スタイリスト', bio: 'ネイリスト検定1級', sortOrder: 1 } }),
    prisma.staff.create({ data: { salonId: demoSalon.id, name: '中村 あやか', role: 'アシスタント', bio: 'ケア・フット担当', sortOrder: 2 } }),
  ]);

  // Menus
  const menuData = [
    { name: 'ワンカラージェル', category: 'ジェル', price: 5500, durationMinutes: 60, description: 'シンプルで長持ち' },
    { name: 'フレンチネイル', category: 'ジェル', price: 6600, durationMinutes: 75, description: '定番の上品デザイン' },
    { name: 'ニュアンスアート', category: 'アート', price: 8800, durationMinutes: 90, description: 'トレンド感あるニュアンス' },
    { name: 'マグネットネイル', category: 'アート', price: 9900, durationMinutes: 90, description: '深みのあるマグネット' },
    { name: 'ビジューネイル', category: 'アート', price: 12100, durationMinutes: 120, description: '華やかな3Dアート' },
    { name: 'ジェルオフ+ケア', category: 'ケア', price: 3300, durationMinutes: 45, description: 'オフと甘皮ケア' },
    { name: 'フットネイル', category: 'フット', price: 7700, durationMinutes: 80, description: 'フットのワンカラー' },
  ];
  const menus = [];
  for (let i = 0; i < menuData.length; i++) {
    menus.push(await prisma.menu.create({ data: { ...menuData[i], salonId: demoSalon.id, sortOrder: i } }));
  }

  // 100 Personas
  const personas = generatePersonas();
  console.log(`✓ Generating ${personas.length} personas and reservations...`);
  for (let idx = 0; idx < personas.length; idx++) {
    const p = personas[idx];
    const firstVisit = daysAgo(p.first_visit_days_ago);
    const lastVisitDays = p.visit_count <= 1 ? p.first_visit_days_ago : Math.max(0, p.first_visit_days_ago - (p.visit_count - 1) * p.visit_interval_days);
    const lastVisit = daysAgo(lastVisitDays);
    const totalSpent = p.avg_spend * p.visit_count;

    const customer = await prisma.customer.create({
      data: {
        salonId: demoSalon.id,
        name: p.name,
        nameKana: p.name_kana,
        phone: p.phone,
        email: p.email,
        gender: p.gender,
        lineUserId: p.line_registered ? `U${Math.random().toString(36).slice(2, 12)}` : null,
        source: p.source,
        firstVisitDate: firstVisit,
        lastVisitDate: lastVisit,
        visitCount: p.visit_count,
        totalSpent,
        tags: [p.segment],
        notes: p.notes,
        isLineFriend: p.line_registered,
      },
    });

    for (let v = 0; v < p.visit_count; v++) {
      const visitDays = p.first_visit_days_ago - v * p.visit_interval_days;
      if (visitDays < 0) break;
      const visitDate = daysAgo(visitDays);
      const menu = menus[(idx + v) % menus.length];
      const staffId = staffRecords[v % staffRecords.length].id;
      const source = v === 0 ? (p.source === 'hotpepper' ? 'hotpepper' : 'web') : p.line_registered ? 'line' : 'web';

      const res = await prisma.reservation.create({
        data: {
          salonId: demoSalon.id,
          customerId: customer.id,
          staffId,
          menuId: menu.id,
          menuName: menu.name,
          menuPrice: menu.price,
          date: visitDate,
          startTime: `${10 + (idx % 8)}:00`,
          endTime: `${11 + (idx % 8)}:30`,
          status: 'completed',
          source,
          reminderSent: true,
        },
      });
      await prisma.treatmentRecord.create({
        data: {
          salonId: demoSalon.id,
          customerId: customer.id,
          staffId,
          reservationId: res.id,
          date: visitDate,
          menuName: menu.name,
          totalPrice: menu.price,
          durationMinutes: menu.durationMinutes,
          satisfactionScore: 4 + Math.floor(Math.random() * 2),
        },
      });
    }
  }

  // Future reservations
  const customers = await prisma.customer.findMany({ where: { salonId: demoSalon.id } });
  for (let i = 0; i < 15; i++) {
    const c = customers[Math.floor(Math.random() * customers.length)];
    const m = menus[Math.floor(Math.random() * menus.length)];
    const d = new Date();
    d.setDate(d.getDate() + Math.floor(Math.random() * 14) + 1);
    const hour = 10 + Math.floor(Math.random() * 8);
    await prisma.reservation.create({
      data: {
        salonId: demoSalon.id,
        customerId: c.id,
        staffId: staffRecords[i % staffRecords.length].id,
        menuId: m.id,
        menuName: m.name,
        menuPrice: m.price,
        date: d.toISOString().slice(0, 10),
        startTime: `${hour}:00`,
        endTime: `${hour + 1}:30`,
        status: 'confirmed',
        source: c.isLineFriend ? 'line' : 'web',
      },
    });
  }

  // Coupons
  await prisma.coupon.createMany({
    data: [
      { salonId: demoSalon.id, title: '初回ご来店20%OFF', description: '新規のお客様限定', discountType: 'percent', discountValue: 20, validFrom: daysAgo(30), validUntil: daysAgo(-60), maxUses: 100, usedCount: 24, targetSegment: 'new', code: 'WELCOME20' },
      { salonId: demoSalon.id, title: '休眠復帰1000円OFF', description: '3ヶ月以上ご来店されていない方へ', discountType: 'amount', discountValue: 1000, minPurchase: 5000, validFrom: daysAgo(7), validUntil: daysAgo(-30), maxUses: 50, usedCount: 8, targetSegment: 'dormant', code: 'COMEBACK' },
      { salonId: demoSalon.id, title: 'LINEお友だち限定500円OFF', description: '次回ご来店時にご利用いただけます', discountType: 'amount', discountValue: 500, minPurchase: 3000, validFrom: daysAgo(14), validUntil: daysAgo(-90), maxUses: 200, usedCount: 42, targetSegment: 'line_friend' },
    ],
  });

  // Messages
  await prisma.message.createMany({
    data: [
      { salonId: demoSalon.id, type: 'broadcast', title: '新作ニュアンスデザイン登場', content: '秋の新作デザインが入荷しました🍂 ご予約はLINEから', sentCount: 62, openedCount: 48, clickedCount: 14, status: 'sent', sentAt: new Date(Date.now() - 5 * 86400000) },
      { salonId: demoSalon.id, type: 'segment', title: '休眠顧客向けクーポン', content: 'お久しぶりです！1000円OFFクーポンをお送りします', targetSegment: 'dormant', sentCount: 15, openedCount: 9, clickedCount: 3, status: 'sent', sentAt: new Date(Date.now() - 7 * 86400000) },
    ],
  });

  // Designs
  await prisma.nailDesign.createMany({
    data: [
      { salonId: demoSalon.id, staffId: staffRecords[0].id, title: 'ミルキーホワイト×ゴールド', category: 'ニュアンス', tags: ['上品', 'オフィス'], likesCount: 42 },
      { salonId: demoSalon.id, staffId: staffRecords[1].id, title: 'ブラウンマグネット', category: 'マグネット', tags: ['秋冬', 'トレンド'], likesCount: 38 },
      { salonId: demoSalon.id, staffId: staffRecords[0].id, title: 'フレンチ×パール', category: 'フレンチ', tags: ['ブライダル'], likesCount: 56 },
      { salonId: demoSalon.id, staffId: staffRecords[2].id, title: 'ベージュワンカラー', category: 'シンプル', tags: ['定番', 'ナチュラル'], likesCount: 29 },
      { salonId: demoSalon.id, staffId: staffRecords[1].id, title: 'ビジューハート', category: 'アート', tags: ['華やか', 'パーティー'], likesCount: 71 },
      { salonId: demoSalon.id, staffId: staffRecords[0].id, title: 'くすみブルーグラデ', category: 'グラデーション', tags: ['夏', '爽やか'], likesCount: 33 },
    ],
  });

  console.log('✅ Seed completed!');
  console.log('');
  console.log('🔑 ログイン情報:');
  console.log('  ┌─ SuperAdmin:  super@salonlink.demo    / super1234');
  console.log('  ├─ 管理者:     owner@salonlink.demo    / owner1234');
  console.log('  └─ スタッフ:   staff@salonlink.demo    / staff1234');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
