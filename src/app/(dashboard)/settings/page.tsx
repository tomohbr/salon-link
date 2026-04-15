import { getSalonData } from '@/lib/salonData';
import SettingsClient from './SettingsClient';

export default async function SettingsPage() {
  const { salon, staff } = await getSalonData();
  return <SettingsClient salon={salon} staff={staff} />;
}
