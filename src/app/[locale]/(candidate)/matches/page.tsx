// ============================================================================
// Matches Page — Server Component
// Route: /[locale]/(candidate)/matches
// Auth: resolves candidate via session user_id (fallback: ?id= query param)
// ============================================================================

import { getCandidateById, getCandidateByUserId } from '@/lib/actions/candidates';
import { getMatchesForCandidate } from '@/lib/actions/matching';
import { createClient } from '@/lib/supabase/server';
import { getTranslations, type Locale } from '@/lib/i18n';
import { MatchesClient } from '@/components/candidates/MatchesClient';
import { Header } from '@/components/layout/Header';

interface MatchesPageProps {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ id?: string }>;
}

export default async function MatchesPage({ params, searchParams }: MatchesPageProps) {
  const { locale: raw } = await params;
  const { id } = await searchParams;
  const locale = ((['en', 'es', 'de', 'it'].includes(raw) ? raw : 'es')) as Locale;
  const t = getTranslations(locale);

  // Try session-based lookup first, fall back to ?id= param
  let candidate = null;
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      candidate = await getCandidateByUserId(user.id);
    }
  } catch { /* no session */ }

  if (!candidate && id) {
    candidate = await getCandidateById(id);
  }

  if (!candidate) {
    return (
      <>
        <Header locale={locale} />
        <ErrorPage message={t('common.noData')} back={`/${locale}/upload`} />
      </>
    );
  }

  const matchesResult = await getMatchesForCandidate(candidate.id);

  if (!matchesResult.success || !matchesResult.matches) {
    return (
      <>
        <Header locale={locale} />
        <ErrorPage message={matchesResult.error ?? t('common.error')} back={`/${locale}/profile`} />
      </>
    );
  }

  return (
    <>
      <Header locale={locale} />
      <MatchesClient
        matches={matchesResult.matches}
        locale={locale}
        candidateName={candidate.full_name}
        candidateId={candidate.id}
      />
    </>
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
