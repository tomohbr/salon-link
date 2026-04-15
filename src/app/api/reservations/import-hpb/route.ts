// HPB CSV取込API
//
// SalonBoardの予約CSVをアップロードして、source='hotpepper'でSalonLinkに一括取込する。
//
// 運用フロー:
//   1. サロンオーナーがSalonBoardにログイン
//   2. 「予約管理」→「CSVダウンロード」でCSV出力
//   3. このAPIにアップロード (もしくは管理画面の取込モーダルから)
//   4. パース→重複チェック→予約作成→結果レポート
//
// 重複判定: 同じ salonId + date + startTime + customerName は既存とみなしスキップ

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireRole } from '@/lib/auth';
import { parseHpbCsv } from '@/lib/csvImport';
import { getAvailableSlots } from '@/lib/availability';

export async function POST(req: NextRequest) {
  try {
    const session = await requireRole(['admin']);
    if (!session.salonId) return NextResponse.json({ error: 'no salon' }, { status: 403 });
    const salonId = session.salonId;

    const body = await req.json();
    const csvText: string = body.csv || '';
    if (!csvText) {
      return NextResponse.json({ error: 'CSVデータがありません' }, { status: 400 });
    }

    const { imported, skipped } = parseHpbCsv(csvText);

    const menus = await prisma.menu.findMany({ where: { salonId } });

    let created = 0;
    let duplicates = 0;
    const errors: Array<{ row: number; error: string }> = [];
    const conflicts: Array<{ row: number; error: string }> = [];

    for (let i = 0; i < imported.length; i++) {
      const r = imported[i];
      try {
        // 既存の重複チェック
        const dup = await prisma.reservation.findFirst({
          where: {
            salonId,
            date: r.date,
            startTime: r.startTime,
            customer: { name: r.customerName },
          },
        });
        if (dup) {
          duplicates++;
          continue;
        }

        // メニューマッチング（名前一致 or デフォルト）
        let menu = menus.find((m) => m.name === r.menuName || r.menuName.includes(m.name));
        if (!menu) menu = menus[0]; // fallback

        // 空き枠チェック
        const slots = await getAvailableSlots(
          salonId,
          r.date,
          menu?.durationMinutes || r.duration || 60
        );
        const target = slots.find((s) => s.time === r.startTime);
        if (!target?.available) {
          conflicts.push({
            row: i + 2,
            error: `${r.date} ${r.startTime} は既に別の予約があります (HPB予約は優先されるべきかチェック要)`,
          });
          continue;
        }

        // 顧客作成 or 取得
        let customer = r.phone
          ? await prisma.customer.findFirst({ where: { salonId, phone: r.phone } })
          : null;
        if (!customer) {
          customer = await prisma.customer.create({
            data: {
              salonId,
              name: r.customerName,
              phone: r.phone || null,
              source: 'hotpepper',
              firstVisitDate: r.date,
            },
          });
        }

        // 終了時刻を計算
        const [sh, sm] = r.startTime.split(':').map(Number);
        const duration = menu?.durationMinutes || r.duration || 60;
        const endMin = sh * 60 + sm + duration;
        const endTime = `${String(Math.floor(endMin / 60)).padStart(2, '0')}:${String(endMin % 60).padStart(2, '0')}`;

        await prisma.reservation.create({
          data: {
            salonId,
            customerId: customer.id,
            menuId: menu?.id,
            menuName: menu?.name || r.menuName,
            menuPrice: r.price || menu?.price || 0,
            date: r.date,
            startTime: r.startTime,
            endTime,
            status: 'confirmed',
            source: 'hotpepper',
          },
        });
        created++;
      } catch (err) {
        errors.push({
          row: i + 2,
          error: err instanceof Error ? err.message : String(err),
        });
      }
    }

    return NextResponse.json({
      ok: true,
      summary: {
        totalRows: imported.length + skipped.length,
        parseable: imported.length,
        unparseable: skipped.length,
        created,
        duplicates,
        conflicts: conflicts.length,
        errors: errors.length,
      },
      details: {
        skipped: skipped.slice(0, 10),
        conflicts: conflicts.slice(0, 10),
        errors: errors.slice(0, 10),
      },
    });
  } catch (err) {
    if (err instanceof Error && (err.message === 'UNAUTHORIZED' || err.message === 'FORBIDDEN')) {
      return NextResponse.json({ error: err.message }, { status: 401 });
    }
    console.error(err);
    return NextResponse.json({ error: 'サーバーエラー' }, { status: 500 });
  }
}
