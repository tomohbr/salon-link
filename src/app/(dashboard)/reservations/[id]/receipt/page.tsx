// 領収書 HTML - ブラウザの「印刷 → PDF として保存」で PDF 化する前提。
// pptxgenjs 等を使わず、CSS @print で A4 印刷最適化。

import { getCurrentSalon } from '@/lib/salonData';
import { prisma } from '@/lib/db';
import { notFound } from 'next/navigation';
import { yen, fmtDate } from '@/lib/utils/format';
import PrintButton from './PrintButton';

export const metadata = { title: '領収書 | SalonLink' };

export default async function ReceiptPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ name?: string }> }) {
  const { id } = await params;
  const sp = await searchParams;
  const { salon } = await getCurrentSalon();

  const reservation = await prisma.reservation.findFirst({
    where: { id, salonId: salon.id },
    include: { customer: true, menu: true, staff: true },
  });
  if (!reservation) return notFound();

  // 宛名: URLパラメータ > 顧客名 > 「上様」
  const recipient = sp.name || reservation.customer?.name || '上様';
  const issuedDate = reservation.paidAt
    ? new Date(reservation.paidAt).toISOString().slice(0, 10)
    : new Date().toISOString().slice(0, 10);

  const items: Array<{ label: string; amount: number }> = [];
  if (reservation.paidAmount != null) {
    items.push({ label: reservation.menuName || '施術料金', amount: reservation.paidAmount });
  } else if (reservation.menuPrice) {
    items.push({ label: reservation.menuName || '施術料金', amount: reservation.menuPrice });
  }
  if (reservation.retailAmount && reservation.retailAmount > 0) {
    items.push({ label: '店販商品', amount: reservation.retailAmount });
  }
  if (reservation.designationFee && reservation.designationFee > 0) {
    items.push({ label: '指名料', amount: reservation.designationFee });
  }
  if (reservation.tip && reservation.tip > 0) {
    items.push({ label: 'チップ', amount: reservation.tip });
  }
  const subtotal = items.reduce((s, it) => s + it.amount, 0);
  const taxIncluded = true; // 税込表示

  // 受領番号: cuid の下 8 文字を大文字化
  const receiptNo = reservation.id.slice(-8).toUpperCase();

  return (
    <div className="receipt-page">
      <div className="receipt-toolbar no-print">
        <PrintButton />
      </div>

      <div className="receipt-sheet">
        <div className="receipt-header">
          <h1>領　収　書</h1>
          <div className="receipt-meta">
            <div>No. {receiptNo}</div>
            <div>{fmtDate(issuedDate)}</div>
          </div>
        </div>

        <div className="receipt-to">
          <span className="recipient-name">{recipient}</span>
          <span className="recipient-hon"> 様</span>
        </div>

        <div className="receipt-amount-block">
          <div className="amount-label">金額</div>
          <div className="amount-value">¥ {subtotal.toLocaleString('ja-JP')}<span className="tax-mark">{taxIncluded ? '（税込）' : '（税抜）'}</span></div>
        </div>

        <div className="receipt-note">
          但し、下記のとおりご利用いただきました。上記のとおり正に領収いたしました。
        </div>

        <table className="receipt-items">
          <thead>
            <tr>
              <th style={{ textAlign: 'left' }}>内訳</th>
              <th style={{ textAlign: 'right' }}>金額</th>
            </tr>
          </thead>
          <tbody>
            {items.map((it, i) => (
              <tr key={i}>
                <td>{it.label}</td>
                <td style={{ textAlign: 'right' }}>¥ {it.amount.toLocaleString('ja-JP')}</td>
              </tr>
            ))}
            <tr className="total-row">
              <td>合計</td>
              <td style={{ textAlign: 'right' }}>¥ {subtotal.toLocaleString('ja-JP')}</td>
            </tr>
          </tbody>
        </table>

        <div className="receipt-details">
          <div>施術日: {fmtDate(reservation.date)} {reservation.startTime}〜{reservation.endTime}</div>
          {reservation.staff && <div>担当: {reservation.staff.name}</div>}
          {reservation.paymentMethod && <div>支払い方法: {paymentLabel(reservation.paymentMethod)}</div>}
        </div>

        <div className="receipt-issuer">
          <div className="issuer-stamp">
            <div style={{ fontWeight: 700 }}>{salon.name}</div>
            {salon.address && <div>{salon.address}</div>}
            {salon.phone && <div>TEL: {salon.phone}</div>}
          </div>
        </div>

        <div className="receipt-footer">
          <div style={{ fontSize: '10px', color: '#999', marginTop: '24px' }}>
            本書は SalonLink により発行されました。
          </div>
        </div>
      </div>

      <style>{`
        @media screen {
          .receipt-page {
            min-height: 100vh;
            background: #f5f5f4;
            padding: 24px 16px;
          }
          .receipt-toolbar {
            max-width: 600px;
            margin: 0 auto 16px;
            display: flex;
            justify-content: flex-end;
            gap: 8px;
          }
          .receipt-sheet {
            max-width: 600px;
            margin: 0 auto;
            background: white;
            padding: 48px 56px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.08);
            font-family: "Zen Maru Gothic", sans-serif;
            color: #1c1917;
          }
        }
        @media print {
          @page { size: A5 portrait; margin: 14mm; }
          body { background: white !important; }
          .no-print { display: none !important; }
          .receipt-sheet { box-shadow: none !important; padding: 0 !important; max-width: 100% !important; }
        }
        .receipt-header {
          text-align: center;
          padding-bottom: 16px;
          border-bottom: 2px solid #1c1917;
          margin-bottom: 24px;
        }
        .receipt-header h1 {
          font-size: 26px;
          font-weight: 700;
          letter-spacing: 0.5em;
          margin: 0 0 12px;
        }
        .receipt-meta {
          display: flex;
          justify-content: space-between;
          font-size: 12px;
          color: #57534e;
        }
        .receipt-to {
          padding: 16px 8px;
          border-bottom: 1px solid #d6d3d1;
          margin-bottom: 24px;
          font-size: 18px;
        }
        .recipient-name {
          font-size: 22px;
          font-weight: 700;
          padding-right: 8px;
        }
        .recipient-hon { font-size: 16px; color: #57534e; }
        .receipt-amount-block {
          margin-bottom: 16px;
          padding: 14px 0;
          border-top: 1px solid #1c1917;
          border-bottom: 3px double #1c1917;
          text-align: center;
        }
        .amount-label {
          font-size: 11px;
          letter-spacing: 0.3em;
          color: #57534e;
          margin-bottom: 6px;
        }
        .amount-value {
          font-size: 32px;
          font-weight: 700;
          letter-spacing: 0.04em;
          font-variant-numeric: tabular-nums;
        }
        .tax-mark {
          font-size: 14px;
          margin-left: 10px;
          color: #57534e;
          font-weight: 400;
        }
        .receipt-note {
          font-size: 12px;
          color: #57534e;
          padding: 10px 0;
          border-bottom: 1px solid #d6d3d1;
          margin-bottom: 20px;
          line-height: 1.8;
        }
        .receipt-items {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 24px;
          font-size: 13px;
        }
        .receipt-items th,
        .receipt-items td {
          padding: 10px 4px;
          border-bottom: 1px solid #e7e5e4;
        }
        .receipt-items th {
          font-size: 10px;
          letter-spacing: 0.15em;
          color: #78716c;
          font-weight: 600;
          text-transform: uppercase;
        }
        .receipt-items td {
          font-variant-numeric: tabular-nums;
        }
        .total-row td {
          font-weight: 700;
          border-top: 2px solid #1c1917;
          border-bottom: none !important;
          padding-top: 12px;
        }
        .receipt-details {
          font-size: 11px;
          color: #57534e;
          line-height: 2.0;
          margin-bottom: 36px;
          padding: 12px;
          background: #fafaf9;
          border-radius: 4px;
        }
        .receipt-issuer {
          display: flex;
          justify-content: flex-end;
          margin-top: 20px;
        }
        .issuer-stamp {
          font-size: 11px;
          text-align: right;
          line-height: 1.8;
          padding: 12px 16px;
          border: 1px solid #1c1917;
          border-radius: 2px;
          min-width: 200px;
        }
      `}</style>
    </div>
  );
}

function paymentLabel(method: string): string {
  const map: Record<string, string> = {
    cash: '現金', credit: 'クレジットカード', qr: 'QR決済',
    coin: 'COIN+', point: 'HPBポイント', other: 'その他',
  };
  return map[method] || method;
}
