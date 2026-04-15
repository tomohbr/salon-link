import { getCurrentSalon } from '@/lib/salonData';
import { prisma } from '@/lib/db';
import { notFound } from 'next/navigation';
import CustomerDetailClient from './CustomerDetailClient';

export default async function CustomerDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { salon } = await getCurrentSalon();
  const customer = await prisma.customer.findFirst({ where: { id, salonId: salon.id } });
  if (!customer) return notFound();

  const treatments = await prisma.treatmentRecord.findMany({
    where: { customerId: id },
    orderBy: { date: 'desc' },
    include: { staff: { select: { name: true } } },
  });

  return <CustomerDetailClient customer={customer} treatments={treatments} />;
}
