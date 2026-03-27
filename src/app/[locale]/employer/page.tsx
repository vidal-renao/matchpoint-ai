import { Header } from '@/components/layout/Header';
import type { Locale } from '@/lib/i18n';
import type { Metadata } from 'next';

interface Props { params: Promise<{ locale: string }> }

export const metadata: Metadata = {
  title: 'For Employers — MatchPoint AI | Hire Smarter with AI Screening',
  description: 'Stop paying per click. MatchPoint AI pre-screens every candidate automatically. You only meet the people who are genuinely ready to hire.',
};

const PROBLEMS = [
  { stat: '73%', label: 'of job applications are unqualified', icon: '😩' },
  { stat: '23 days', label: 'average time to screen candidates manually', icon: '⏳' },
  { stat: '€4,200', label: 'average cost per bad hire', icon: '💸' },
  { stat: '3×', label: 'more likely to lose top talent during slow hiring', icon: '🏃' },
];

const HOW_IT_WORKS = [
  {
    step: '01',
    title: 'Post your role in 2 minutes',
    body: 'Add a job description, required skills, salary range and culture notes. Our AI understands nuance — no keyword stuffing needed.',
  },
  {
    step: '02',
    title: 'AI screens every applicant automatically',
    body: 'The moment a candidate applies, our engine scores them across Hard Skills, Experience, Culture Fit and Logistics. Zero manual effort.',
  },
  {
    step: '03',
    title: 'Receive only "Ready to Hire" profiles',
    body: 'You get a WhatsApp + email alert when a candidate scores ≥90%. Their full AI analysis, CV and contact are waiting in your dashboard.',
  },
  {
    step: '04',
    title: 'Schedule the interview — and close',
    body: 'No phone screens, no cover letter reading. The AI has done the qualifying. You just decide who gets the offer.',
  },
];

const PRICING = [
  {
    name: 'Starter',
    price: '€199',
    period: '/mo',
    highlight: false,
    features: [
      '3 active job postings',
      'AI screening on all applications',
      'Email alerts for ≥90% matches',
      'Candidate dashboard',
      'CSV export',
    ],
    cta: 'Start free trial',
  },
  {
    name: 'Growth',
    price: '€599',
    period: '/mo',
    highlight: true,
    features: [
      '15 active job postings',
      'WhatsApp + email alerts',
      'Sector analytics dashboard',
      'ATS integration (Greenhouse, Lever)',
      'Priority candidate pool',
      'Dedicated account manager',
    ],
    cta: 'Get started',
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    period: '',
    highlight: false,
    features: [
      'Unlimited job postings',
      'Custom AI scoring dimensions',
      'SSO & GDPR DPA',
      'SLA guarantees',
      'API access',
      'White-label option',
    ],
    cta: 'Contact sales',
  },
];

const TESTIMONIALS = [
  {
    quote: 'We cut time-to-hire from 6 weeks to 9 days. The AI filters out 80% of noise before we see a single CV.',
    name: 'Laura M.',
    role: 'Head of Talent, FinTech startup',
  },
  {
    quote: 'We used to spend 3 hours per role just on first-round screening. MatchPoint eliminated that entirely.',
    name: 'Rafael S.',
    role: 'HR Director, Healthcare group',
  },
  {
    quote: 'The 4-dimension scoring caught culture mismatches we would have missed in a phone screen.',
    name: 'Anna K.',
    role: 'Talent Partner, Tech scale-up',
  },
];

