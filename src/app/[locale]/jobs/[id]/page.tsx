import { Header } from '@/components/layout/Header';
import { getJobById } from '@/lib/actions/jobs';
import { createClient } from '@/lib/supabase/server';
import { getCandidateByUserId } from '@/lib/actions/candidates';
import { JobApplyButton } from '@/components/jobs/JobApplyButton';
import type { Locale } from '@/lib/i18n';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

interface Props {
  params: Promise<{ locale: string; id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const job = await getJobById(id);
  if (!job) return { title: 'Job not found — MatchPoint AI' };
  return {
    title: `${job.title} at ${job.company} — MatchPoint AI`,
    description: job.description.slice(0, 160),
    openGraph: {
      title: `${job.title} — ${job.company}`,
      description: job.description.slice(0, 160),
    },
  };
}

const REMOTE_LABELS: Record<string, string> = {
  remote: '🌐 Fully Remote',
  hybrid: '🏠 Hybrid',
  onsite: '🏢 On-site',
  flexible: '🔄 Flexible',
};

export default async function JobDetailPage({ params }: Props) {
  const { locale: raw, id } = await params;
  const locale = ((['en', 'es', 'de', 'it'].includes(raw) ? raw : 'es')) as Locale;

  const job = await getJobById(id);
  if (!job) notFound();

  // Resolve auth state (no redirect — public page)
  let candidateId: string | null = null;
  let isLoggedIn = false;
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      isLoggedIn = true;
      const candidate = await getCandidateByUserId(user.id);
      if (candidate) candidateId = candidate.id;
    }
  } catch { /* not authenticated */ }

  const salary = job.salary_min
    ? `${job.salary_currency} ${Math.round(job.salary_min / 1000)}k${job.salary_max ? `–${Math.round(job.salary_max / 1000)}k` : '+'}`
    : null;

  // JSON-LD structured data for Google Jobs
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'JobPosting',
    title: job.title,
    description: job.description,
    hiringOrganization: { '@type': 'Organization', name: job.company },
    jobLocation: job.location
      ? { '@type': 'Place', address: { '@type': 'PostalAddress', addressLocality: job.location } }
      : undefined,
    employmentType: job.remote_policy === 'remote' ? 'TELECOMMUTE' : 'FULL_TIME',
    datePosted: job.created_at.split('T')[0],
    ...(job.salary_min ? {
      baseSalary: {
        '@type': 'MonetaryAmount',
        currency: job.salary_currency,
        value: { '@type': 'QuantitativeValue', minValue: job.salary_min, maxValue: job.salary_max ?? job.salary_min, unitText: 'YEAR' },
      },
    } : {}),
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Header locale={locale} />
      <div className="relative min-h-screen bg-base text-text font-body antialiased">
        <div className="ambient-glow" />
        <div className="max-w-[900px] mx-auto px-6 pt-24 pb-20">

          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-xs text-text-dim mb-8">
            <a href={`/${locale}/jobs`} className="hover:text-text-muted transition-colors">Jobs</a>
            <span>/</span>
            <span className="text-text-muted truncate">{job.title}</span>
          </nav>

          <div className="flex flex-col lg:flex-row gap-8 items-start">
            {/* Main content */}
            <div className="flex-1 min-w-0">
              {/* Job header */}
              <div className="glass rounded-2xl p-8 mb-6">
                <div className="flex items-start gap-5">
                  <div className="w-14 h-14 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center flex-shrink-0">
                    <span className="font-display text-xl font-semibold text-accent">
                      {job.company.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h1 className="font-display text-2xl font-normal tracking-tight mb-1">{job.title}</h1>
                    <p className="text-accent font-medium">{job.company}</p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 mt-5">
                  {job.location && (
                    <span className="text-xs px-3 py-1.5 rounded-lg bg-surface-raised border border-border-subtle text-text-muted">
                      📍 {job.location}
                    </span>
                  )}
                  <span className="text-xs px-3 py-1.5 rounded-lg bg-surface-raised border border-border-subtle text-text-muted">
                    {REMOTE_LABELS[job.remote_policy] ?? job.remote_policy}
                  </span>
                  {job.experience_years && (
                    <span className="text-xs px-3 py-1.5 rounded-lg bg-surface-raised border border-border-subtle text-text-muted">
                      📅 {job.experience_years}+ years exp.
                    </span>
                  )}
                  {salary && (
                    <span className="text-xs px-3 py-1.5 rounded-lg bg-accent/8 border border-accent/15 text-accent">
                      💰 {salary}
                    </span>
                  )}
                </div>
              </div>

              {/* Description */}
              <div className="glass rounded-2xl p-8 mb-6">
                <h2 className="font-display text-lg font-normal mb-4">About the role</h2>
                <div className="text-sm text-text-muted leading-relaxed whitespace-pre-wrap">
                  {job.description}
                </div>
              </div>

              {/* Required skills */}
              {job.required_skills?.length > 0 && (
                <div className="glass rounded-2xl p-8 mb-6">
                  <h2 className="font-display text-lg font-normal mb-4">Required skills</h2>
                  <div className="flex flex-wrap gap-2">
                    {job.required_skills.map((skill) => (
                      <span key={skill} className="text-sm px-3 py-1.5 rounded-full bg-accent/8 text-accent border border-accent/15">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Culture */}
              {job.company_culture && (
                <div className="glass rounded-2xl p-8">
                  <h2 className="font-display text-lg font-normal mb-3">Company culture</h2>
                  <p className="text-sm text-text-muted leading-relaxed">{job.company_culture}</p>
                </div>
              )}
            </div>

            {/* Sticky sidebar: apply */}
            <div className="lg:w-72 flex-shrink-0 lg:sticky lg:top-24">
              <div className="glass rounded-2xl p-6 flex flex-col gap-4">
                <div>
                  <p className="text-xs uppercase tracking-widest text-text-dim mb-1">AI Match Score</p>
                  <p className="text-sm text-text-muted">
                    {candidateId
                      ? 'Apply and get instantly scored against this role.'
                      : isLoggedIn
                      ? 'Upload your CV to see how well you match this role before applying.'
                      : 'Create a free account to apply. AI scores you instantly.'}
                  </p>
                </div>

                <JobApplyButton
                  jobId={job.id}
                  candidateId={candidateId}
                  locale={locale}
                  isLoggedIn={isLoggedIn}
                />

                <div className="border-t border-border-subtle pt-4 flex flex-col gap-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-text-dim">AI screening</span>
                    <span className="text-success">✓ Automated</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-text-dim">Response time</span>
                    <span className="text-text-muted">Within 48h</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-text-dim">Posted</span>
                    <span className="text-text-muted">
                      {new Date(job.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                    </span>
                  </div>
                </div>
              </div>

              {/* Similar jobs link */}
              <a
                href={`/${locale}/jobs`}
                className="mt-3 block text-center text-xs text-text-dim hover:text-text-muted transition-colors py-3"
              >
                ← Browse more jobs
              </a>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
