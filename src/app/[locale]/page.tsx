import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { getFeaturedJobs, getJobCountBySector } from '@/lib/actions/jobs';
import { SECTORS } from '@/lib/constants/jobs';
import { LandingSearch } from '@/components/jobs/LandingSearch';
import { JobListRow } from '@/components/jobs/JobListRow';
import type { Locale } from '@/lib/i18n';
import type { Metadata } from 'next';

interface Props { params: Promise<{ locale: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale: raw } = await params;
  const locale = ((['en', 'es', 'de', 'it'].includes(raw) ? raw : 'es')) as Locale;
  return {
    title: 'MatchPoint AI — Find Your Perfect Job, Matched by Intelligence',
    description: 'AI-powered job board. Upload your CV once and get automatically matched to roles across Technology, Finance, Healthcare and more.',
    openGraph: {
      title: 'MatchPoint AI — Jobs Matched by Intelligence',
      description: 'The AI job board that finds the right fit — not just keywords.',
      type: 'website',
    },
  };
}

const HOW_ITEMS = [
  {
    step: '01',
    title: 'Upload your CV',
    body: 'Claude Sonnet 4.6 extracts every skill, role, and achievement in seconds. No forms.',
  },
  {
    step: '02',
    title: 'AI scores every job',
    body: 'Hard Skills · Experience · Culture · Logistics — four real dimensions, not keyword counts.',
  },
  {
    step: '03',
    title: 'See your match %',
    body: 'Every listing shows your personal AI match score. Sort, filter, and apply with one click.',
  },
  {
    step: '04',
    title: 'Employer gets notified',
    body: 'When you hit ≥90%, the system alerts the recruiter automatically. No chasing needed.',
  },
];

const TRUST_LOGOS = ['Accenture', 'Deloitte', 'Roche', 'Siemens', 'Nestlé', 'ABB', 'Swiss Re', 'UBS'];

