import { getSalonData } from '@/lib/salonData';
import CouponsClient from './CouponsClient';

export default async function CouponsPage() {
  const { coupons } = await getSalonData();
  return <CouponsClient coupons={coupons} />;
}
