// ============================================================================
// Profile Page — Server Component
// Route: /[locale]/(candidate)/profile?id=<uuid>
// ============================================================================

import { getCandidateById } from '@/lib/actions/candidates';
import { getTranslations, type Locale } from '@/lib/i18n';
import { ProfileClient } from '@/components/candidates/ProfileClient';

interface ProfilePageProps {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ id?: string }>;
}

export default async function ProfilePage({ params, searchParams }: ProfilePageProps) {
  const { locale: raw } = await params;
  const { id } = await searchParams;
  const locale = (['en', 'es', 'de'].includes(raw) ? raw : 'es') as Locale;
  const t = getTranslations(locale);

  if (!id) return <ErrorPage message={t('common.error')} back={`/${locale}/`} />;

  const candidate = await getCandidateById(id);
  if (!candidate) return <ErrorPage message={t('common.noData')} back={`/${locale}/`} />;

  return <ProfileClient candidate={candidate} locale={locale} />;
}

function ErrorPage({ message, back }: { message: string; back: string }) {
  return (
    <div className="min-h-screen bg-base flex flex-col items-center justify-center gap-4 text-center px-4">
      <p className="text-text-muted">{message}</p>
      <a href={back} className="text-sm text-accent hover:underline">← Volver</a>
    </div>
  );
}