export default async function LandingPage({ params }: Props) {
  const { locale: raw } = await params;
  const locale = ((['en', 'es', 'de', 'it'].includes(raw) ? raw : 'es')) as Locale;

  const [featuredJobs, sectorCounts] = await Promise.all([
    getFeaturedJobs(8),
    getJobCountBySector(),
  ]);

  const totalJobs = Object.values(sectorCounts).reduce((a, b) => a + b, 0);

  return (
    <>
      <Header locale={locale} />
      <div className="relative min-h-screen bg-base text-text font-body antialiased overflow-x-hidden">
        <div className="ambient-glow" />

        {/* ── Hero ── */}
        <section className="relative flex flex-col items-center justify-center min-h-[82vh] text-center px-6 pt-20">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-accent/25 bg-accent/8 mb-7">
            <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
            <span className="text-[11px] font-medium text-accent tracking-wider uppercase">
              AI-Powered · {totalJobs > 0 ? `${totalJobs}+ jobs` : 'Real market jobs'} · Daily updates
            </span>
          </div>

          <h1 className="font-display text-[clamp(2.6rem,6.5vw,5rem)] font-normal tracking-tight leading-[1.06] max-w-[880px] mb-5">
            Find your next role<br />
            <span className="text-accent">matched by intelligence</span>
          </h1>

          <p className="text-[clamp(0.95rem,1.8vw,1.1rem)] text-text-muted max-w-[540px] leading-relaxed mb-9 font-light">
            Real jobs from the Swiss & European market. Upload your CV once — AI scores every role
            and shows your personal match percentage on every listing.
          </p>

          <LandingSearch locale={locale} />

          {/* Stats */}
          <div className="mt-12 flex items-center gap-10 flex-wrap justify-center">
            {[
              { value: `${totalJobs > 0 ? totalJobs : 50}+`, label: 'Market jobs' },
              { value: '10', label: 'Sectors' },
              { value: '94%', label: 'Match accuracy' },
              { value: '48h', label: 'Avg. to interview' },
            ].map((s) => (
              <div key={s.label} className="flex flex-col items-center gap-0.5">
                <span className="font-mono text-2xl font-semibold text-accent">{s.value}</span>
                <span className="text-[10px] text-text-dim uppercase tracking-widest">{s.label}</span>
              </div>
            ))}
          </div>
        </section>

        {/* ── Sector navigation ── */}
        <section className="border-y border-border-subtle bg-surface/30">
          <div className="max-w-[1200px] mx-auto px-6">
            <div className="flex items-center overflow-x-auto gap-0 scrollbar-hide">
              {SECTORS.map((s) => {
                const count = sectorCounts[s.key] ?? 0;
                return (
                  <a
                    key={s.key}
                    href={`/${locale}/jobs?sector=${s.key}`}
                    className="flex-shrink-0 flex flex-col items-center gap-1 px-5 py-4 border-r border-border-subtle hover:bg-accent/5 transition-colors group"
                  >
                    <span className="text-xl group-hover:scale-110 transition-transform">{s.icon}</span>
                    <span className="text-[11px] font-medium text-text-muted group-hover:text-accent transition-colors whitespace-nowrap">
                      {s.label}
                    </span>
                    {count > 0 && (
                      <span className="text-[9px] text-text-dim font-mono">{count} jobs</span>
                    )}
                  </a>
                );
              })}
            </div>
          </div>
        </section>

        {/* ── Latest jobs (list style) ── */}
        {featuredJobs.length > 0 && (
          <section className="max-w-[1000px] mx-auto px-6 py-16">
            <div className="flex items-baseline justify-between mb-5">
              <div>
                <h2 className="font-display text-2xl font-normal tracking-tight">Latest openings</h2>
                <p className="text-xs text-text-dim mt-0.5">Real positions updated daily from the market</p>
              </div>
              <a
                href={`/${locale}/jobs`}
                className="text-xs text-accent hover:text-accent-hover transition-colors flex items-center gap-1"
              >
                View all jobs
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <path d="M2.5 6h7M7 3.5L9.5 6 7 8.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </a>
            </div>

            <div className="border border-border-subtle rounded-xl overflow-hidden">
              {featuredJobs.map((job) => (
                <JobListRow key={job.id} job={job} locale={locale} />
              ))}
            </div>

            <div className="mt-6 text-center">
              <a
                href={`/${locale}/upload`}
                className="inline-flex items-center gap-2 text-sm text-text-muted hover:text-accent transition-colors"
              >
                <span className="w-4 h-4 rounded-full bg-accent/10 border border-accent/20 flex items-center justify-center text-accent text-[9px]">+</span>
                Upload your CV to unlock AI match scores on all listings
              </a>
            </div>
          </section>
        )}

        {/* ── How it works ── */}
        <section className="border-t border-border-subtle py-16">
          <div className="max-w-[1000px] mx-auto px-6">
            <h2 className="font-display text-2xl font-normal tracking-tight text-center mb-10">
              From CV upload to offer — fully automated
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-px bg-border-subtle border border-border-subtle rounded-xl overflow-hidden">
              {HOW_ITEMS.map((item) => (
                <div key={item.step} className="bg-surface p-6 flex flex-col gap-3">
                  <span className="font-mono text-xs text-accent/60">{item.step}</span>
                  <h3 className="font-display text-base font-normal text-text">{item.title}</h3>
                  <p className="text-sm text-text-muted leading-relaxed">{item.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Trust logos ── */}
        <section className="border-t border-border-subtle py-12">
          <div className="max-w-[1000px] mx-auto px-6">
            <p className="text-[10px] uppercase tracking-widest text-text-dim text-center mb-6">
              Companies using MatchPoint
            </p>
            <div className="flex flex-wrap justify-center gap-x-10 gap-y-4">
              {TRUST_LOGOS.map((co) => (
                <span key={co} className="font-display text-sm text-text-dim/40">{co}</span>
              ))}
            </div>
          </div>
        </section>

        {/* ── Dual CTA ── */}
        <section className="border-t border-border-subtle py-16">
          <div className="max-w-[800px] mx-auto px-6 text-center">
            <h2 className="font-display text-3xl font-normal tracking-tight mb-3">
              Ready to find your perfect match?
            </h2>
            <p className="text-text-muted mb-8 max-w-[440px] mx-auto text-sm leading-relaxed">
              Upload your CV and get your first AI-scored matches in under 2 minutes.
              No account needed to browse — sign up only to apply.
            </p>
            <div className="flex items-center gap-4 justify-center flex-wrap">
              <a
                href={`/${locale}/signup`}
                className="inline-flex items-center gap-2 px-7 py-3 rounded-lg bg-accent text-base-dark font-medium hover:bg-accent-hover transition-all"
              >
                Get started free
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M3 7h8M8 4l3 3-3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </a>
              <a
                href={`/${locale}/employer`}
                className="inline-flex items-center gap-2 px-7 py-3 rounded-lg border border-border text-text-muted hover:text-text hover:border-text-dim transition-all text-sm"
              >
                For employers →
              </a>
            </div>
          </div>
        </section>

        <Footer locale={locale} />
      </div>
    </>
  );
}
