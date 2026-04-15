import { getSalonData } from '@/lib/salonData';
import MessagesClient from './MessagesClient';

export default async function MessagesPage() {
  const { messages, customers } = await getSalonData();
  return <MessagesClient messages={messages} customers={customers} />;
}
