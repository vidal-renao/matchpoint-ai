// ============================================================================
// Profile Page — Server Component
// Route: /[locale]/(candidate)/profile
// Auth: resolves candidate via session user_id (fallback: ?id= query param)
// ============================================================================

import { getCandidateById, getCandidateByUserId } from '@/lib/actions/candidates';
import { createClient } from '@/lib/supabase/server';
import { getTranslations, type Locale } from '@/lib/i18n';
import { ProfileClient } from '@/components/candidates/ProfileClient';
import { Header } from '@/components/layout/Header';

interface ProfilePageProps {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ id?: string }>;
}

export default async function ProfilePage({ params, searchParams }: ProfilePageProps) {
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

  return (
    <>
      <Header locale={locale} />
      <ProfileClient candidate={candidate} locale={locale} />
    </>
  );
}

function ErrorPage({ message, back }: { message: string; back: string }) {
  return (
    <div className="min-h-screen bg-base flex flex-col items-center justify-center gap-4 text-center px-4">
      <p className="text-text-muted">{message}</p>
      <a href={back} className="text-sm text-accent hover:underline">← Upload CV</a>
    </div>
  );
}
