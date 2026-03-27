import type { MetadataRoute } from 'next';
import { createClient } from '@supabase/supabase-js';

const BASE = process.env.NEXT_PUBLIC_APP_URL ?? 'https://matchpoint.ai';
const LOCALES = ['es', 'en', 'de'];

function urls(path: string, priority: number, changeFrequency: MetadataRoute.Sitemap[number]['changeFrequency']) {
  return LOCALES.map((locale) => ({
    url: `${BASE}/${locale}${path}`,
    lastModified: new Date(),
    changeFrequency,
    priority,
  }));
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = [
    ...urls('', 1.0, 'daily'),
    ...urls('/jobs', 1.0, 'hourly'),
    ...urls('/employer', 0.9, 'weekly'),
    ...urls('/signup', 0.7, 'monthly'),
    ...urls('/login', 0.5, 'monthly'),
  ];

  // Dynamic job pages
  let jobRoutes: MetadataRoute.Sitemap = [];
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    );
    const { data: jobs } = await supabase
      .from('jobs')
      .select('id, updated_at')
      .eq('status', 'active')
      .is('deleted_at', null)
      .limit(500);

    jobRoutes = (jobs ?? []).flatMap((job) =>
      LOCALES.map((locale) => ({
        url: `${BASE}/${locale}/jobs/${job.id}`,
        lastModified: new Date(job.updated_at),
        changeFrequency: 'weekly' as const,
        priority: 0.8,
      }))
    );
  } catch { /* skip if DB unavailable at build */ }

  return [...staticRoutes, ...jobRoutes];
}
