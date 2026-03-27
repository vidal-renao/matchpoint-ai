import { Header } from '@/components/layout/Header';
import { getFeaturedJobs, getJobCountBySector } from '@/lib/actions/jobs';
import { SECTORS } from '@/lib/constants/jobs';
import { LandingSearch } from '@/components/jobs/LandingSearch';
import { FeaturedJobCard } from '@/components/jobs/FeaturedJobCard';
import type { Locale } from '@/lib/i18n';
import type { Metadata } from 'next';

interface Props { params: Promise<{ locale: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale: raw } = await params;
  const locale = (['en', 'es', 'de'].includes(raw) ? raw : 'es') as Locale;
  return {
    title: 'MatchPoint AI — Find Your Perfect Job, Matched by Intelligence',
    description: 'AI-powered job board. Upload your CV once and get automatically matched to roles across Technology, Finance, Healthcare and more. No forms, no keyword hunting — pure intelligence.',
    openGraph: {
      title: 'MatchPoint AI — Jobs Matched by Intelligence',
      description: 'The AI job board that finds the right fit — not just keywords.',
      type: 'website',
    },
  };
}

const STATS = [
  { value: '12,400+', label: 'Active jobs' },
  { value: '340+',    label: 'Companies hiring' },
  { value: '94%',     label: 'Match accuracy' },
  { value: '48h',     label: 'Avg. to first interview' },
];

const WHY_ITEMS = [
  {
    icon: '◈',
    title: 'AI reads your CV in 8 seconds',
    body: 'Upload once. Claude Sonnet 4.6 extracts every skill, role and achievement — no forms, no manual tagging.',
  },
  {
    icon: '◎',
    title: 'Scored across 4 real dimensions',
    body: 'Hard Skills · Experience · Culture · Logistics. Every role gets a weighted score, not a keyword count.',
  },
  {
    icon: '◉',
    title: 'Automated pipeline — you just show up',
    body: 'When you clear 90%+ the system notifies the employer automatically. No chasing, no follow-ups.',
  },
  {
    icon: '⬡',
    title: 'Employers only see ready candidates',
    body: 'Companies using MatchPoint receive pre-screened, scored profiles — cutting hiring time by 70%.',
  },
];