export default async function EmployerPage({ params }: Props) {
  const { locale: raw } = await params;
  const locale = (['en', 'es', 'de'].includes(raw) ? raw : 'es') as Locale;

  return (
    <>
      <Header locale={locale} />
      <div className="relative min-h-screen bg-base text-text font-body antialiased overflow-x-hidden">
        <div className="ambient-glow" />

        {/* ── Hero ── */}
        <section className="relative flex flex-col items-center justify-center min-h-[85vh] text-center px-6 pt-16">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-accent/20 bg-accent/5 mb-8">
            <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
            <span className="text-xs font-medium text-accent tracking-wider uppercase">For Employers · B2B AI Hiring Platform</span>
          </div>

          <h1 className="font-display text-[clamp(2.5rem,6vw,5rem)] font-normal tracking-tight leading-[1.05] max-w-[900px] mb-6">
            Stop reading CVs.<br />
            <span className="text-accent">Let AI hire for you.</span>
          </h1>

          <p className="text-[clamp(1rem,2vw,1.2rem)] text-text-muted max-w-[600px] leading-relaxed mb-10 font-light">
            MatchPoint AI automatically screens every applicant the moment they apply. You only see candidates who score ≥90% — already ranked, scored and ready to meet.
          </p>

          <div className="flex items-center gap-4 flex-wrap justify-center">
            <a href={`/${locale}/signup`}
              className="px-8 py-4 rounded-xl bg-accent text-base font-medium hover:bg-accent-hover transition-all shadow-[0_0_30px_rgba(245,158,11,0.25)] text-[15px]">
              Post your first job free
            </a>
            <a href="#pricing"
              className="px-8 py-4 rounded-xl border border-border text-text-muted hover:text-text hover:border-text-dim transition-all text-[15px]">
              See pricing →
            </a>
          </div>
        </section>

        {/* ── The problem ── */}
        <section className="relative max-w-[1100px] mx-auto px-6 py-24">
          <p className="text-xs uppercase tracking-widest text-text-dim text-center mb-3">The hiring problem</p>
          <h2 className="font-display text-3xl font-normal text-center mb-14 tracking-tight">
            Traditional hiring is broken
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
            {PROBLEMS.map((p) => (
              <div key={p.stat} className="glass rounded-xl p-7 flex flex-col items-center text-center gap-3">
                <span className="text-4xl">{p.icon}</span>
                <span className="font-mono text-3xl font-semibold text-accent">{p.stat}</span>
                <p className="text-xs text-text-muted leading-relaxed">{p.label}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── How it works ── */}
        <section className="relative max-w-[800px] mx-auto px-6 py-20">
          <p className="text-xs uppercase tracking-widest text-text-dim text-center mb-3">The solution</p>
          <h2 className="font-display text-3xl font-normal text-center mb-14 tracking-tight">
            How MatchPoint AI works for employers
          </h2>
          <div className="flex flex-col gap-0">
            {HOW_IT_WORKS.map((s, i) => (
              <div key={s.step} className="flex gap-8 pb-12 last:pb-0 relative">
                {i < HOW_IT_WORKS.length - 1 && (
                  <div className="absolute left-[19px] top-10 bottom-0 w-px bg-gradient-to-b from-accent/30 to-transparent" />
                )}
                <div className="flex-shrink-0 w-10 h-10 rounded-full border border-accent/30 bg-accent/5 flex items-center justify-center">
                  <span className="font-mono text-xs text-accent">{s.step}</span>
                </div>
                <div className="pt-1">
                  <h3 className="font-display text-xl font-normal mb-2">{s.title}</h3>
                  <p className="text-sm text-text-muted leading-relaxed">{s.body}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── Differentiation vs Indeed/Jobs.ch ── */}
        <section className="relative max-w-[1000px] mx-auto px-6 py-16">
          <h2 className="font-display text-2xl font-normal text-center mb-10 tracking-tight">MatchPoint vs traditional job boards</h2>
          <div className="glass rounded-2xl overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border-subtle">
                  <th className="text-left p-5 font-normal text-text-dim">Feature</th>
                  <th className="text-center p-5 font-normal text-text-dim">Indeed / Jobs.ch</th>
                  <th className="text-center p-5 font-medium text-accent">MatchPoint AI</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ['Candidate screening',   'Manual / you do it',  '✓ Fully automated'],
                  ['Pricing model',         'Pay per click/post',  '✓ Pay per role/hire'],
                  ['Time to qualified lead','Days–weeks',          '✓ Under 48 hours'],
                  ['4D scoring',            '✗ Keywords only',     '✓ Skills + Exp + Culture + Logistics'],
                  ['WhatsApp alerts',       '✗',                   '✓ Instant when ≥90%'],
                  ['Culture fit analysis',  '✗',                   '✓ Included'],
                  ['ATS integration',       'Limited',             '✓ Native (Growth+)'],
                ].map(([feat, them, us]) => (
                  <tr key={feat} className="border-b border-border-subtle last:border-0">
                    <td className="p-5 text-text-muted">{feat}</td>
                    <td className="p-5 text-center text-text-dim">{them}</td>
                    <td className="p-5 text-center text-success font-medium">{us}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* ── Testimonials ── */}
        <section className="relative max-w-[1100px] mx-auto px-6 py-16">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {TESTIMONIALS.map((t) => (
              <div key={t.name} className="glass rounded-xl p-7 flex flex-col gap-4">
                <p className="text-sm text-text-muted leading-relaxed italic">&ldquo;{t.quote}&rdquo;</p>
                <div className="mt-auto">
                  <p className="text-sm font-medium text-text">{t.name}</p>
                  <p className="text-xs text-text-dim">{t.role}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── Pricing ── */}
        <section id="pricing" className="relative max-w-[1100px] mx-auto px-6 py-24">
          <p className="text-xs uppercase tracking-widest text-text-dim text-center mb-3">Pricing</p>
          <h2 className="font-display text-3xl font-normal text-center mb-4 tracking-tight">Simple, transparent pricing</h2>
          <p className="text-text-muted text-center mb-14 max-w-[480px] mx-auto text-sm leading-relaxed">
            No pay-per-click. No hidden fees. Post jobs, receive AI-screened candidates, hire faster.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {PRICING.map((plan) => (
              <div
                key={plan.name}
                className={`glass rounded-2xl p-8 flex flex-col gap-5 ${plan.highlight ? 'border-accent/30' : ''}`}
                style={plan.highlight ? { boxShadow: '0 0 0 1px rgba(245,158,11,0.2) inset, 0 0 40px rgba(245,158,11,0.05)' } : {}}
              >
                {plan.highlight && (
                  <span className="text-[10px] uppercase tracking-widest font-semibold text-accent border border-accent/30 px-2.5 py-1 rounded-full w-fit">
                    Most popular
                  </span>
                )}
                <div>
                  <p className="text-text-dim text-sm mb-1">{plan.name}</p>
                  <div className="flex items-baseline gap-1">
                    <span className="font-display text-4xl font-normal text-text">{plan.price}</span>
                    <span className="text-text-dim text-sm">{plan.period}</span>
                  </div>
                </div>

                <ul className="flex flex-col gap-2.5">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2.5 text-sm text-text-muted">
                      <span className="text-success mt-0.5">✓</span>
                      {f}
                    </li>
                  ))}
                </ul>

                <a
                  href={`/${locale}/signup`}
                  className={`mt-auto w-full py-3.5 rounded-xl text-[15px] font-medium text-center transition-all ${
                    plan.highlight
                      ? 'bg-accent text-base hover:bg-accent-hover shadow-[0_0_24px_rgba(245,158,11,0.2)]'
                      : 'border border-border text-text-muted hover:text-text hover:border-text-dim'
                  }`}
                >
                  {plan.cta}
                </a>
              </div>
            ))}
          </div>
        </section>

        {/* ── Final CTA ── */}
        <section className="relative max-w-[700px] mx-auto px-6 py-24 text-center">
          <div className="glass rounded-2xl p-12">
            <h2 className="font-display text-3xl font-normal tracking-tight mb-4">
              Ready to hire 3× faster?
            </h2>
            <p className="text-text-muted mb-8 leading-relaxed max-w-[420px] mx-auto">
              Post your first job free. No credit card. See AI-screened candidates in your inbox within 48 hours.
            </p>
            <a href={`/${locale}/signup`}
              className="inline-flex items-center gap-2 px-10 py-4 rounded-xl bg-accent text-base font-medium hover:bg-accent-hover transition-all text-[15px]">
              Post a job free
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </a>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-border-subtle py-8 px-6">
          <div className="max-w-[1100px] mx-auto flex items-center justify-between flex-wrap gap-4">
            <span className="font-display text-sm text-text-dim">MatchPoint AI</span>
            <span className="text-xs text-text-dim">Built with Claude Sonnet 4.6 · Next.js · Supabase · © 2025</span>
          </div>
        </footer>
      </div>
    </>
  );
}
