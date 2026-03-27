// ============================================================================
// Applications Page — Server Component
// Route: /[locale]/applications (protected)
// ============================================================================

import { getApplicationsForUser } from '@/lib/actions/applications';
import { ApplicationsPipeline } from '@/components/candidates/ApplicationsPipeline';
import { Header } from '@/components/layout/Header';
import type { Locale } from '@/lib/i18n';

interface Props {
  params: Promise<{ locale: string }>;
}

export default async function ApplicationsPage({ params }: Props) {
  const { locale: raw } = await params;
  const locale = (['en', 'es', 'de'].includes(raw) ? raw : 'es') as Locale;

  const result = await getApplicationsForUser();

  return (
    <>
      <Header locale={locale} />
      <div className="relative min-h-screen bg-base text-text font-body antialiased overflow-x-hidden">
        <div className="ambient-glow" />
        <div className="max-w-[800px] mx-auto px-6 pt-28 pb-20">
          <div className="mb-10">
            <p className="text-xs uppercase tracking-widest text-text-dim mb-2">Your journey</p>
            <h1 className="font-display text-3xl font-normal tracking-tight">Applications</h1>
            <p className="text-text-muted text-sm mt-2">Track every role from first match to offer.</p>
          </div>

          {result.success && result.applications ? (
            <ApplicationsPipeline applications={result.applications} />
          ) : (
            <div className="text-text-muted text-sm py-12 text-center">
              {result.error ?? 'Could not load applications.'}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
