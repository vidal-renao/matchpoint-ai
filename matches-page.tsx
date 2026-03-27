// ============================================================================
// MatchPoint AI — Matches Page
// Route: src/app/[locale]/(candidate)/matches/page.tsx
//
// Server Component: fetches candidate + matches, renders the premium dashboard.
// ============================================================================

import { getCandidateById } from '@/lib/actions/candidates';
import { getMatchesForCandidate } from '@/lib/actions/matching';
import { getTranslations, type Locale } from '@/lib/i18n';
import { MatchesClient } from './MatchesClient';

interface MatchesPageProps {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ id?: string }>;
}

export default async function MatchesPage({ params, searchParams }: MatchesPageProps) {
  const { locale: rawLocale } = await params;
  const { id } = await searchParams;

  const locale = (['en', 'es', 'de'].includes(rawLocale) ? rawLocale : 'es') as Locale;
  const t = getTranslations(locale);

  // No candidate ID provided
  if (!id) {
    return <MatchesErrorPage message={t('common.error')} backHref={`/${locale}/`} />;
  }

  // Fetch candidate and matches in parallel
  const [candidate, matchesResult] = await Promise.all([
    getCandidateById(id),
    getMatchesForCandidate(id),
  ]);

  if (!candidate) {
    return <MatchesErrorPage message={t('common.noData')} backHref={`/${locale}/`} />;
  }

  if (!matchesResult.success || !matchesResult.matches) {
    return (
      <MatchesErrorPage
        message={matchesResult.error ?? t('common.error')}
        backHref={`/${locale}/profile?id=${id}`}
      />
    );
  }

  return (
    <MatchesClient
      matches={matchesResult.matches}
      locale={locale}
      candidateName={candidate.full_name}
    />
  );
}

// ---------------------------------------------------------------------------
// Inline error page
// ---------------------------------------------------------------------------

function MatchesErrorPage({
  message,
  backHref,
}: {
  message: string;
  backHref: string;
}) {
  return (
    <div style={errorPageStyles.root}>
      <svg width="48" height="48" viewBox="0 0 48 48" fill="none" style={{ opacity: 0.3 }}>
        <circle cx="24" cy="24" r="22" stroke="#F59E0B" strokeWidth="1.5" />
        <path d="M24 14v12M24 32v2" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round" />
      </svg>
      <p style={errorPageStyles.text}>{message}</p>
      <a href={backHref} style={errorPageStyles.link}>← Volver</a>
    </div>
  );
}

const errorPageStyles = {
  root: {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    justifyContent: 'center',
    gap: '1rem',
    background: '#0A0A0B',
    color: '#F5F5F4',
    fontFamily: "'DM Sans', system-ui, sans-serif",
    padding: '2rem',
    textAlign: 'center' as const,
  },
  text: {
    fontSize: '1rem',
    color: '#8A8A94',
    margin: 0,
  },
  link: {
    color: '#F59E0B',
    textDecoration: 'none',
    fontSize: '0.875rem',
  },
};
