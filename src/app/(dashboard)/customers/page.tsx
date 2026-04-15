import { getSalonData } from '@/lib/salonData';
import CustomersClient from './CustomersClient';

export default async function CustomersPage() {
  const { customers } = await getSalonData();
  return <CustomersClient customers={customers} />;
}
