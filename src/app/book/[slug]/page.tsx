import { getPublicSalonBySlug } from '@/lib/salonData';
import { notFound } from 'next/navigation';
import { headers } from 'next/headers';
import BookingFlow from './BookingFlow';

export default async function BookPage({ params, searchParams }: { params: Promise<{ slug: string }>; searchParams: Promise<{ source?: string }> }) {
  const { slug } = await params;
  const sp = await searchParams;
  const salon = await getPublicSalonBySlug(slug);
  if (!salon) return notFound();

  // source 判定の優先順位:
  //   1. ?source=line が明示されている
  //   2. User-Agent に "Line/" が含まれる (LIFF / LINE アプリ内ブラウザ)
  //   3. デフォルトは自社HP (web)
  const h = await headers();
  const ua = h.get('user-agent') || '';
  const isLineBrowser = /Line\//i.test(ua);
  const source: 'line' | 'web' = sp.source === 'line' || isLineBrowser ? 'line' : 'web';

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
