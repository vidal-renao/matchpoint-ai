import { Header } from '@/components/layout/Header';
import { getEliteCandidates, listJobsForAdmin } from '@/lib/actions/admin';
import { AdminDashboard } from '@/components/admin/AdminDashboard';
import type { Locale } from '@/lib/i18n';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Recruiter Dashboard — MatchPoint AI',
  robots: { index: false, follow: false },
};

interface Props {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ job?: string; minScore?: string }>;
}

export default async function AdminPage({ params, searchParams }: Props) {
  const { locale: raw } = await params;
  const { job: jobId, minScore: minScoreRaw } = await searchParams;
  const locale = ((['en', 'es', 'de', 'it'].includes(raw) ? raw : 'es')) as Locale;
  const minScore = minScoreRaw ? Math.max(0, Math.min(100, Number(minScoreRaw))) : 90;

  const [eliteResult, jobsResult] = await Promise.all([
    getEliteCandidates({ jobId, minScore }),
    listJobsForAdmin(),
  ]);

  const entries = eliteResult.entries ?? [];
  const jobs = jobsResult.jobs ?? [];

  return (
    <>
      <Header locale={locale} />
      <div className="relative min-h-screen bg-base text-text font-body antialiased">
        <div className="ambient-glow" />
        {eliteResult.success ? (
          <AdminDashboard entries={entries} jobs={jobs} locale={locale} />
        ) : (
          <div className="max-w-[900px] mx-auto px-6 pt-28 pb-20">
            <div className="glass rounded-2xl p-12 text-center">
              <p className="text-error text-sm">Failed to load dashboard: {eliteResult.error}</p>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
