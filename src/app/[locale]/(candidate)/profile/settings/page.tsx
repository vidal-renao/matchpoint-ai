import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { Header } from '@/components/layout/Header';
import { ProfileSettings } from '@/components/profile/ProfileSettings';
import type { Locale } from '@/lib/i18n';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Account Settings — MatchPoint AI',
  robots: { index: false, follow: false },
};

interface Props { params: Promise<{ locale: string }> }

export default async function ProfileSettingsPage({ params }: Props) {
  const { locale: raw } = await params;
  const locale = (['en', 'es', 'de', 'it'].includes(raw) ? raw : 'es') as Locale;

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect(`/${locale}/login`);

  return (
    <>
      <Header locale={locale} />
      <div className="relative min-h-screen bg-base text-text font-body antialiased">
        <div className="ambient-glow" />
        <div className="max-w-[640px] mx-auto px-6 pt-28 pb-20">
          <div className="mb-8">
            <a href={`/${locale}/profile`} className="text-xs text-text-dim hover:text-text-muted transition-colors">
              ← Profile
            </a>
            <h1 className="font-display text-3xl font-normal tracking-tight mt-3 mb-1">Account Settings</h1>
            <p className="text-text-muted text-sm">{user.email}</p>
          </div>
          <ProfileSettings locale={locale} userEmail={user.email ?? ''} />
        </div>
      </div>
    </>
  );
}
