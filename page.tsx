// ============================================================================
// MatchPoint AI — Candidate Profile Page
// Route: /[locale]/(candidate)/profile?id=<candidate_id>
//
// Server Component that fetches candidate data and renders their
// AI-extracted profile with status indicators.
// ============================================================================

import { getCandidateById } from '@/lib/actions/candidates';
import { getTranslations, type Locale } from '@/lib/i18n';
import { ProfileClient } from './ProfileClient';

interface ProfilePageProps {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ id?: string }>;
}

export default async function ProfilePage({
  params,
  searchParams,
}: ProfilePageProps) {
  const { locale: rawLocale } = await params;
  const { id } = await searchParams;
  const locale = (['en', 'es', 'de'].includes(rawLocale) ? rawLocale : 'es') as Locale;
  const t = getTranslations(locale);

  if (!id) {
    return (
      <div className="mp-profile-error-page">
        <p>{t('common.error')}</p>
        <a href={`/${locale}/`}>{t('common.back')}</a>
        <style>{profileErrorStyles}</style>
      </div>
    );
  }

  const candidate = await getCandidateById(id);

  if (!candidate) {
    return (
      <div className="mp-profile-error-page">
        <p>{t('common.noData')}</p>
        <a href={`/${locale}/`}>{t('common.back')}</a>
        <style>{profileErrorStyles}</style>
      </div>
    );
  }

  return <ProfileClient candidate={candidate} locale={locale} />;
}

const profileErrorStyles = `
  .mp-profile-error-page {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 1rem;
    background: #0A0A0B;
    color: #F5F5F4;
    font-family: 'DM Sans', system-ui, sans-serif;
  }
  .mp-profile-error-page a {
    color: #F59E0B;
    text-decoration: none;
    font-size: 0.875rem;
  }
  .mp-profile-error-page a:hover {
    text-decoration: underline;
  }
`;
