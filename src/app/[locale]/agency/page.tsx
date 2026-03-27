import { Header } from '@/components/layout/Header';
import { requireAgency, getAgencyJobs, getAgencyCandidates } from '@/lib/actions/agency';
import { AgencyDashboard } from '@/components/agency/AgencyDashboard';
import type { Locale } from '@/lib/i18n';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Agency Dashboard — MatchPoint AI',
  robots: { index: false, follow: false },
};

interface Props {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ job?: string; minScore?: string }>;
}

export default async function AgencyPage({ params, searchParams }: Props) {
  const { locale: raw } = await params;
  const { job: jobId, minScore: minScoreRaw } = await searchParams;
  const locale = (['en', 'es', 'de'].includes(raw) ? raw : 'es') as Locale;
  const minScore = minScoreRaw ? Math.max(0, Math.min(100, Number(minScoreRaw))) : 75;

  const agency = await requireAgency(locale);

  const [jobs, candidatesResult] = await Promise.all([
    getAgencyJobs(agency.id),
    getAgencyCandidates(agency.id, { jobId, minScore }),
  ]);

  return (
    <>
      <Header locale={locale} />
      <div className="relative min-h-screen bg-base text-text font-body antialiased">
        <div className="ambient-glow" />
        <AgencyDashboard
          agency={agency}
          jobs={jobs}
          candidates={candidatesResult.candidates ?? []}
          locale={locale}
        />
      </div>
    </>
  );
}
