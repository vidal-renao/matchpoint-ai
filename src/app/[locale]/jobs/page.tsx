import { Header } from '@/components/layout/Header';
import { listJobs } from '@/lib/actions/jobs';
import { SECTORS } from '@/lib/constants/jobs';
import { JobsGrid } from '@/components/jobs/JobsGrid';
import { JobFilters } from '@/components/jobs/JobFilters';
import type { Locale } from '@/lib/i18n';
import type { Metadata } from 'next';

interface Props {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ sector?: string; search?: string; remote?: string; page?: string }>;
}

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const { sector, search } = await searchParams;
  const title = search
    ? `"${search}" Jobs — MatchPoint AI`
    : sector
    ? `${sector.charAt(0).toUpperCase() + sector.slice(1)} Jobs — MatchPoint AI`
    : 'Browse All Jobs — MatchPoint AI';
  return {
    title,
    description: 'AI-matched jobs across Technology, Finance, Healthcare, Engineering and more. Upload your CV and get scored against every role automatically.',
  };
}

export default async function JobsPage({ params, searchParams }: Props) {
  const { locale: raw } = await params;
  const { sector, search, remote, page } = await searchParams;
  const locale = (['en', 'es', 'de'].includes(raw) ? raw : 'es') as Locale;

  const currentPage = Math.max(1, Number(page ?? 1));
  const limit = 18;
  const offset = (currentPage - 1) * limit;

  const { jobs, total } = await listJobs({ sector, search, remote, limit, offset });
  const totalPages = Math.ceil(total / limit);

  const sectorLabel = sector
    ? SECTORS.find((s) => s.key === sector)?.label ?? sector
    : null;

  return (
    <>
      <Header locale={locale} />
      <div className="relative min-h-screen bg-base text-text font-body antialiased">
        <div className="ambient-glow" />
        <div className="max-w-[1300px] mx-auto px-6 pt-24 pb-20">

          {/* Page header */}
          <div className="mb-8">
            <h1 className="font-display text-3xl font-normal tracking-tight">
              {search ? `Results for "${search}"` : sectorLabel ? `${sectorLabel} Jobs` : 'All Jobs'}
            </h1>
            <p className="text-text-muted text-sm mt-1">
              {total.toLocaleString()} {total === 1 ? 'position' : 'positions'} found
              {sectorLabel ? ` in ${sectorLabel}` : ''} · AI-matched against your profile
            </p>
          </div>

          <div className="flex gap-8 items-start">
            {/* Sidebar filters */}
            <aside className="hidden lg:block w-56 flex-shrink-0 sticky top-24">
              <JobFilters locale={locale} activeSector={sector} activeRemote={remote} activeSearch={search} />
            </aside>

            {/* Job grid */}
            <div className="flex-1 min-w-0">
              <JobsGrid jobs={jobs} locale={locale} />

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-10">
                  {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => i + 1).map((p) => {
                    const params = new URLSearchParams();
                    if (sector) params.set('sector', sector);
                    if (search) params.set('search', search);
                    if (remote) params.set('remote', remote);
                    params.set('page', String(p));
                    return (
                      <a
                        key={p}
                        href={`/${locale}/jobs?${params.toString()}`}
                        className={`w-9 h-9 rounded-lg flex items-center justify-center text-sm transition-all ${
                          p === currentPage
                            ? 'bg-accent text-base font-medium'
                            : 'border border-border text-text-muted hover:border-text-dim hover:text-text'
                        }`}
                      >
                        {p}
                      </a>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Upload CTA banner */}
          <div className="mt-16 glass rounded-2xl p-8 flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <p className="font-display text-xl font-normal">Get AI-matched to all {total.toLocaleString()} jobs at once</p>
              <p className="text-text-muted text-sm mt-1">Upload your CV once — the engine scores every role and ranks your best fits automatically.</p>
            </div>
            <a
              href={`/${locale}/upload`}
              className="flex-shrink-0 px-7 py-3.5 rounded-lg bg-accent text-base font-medium hover:bg-accent-hover transition-all whitespace-nowrap shadow-[0_0_24px_rgba(245,158,11,0.2)]"
            >
              Upload CV & Get Matched
            </a>
          </div>
        </div>
      </div>
    </>
  );
}
