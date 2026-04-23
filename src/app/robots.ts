import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const base = process.env.NEXT_PUBLIC_APP_URL || 'https://salon-link-web-production.up.railway.app';
  return {
    rules: [
      {
        userAgent: '*',
        allow: ['/', '/login', '/register'],
        disallow: ['/dashboard', '/reservations', '/customers', '/menus', '/coupons', '/messages', '/designs', '/analytics', '/settings', '/superadmin', '/api/'],
      },
    ],
    sitemap: `${base}/sitemap.xml`,
  };
}
