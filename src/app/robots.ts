import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const base = process.env.NEXT_PUBLIC_APP_URL ?? 'https://matchpoint.ai';
  return {
    rules: [
      { userAgent: '*', allow: '/', disallow: ['/api/', '/_next/', '/upload', '/profile', '/matches', '/applications', '/profile/edit'] },
    ],
    sitemap: `${base}/sitemap.xml`,
  };
}
