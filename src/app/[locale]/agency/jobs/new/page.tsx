import { Header } from '@/components/layout/Header';
import { requireAgency } from '@/lib/actions/agency';
import { AgencyPostJobForm } from '@/components/agency/AgencyPostJobForm';
import type { Locale } from '@/lib/i18n';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Post a Job — MatchPoint AI',
  robots: { index: false, follow: false },
};

interface Props { params: Promise<{ locale: string }> }

export default async function PostJobPage({ params }: Props) {
  const { locale: raw } = await params;
  const locale = ((['en', 'es', 'de', 'it'].includes(raw) ? raw : 'es')) as Locale;

  const agency = await requireAgency(locale);

  return (
    <>
      <Header locale={locale} section="agency" />
      <div className="relative min-h-screen bg-base text-text font-body antialiased">
        <div className="ambient-glow" />
        <div className="max-w-[720px] mx-auto px-6 pt-28 pb-20">
          <div className="mb-8">
            <a href={`/${locale}/agency`} className="text-xs text-text-dim hover:text-text-muted transition-colors">
              ← Dashboard
            </a>
            <h1 className="font-display text-3xl font-normal tracking-tight mt-3 mb-1">
              Post a new job
            </h1>
            <p className="text-text-muted text-sm">
              For <span className="text-accent">{agency.name}</span> · Candidates will be AI-matched automatically
            </p>
          </div>
          <AgencyPostJobForm agencyId={agency.id} locale={locale} />
        </div>
      </div>
    </>
  );
}
