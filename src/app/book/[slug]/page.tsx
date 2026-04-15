import { getPublicSalonBySlug } from '@/lib/salonData';
import { notFound } from 'next/navigation';
import BookingFlow from './BookingFlow';

export default async function BookPage({ params, searchParams }: { params: Promise<{ slug: string }>; searchParams: Promise<{ source?: string }> }) {
  const { slug } = await params;
  const sp = await searchParams;
  const salon = await getPublicSalonBySlug(slug);
  if (!salon) return notFound();

  // source パラメータで流入元を判定
  // /book/[slug] → 自社HP (web)
  // /book/[slug]?source=line → LINE経由
  const source = sp.source === 'line' ? 'line' : 'web';

  return (
    <BookingFlow
      slug={slug}
      source={source}
      salon={{
        name: salon.name,
        description: salon.description,
        address: salon.address,
        phone: salon.phone,
      }}
      menus={salon.menus.map((m) => ({
        id: m.id,
        name: m.name,
        category: m.category,
        price: m.price,
        durationMinutes: m.durationMinutes,
        description: m.description,
      }))}
      coupons={salon.coupons.map((c) => ({
        id: c.id,
        title: c.title,
        description: c.description,
        discountType: c.discountType,
        discountValue: c.discountValue,
      }))}
      designs={salon.designs.slice(0, 6).map((d) => ({
        id: d.id,
        title: d.title,
        likesCount: d.likesCount,
      }))}
    />
  );
}
