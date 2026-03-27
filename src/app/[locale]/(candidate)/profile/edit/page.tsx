// ============================================================================
// Profile Edit Page — protected
// Route: /[locale]/profile/edit
// ============================================================================

import { getCandidateByUserId } from '@/lib/actions/candidates';
import { createClient } from '@/lib/supabase/server';
import { Header } from '@/components/layout/Header';
import { ProfileEditorWrapper } from '@/components/candidates/ProfileEditorWrapper';
import type { Locale } from '@/lib/i18n';
import { redirect } from 'next/navigation';

interface Props {
  params: Promise<{ locale: string }>;
}

export default async function ProfileEditPage({ params }: Props) {
  const { locale: raw } = await params;
  const locale = (['en', 'es', 'de'].includes(raw) ? raw : 'es') as Locale;

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect(`/${locale}/login`);

  const candidate = await getCandidateByUserId(user.id);
  if (!candidate) redirect(`/${locale}/upload`);

  return (
    <>
      <Header locale={locale} />
      <div className="relative min-h-screen bg-base text-text font-body antialiased overflow-x-hidden">
        <div className="ambient-glow" />
        <div className="max-w-[700px] mx-auto px-6 pt-28 pb-20">
          <div className="flex items-center justify-between mb-10">
            <div>
              <p className="text-xs uppercase tracking-widest text-text-dim mb-2">Edit</p>
              <h1 className="font-display text-3xl font-normal tracking-tight">Your Profile</h1>
            </div>
            <div className="flex items-center gap-3">
              <a
                href={`/${locale}/profile`}
                className="text-sm text-text-muted hover:text-text transition-colors"
              >
                ← Back
              </a>
              <a
                href={`/${locale}/profile?print=1`}
                className="text-sm px-4 py-2 rounded-lg border border-border text-text-muted hover:text-text hover:border-text-dim transition-all"
              >
                Print CV
              </a>
            </div>
          </div>

          <ProfileEditorWrapper candidate={candidate} locale={locale} />
        </div>
      </div>
    </>
  );
}
