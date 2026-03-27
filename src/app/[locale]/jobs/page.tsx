import { createClient as createServerClient } from '@/lib/supabase/server';
import { createClient } from '@supabase/supabase-js';
import { Header } from '@/components/layout/Header';
import { listJobs } from '@/lib/actions/jobs';
import { SECTORS } from '@/lib/constants/jobs';
import { JobsList } from '@/components/jobs/JobsList';
import { JobFilters } from '@/components/jobs/JobFilters';
import type { Locale } from '@/lib/i18n';
import type { Metadata } from 'next';

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

interface Props {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ sector?: string; search?: string; remote?: string; page?: string }>;
}

function getServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}

export default async function JobsPage({ params, searchParams }: Props) {
  const { locale: raw } = await params;
  const { sector, search, remote, page } = await searchParams;
  const locale = (['en', 'es', 'de'].includes(raw) ? raw : 'es') as Locale;

  const currentPage = Math.max(1, Number(page ?? 1));
  const limit = 20;
  const offset = (currentPage - 1) * limit;

  // Fetch jobs + match scores in parallel
  const [{ jobs, total }, matchMap] = await Promise.all([
    listJobs({ sector, search, remote, limit, offset }),
    (async () => {
      try {
        const sessionClient = await createServerClient();
        const { data: { user } } = await sessionClient.auth.getUser();
        if (!user) return {};

        const supabase = getServiceClient();
        const { data: candidate } = await supabase
          .from('candidates')
          .select('id')
          .eq('user_id', user.id)
          .is('deleted_at', null)
          .order('created_at', { ascending: false })
          .limit(1)
          .single();

        if (!candidate) return {};

        const { data: matches } = await supabase
          .from('matches')
          .select('job_id, overall_score')
          .eq('candidate_id', candidate.id);

        const map: Record<string, number> = {};
        for (const m of matches ?? []) map[m.job_id] = m.overall_score;
        return map;
      } catch {
        return {};
      }
    })(),
  ]);

  const totalPages = Math.ceil(total / limit);
  const hasMatches = Object.keys(matchMap).length > 0;
  const activeSectorLabel = sector ? SECTORS.find((s) => s.key === sector)?.label : null;

  return (
    <>
      <Header locale={locale} />
      <div className="relative min-h-screen bg-base text-text font-body antialiased">
        <div className="ambient-glow" />

        {/* Sector tab bar */}
        <div className="fixed top-14 left-0 right-0 z-40 border-b border-border-subtle bg-base/90 backdrop-blur-xl overflow-x-auto">
          <div className="max-w-[1300px] mx-auto px-6 flex items-center gap-0 h-11">
            <a
              href={`/${locale}/jobs`}
              className={`shrink-0 flex items-center gap-1.5 px-3 h-full text-xs font-medium border-b-2 transition-colors ${
                !sector
                  ? 'border-accent text-accent'
                  : 'border-transparent text-text-dim hover:text-text-muted'
              }`}
            >
              All Jobs
            </a>
            {SECTORS.map((s) => (
              <a
                key={s.key}
                href={`/${locale}/jobs?sector=${s.key}${remote ? `&remote=${remote}` : ''}${search ? `&search=${search}` : ''}`}
                className={`shrink-0 flex items-center gap-1.5 px-3 h-full text-xs font-medium border-b-2 transition-colors ${
                  sector === s.key
                    ? 'border-accent text-accent'
                    : 'border-transparent text-text-dim hover:text-text-muted'
                }`}
              >
                <span>{s.icon}</span>
                <span className="hidden sm:inline">{s.label}</span>
              </a>
            ))}
          </div>
        </div>

        <div className="max-w-[1300px] mx-auto px-6 pt-[6.5rem] pb-20">

          {/* Page header */}
          <div className="flex flex-col sm:flex-row sm:items-end gap-2 mb-6">
            <div>
              <h1 className="font-display text-2xl font-normal tracking-tight">
                {search ? `Results for "${search}"` : activeSectorLabel ? `${activeSectorLabel} Jobs` : 'All Jobs'}
              </h1>
              <p className="text-text-dim text-xs mt-0.5">
                {total.toLocaleString()} {total === 1 ? 'position' : 'positions'}
                {activeSectorLabel ? ` in ${activeSectorLabel}` : ''}
                {hasMatches && (
                  <span className="ml-2 text-accent">· AI match scores active</span>
                )}
              </p>
            </div>
            {!hasMatches && (
              <a
                href={`/${locale}/upload`}
                className="sm:ml-auto shrink-0 text-xs px-3 py-1.5 rounded-lg bg-accent/10 text-accent border border-accent/20 hover:bg-accent/20 transition-all"
              >
                Upload CV to see your match scores →
              </a>
            )}
          </div>

          <div className="flex gap-7 items-start">
            {/* Sidebar */}
            <aside className="hidden lg:block w-52 flex-shrink-0 sticky top-[6.5rem]">
              <JobFilters
                locale={locale}
                activeSector={sector}
                activeRemote={remote}
                activeSearch={search}
              />
            </aside>

            {/* Job list */}
            <div className="flex-1 min-w-0">
              <JobsList jobs={jobs} locale={locale} matchMap={matchMap} />

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-8">
                  {currentPage > 1 && (
                    <a
                      href={`/${locale}/jobs?${new URLSearchParams({ ...(sector && { sector }), ...(search && { search }), ...(remote && { remote }), page: String(currentPage - 1) }).toString()}`}
                      className="px-4 py-2 rounded-lg border border-border text-text-muted hover:text-text hover:border-text-dim text-sm transition-all"
                    >
                      ← Prev
                    </a>
                  )}
                  <span className="text-sm text-text-dim px-2">
                    Page {currentPage} of {totalPages}
                  </span>
                  {currentPage < totalPages && (
                    <a
                      href={`/${locale}/jobs?${new URLSearchParams({ ...(sector && { sector }), ...(search && { search }), ...(remote && { remote }), page: String(currentPage + 1) }).toString()}`}
                      className="px-4 py-2 rounded-lg border border-border text-text-muted hover:text-text hover:border-text-dim text-sm transition-all"
                    >
                      Next →
                    </a>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* CTA */}
          {!hasMatches && (
            <div className="mt-14 rounded-xl border border-accent/20 bg-accent/5 p-8 flex flex-col md:flex-row items-center justify-between gap-6">
              <div>
                <p className="font-display text-xl font-normal">See your AI match score on every job</p>
                <p className="text-text-muted text-sm mt-1">
                  Upload your CV once — the engine scores all {total.toLocaleString()} roles and shows your personal fit percentage next to each listing.
                </p>
              </div>
              <a
                href={`/${locale}/upload`}
                className="flex-shrink-0 px-7 py-3 rounded-lg bg-accent text-base-dark font-medium hover:bg-accent-hover transition-all whitespace-nowrap"
              >
                Upload CV & Get Matched
              </a>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
