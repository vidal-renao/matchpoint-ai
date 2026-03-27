// ============================================================================
// Matches Page — Server Component
// Route: /[locale]/(candidate)/matches?id=<uuid>
// ============================================================================

import { getCandidateById } from '@/lib/actions/candidates';
import { getMatchesForCandidate } from '@/lib/actions/matching';
import { getTranslations, type Locale } from '@/lib/i18n';
import { MatchesClient } from '@/components/candidates/MatchesClient';

interface MatchesPageProps {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ id?: string }>;
}

export default async function MatchesPage({ params, searchParams }: MatchesPageProps) {
  const { locale: raw } = await params;
  const { id } = await searchParams;
  const locale = (['en', 'es', 'de'].includes(raw) ? raw : 'es') as Locale;
  const t = getTranslations(locale);

  if (!id) return <ErrorPage message={t('common.error')} back={`/${locale}/`} />;

  // Fetch candidate + matches in parallel
  const [candidate, matchesResult] = await Promise.all([
    getCandidateById(id),
    getMatchesForCandidate(id),
  ]);

  if (!candidate) return <ErrorPage message={t('common.noData')} back={`/${locale}/`} />;
  if (!matchesResult.success || !matchesResult.matches) {
    return <ErrorPage message={matchesResult.error ?? t('common.error')} back={`/${locale}/profile?id=${id}`} />;
  }

  return (
    <MatchesClient
      matches={matchesResult.matches}
      locale={locale}
      candidateName={candidate.full_name}
    />
  );
}

function ErrorPage({ message, back }: { message: string; back: string }) {
  return (
    <div className="min-h-screen bg-base flex flex-col items-center justify-center gap-4 text-center px-4">
      <svg width="48" height="48" viewBox="0 0 48 48" fill="none" className="opacity-30">
        <circle cx="24" cy="24" r="22" stroke="#f59e0b" strokeWidth="1.5" />
        <path d="M24 14v12M24 32v2" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" />
      </svg>
      <p className="text-text-muted">{message}</p>
      <a href={back} className="text-sm text-accent hover:underline">← Volver</a>
    </div>
  );
}
