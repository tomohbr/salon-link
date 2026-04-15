import { getSalonData } from '@/lib/salonData';
import MenusClient from './MenusClient';

export default async function MenusPage() {
  const { menus } = await getSalonData();
  return <MenusClient menus={menus} />;
}
