import { getSalonData } from '@/lib/salonData';
import DesignsClient from './DesignsClient';

export default async function DesignsPage() {
  const { designs } = await getSalonData();
  return <DesignsClient designs={designs} />;
}