export default async function LandingPage({ params }: Props) {
  const { locale: raw } = await params;
  const locale = (['en', 'es', 'de'].includes(raw) ? raw : 'es') as Locale;

  const [featuredJobs, sectorCounts] = await Promise.all([
    getFeaturedJobs(6),
    getJobCountBySector(),
  ]);

  return (
    <>
      <Header locale={locale} />
      <div className="relative min-h-screen bg-base text-text font-body antialiased overflow-x-hidden">
        <div className="ambient-glow" />

        {/* ── Hero ── */}
        <section className="relative flex flex-col items-center justify-center min-h-[88vh] text-center px-6 pt-16">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-accent/20 bg-accent/5 mb-8">
            <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
            <span className="text-xs font-medium text-accent tracking-wider uppercase">AI-Powered · All Sectors · Daily Fresh Jobs</span>
          </div>

          <h1 className="font-display text-[clamp(2.8rem,7vw,5.5rem)] font-normal tracking-tight leading-[1.05] max-w-[960px] mb-5">
            Find your next role<br />
            <span className="text-accent">matched by intelligence</span>
          </h1>

          <p className="text-[clamp(1rem,2vw,1.2rem)] text-text-muted max-w-[580px] leading-relaxed mb-10 font-light">
            Browse thousands of jobs across every sector. Upload your CV once — AI scores every role and surfaces only the positions where you genuinely fit.
          </p>

          {/* Search bar */}
          <LandingSearch locale={locale} />

          {/* Stats strip */}
          <div className="mt-14 flex items-center gap-8 flex-wrap justify-center">
            {STATS.map((s) => (
              <div key={s.label} className="flex flex-col items-center gap-1">
                <span className="font-mono text-2xl font-semibold text-accent">{s.value}</span>
                <span className="text-xs text-text-dim uppercase tracking-widest">{s.label}</span>
              </div>
            ))}
          </div>
        </section>

        {/* ── Sector Categories ── */}
        <section className="relative max-w-[1200px] mx-auto px-6 py-20">
          <p className="text-xs uppercase tracking-widest text-text-dim text-center mb-3">Browse by sector</p>
          <h2 className="font-display text-3xl font-normal text-center mb-10 tracking-tight">Every industry, one platform</h2>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
            {SECTORS.map((sector) => {
              const count = sectorCounts[sector.key] ?? 0;
              return (
                <a
                  key={sector.key}
                  href={`/${locale}/jobs?sector=${sector.key}`}
                  className="glass rounded-xl p-5 flex flex-col items-center gap-2 text-center hover:border-accent/30 transition-all group"
                >
                  <span className="text-3xl group-hover:scale-110 transition-transform">{sector.icon}</span>
                  <span className="text-sm font-medium text-text group-hover:text-accent transition-colors">{sector.label}</span>
                  {count > 0 && (
                    <span className="text-xs text-text-dim font-mono">{count} jobs</span>
                  )}
                </a>
              );
            })}
          </div>
        </section>

        {/* ── Featured Jobs ── */}
        {featuredJobs.length > 0 && (
          <section className="relative max-w-[1200px] mx-auto px-6 py-12">
            <div className="flex items-center justify-between mb-8">
              <div>
                <p className="text-xs uppercase tracking-widest text-text-dim mb-1">Latest openings</p>
                <h2 className="font-display text-3xl font-normal tracking-tight">Today&apos;s featured jobs</h2>
              </div>
              <a href={`/${locale}/jobs`} className="text-sm text-accent hover:text-accent-hover transition-colors flex items-center gap-1">
                View all
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M3 7h8M8 4l3 3-3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </a>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {featuredJobs.map((job) => (
                <FeaturedJobCard key={job.id} job={job} locale={locale} />
              ))}
            </div>
          </section>
        )}

        {/* ── How it works ── */}
        <section className="relative max-w-[900px] mx-auto px-6 py-24">
          <p className="text-xs uppercase tracking-widest text-text-dim text-center mb-3">The process</p>
          <h2 className="font-display text-3xl font-normal text-center mb-14 tracking-tight">
            From CV to offer — fully automated
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {WHY_ITEMS.map((item, i) => (
              <div key={i} className="glass rounded-xl p-7 flex flex-col gap-3">
                <span className="text-2xl text-accent">{item.icon}</span>
                <h3 className="font-display text-lg font-normal">{item.title}</h3>
                <p className="text-sm text-text-muted leading-relaxed">{item.body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── Social proof / trust ── */}
        <section className="relative max-w-[1000px] mx-auto px-6 py-16">
          <div className="glass rounded-2xl p-10 md:p-14 text-center">
            <p className="text-xs uppercase tracking-widest text-text-dim mb-4">Trusted by leading companies</p>
            <div className="flex flex-wrap justify-center gap-8 mb-10 opacity-40">
              {['Accenture', 'Deloitte', 'Santander', 'Roche', 'Siemens', 'Nestlé'].map((co) => (
                <span key={co} className="font-display text-lg text-text">{co}</span>
              ))}
            </div>
            <h2 className="font-display text-3xl font-normal tracking-tight mb-4">
              Ready to find your perfect match?
            </h2>
            <p className="text-text-muted mb-8 max-w-[480px] mx-auto leading-relaxed">
              Join 40,000+ professionals who let AI do the heavy lifting. Upload your CV and get your first matches in under 2 minutes.
            </p>
            <div className="flex items-center gap-4 justify-center flex-wrap">
              <a href={`/${locale}/signup`}
                className="inline-flex items-center gap-2 px-8 py-3.5 rounded-lg bg-accent text-base font-medium hover:bg-accent-hover transition-all shadow-[0_0_30px_rgba(245,158,11,0.2)]">
                Get started free
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </a>
              <a href={`/${locale}/employer`}
                className="inline-flex items-center gap-2 px-8 py-3.5 rounded-lg border border-border text-text-muted hover:text-text hover:border-text-dim transition-all">
                I&apos;m an employer →
              </a>
            </div>
          </div>
        </section>

        {/* ── Footer ── */}
        <footer className="border-t border-border-subtle py-10 px-6">
          <div className="max-w-[1200px] mx-auto">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
              <div>
                <p className="font-display text-sm text-text-dim mb-3">For Candidates</p>
                <div className="flex flex-col gap-2">
                  {['Browse Jobs', 'Upload CV', 'My Matches', 'Applications'].map((l) => (
                    <a key={l} href="#" className="text-xs text-text-dim hover:text-text-muted transition-colors">{l}</a>
                  ))}
                </div>
              </div>
              <div>
                <p className="font-display text-sm text-text-dim mb-3">For Employers</p>
                <div className="flex flex-col gap-2">
                  {['Post a Job', 'AI Screening', 'Pricing', 'Enterprise'].map((l) => (
                    <a key={l} href={`/${locale}/employer`} className="text-xs text-text-dim hover:text-text-muted transition-colors">{l}</a>
                  ))}
                </div>
              </div>
              <div>
                <p className="font-display text-sm text-text-dim mb-3">Sectors</p>
                <div className="flex flex-col gap-2">
                  {SECTORS.slice(0, 4).map((s) => (
                    <a key={s.key} href={`/${locale}/jobs?sector=${s.key}`} className="text-xs text-text-dim hover:text-text-muted transition-colors">{s.label}</a>
                  ))}
                </div>
              </div>
              <div>
                <p className="font-display text-sm text-text-dim mb-3">Company</p>
                <div className="flex flex-col gap-2">
                  {['About', 'Privacy', 'Terms', 'Contact'].map((l) => (
                    <a key={l} href="#" className="text-xs text-text-dim hover:text-text-muted transition-colors">{l}</a>
                  ))}
                </div>
              </div>
            </div>
            <div className="border-t border-border-subtle pt-6 flex flex-wrap items-center justify-between gap-3">
              <span className="font-display text-sm text-text-dim">MatchPoint AI</span>
              <span className="text-xs text-text-dim">Built with Claude Sonnet 4.6 · Next.js · Supabase · © 2025</span>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}
