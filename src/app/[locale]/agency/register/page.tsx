import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { Header } from '@/components/layout/Header';
import { AgencyRegisterForm } from '@/components/agency/AgencyRegisterForm';
import { getAgencyForUser } from '@/lib/actions/agency';
import type { Locale } from '@/lib/i18n';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Create Your Agency Workspace — MatchPoint AI',
  robots: { index: false, follow: false },
};

interface Props {
  params: Promise<{ locale: string }>;
}

export default async function AgencyRegisterPage({ params }: Props) {
  const { locale: raw } = await params;
  const locale = ((['en', 'es', 'de', 'it'].includes(raw) ? raw : 'es')) as Locale;

  // Must be logged in
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect(`/${locale}/login?next=/${locale}/agency/register`);

  // If already has agency, go to dashboard
  const existing = await getAgencyForUser();
  if (existing) redirect(`/${locale}/agency`);

  return (
    <>
      <Header locale={locale} />
      <div className="relative min-h-screen bg-base text-text font-body antialiased">
        <div className="ambient-glow" />
        <div className="max-w-[560px] mx-auto px-6 pt-28 pb-20">
          <div className="mb-8">
            <h1 className="font-display text-3xl font-normal tracking-tight mb-2">
              Create your agency workspace
            </h1>
            <p className="text-text-muted text-sm leading-relaxed">
              Set up your MatchPoint AI workspace to post jobs, screen candidates with AI, and manage your pipeline — all in one place.
            </p>
          </div>

          {/* Plan badges */}
          <div className="glass rounded-xl p-4 mb-8 flex items-center gap-3">
            <span className="text-xs px-2.5 py-1 rounded-full bg-accent/10 text-accent border border-accent/20 font-medium">
              30-day free trial
            </span>
            <span className="text-xs text-text-dim">No credit card required · 5 active jobs included</span>
          </div>

          <AgencyRegisterForm locale={locale} />
        </div>
      </div>
    </>
  );
}
