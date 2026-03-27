import { Header } from '@/components/layout/Header';
import { type Locale } from '@/lib/i18n';
import { motion } from 'framer-motion';

interface Props {
  params: Promise<{ locale: string }>;
}

const FEATURES = [
  {
    icon: '◈',
    title: '4-Dimensional Analysis',
    body: 'Every match scored across Hard Skills (40%), Experience (30%), Culture (15%) and Logistics (15%) — the dimensions that actually predict job success.',
  },
  {
    icon: '◎',
    title: 'Instant CV Parsing',
    body: 'Upload a PDF or image. Claude Sonnet 4.6 reads your entire career history, extracts skills, seniority and contact data in seconds.',
  },
  {
    icon: '◉',
    title: 'Smart Pipeline',
    body: 'Track every application from first match through to offer. Employers only reach the final meeting when you\'ve already cleared two AI-powered filters.',
  },
];

const STEPS = [
  { n: '01', title: 'Upload your CV', body: 'Drop a PDF or image. No forms to fill in — the AI reads everything.' },
  { n: '02', title: 'AI finds your matches', body: 'The dimensional engine scores every active role and ranks them by true fit, not keyword overlap.' },
  { n: '03', title: 'Track your pipeline', body: 'Watch your applications move from match → shortlist → interview → offer in real time.' },
];

export default async function LandingPage({ params }: Props) {
  const { locale: raw } = await params;
  const locale = (['en', 'es', 'de'].includes(raw) ? raw : 'es') as Locale;

  return (
    <>
      <Header locale={locale} />
      <div className="relative min-h-screen bg-base text-text font-body antialiased overflow-x-hidden">
        <div className="ambient-glow" />

        {/* ── Hero ── */}
        <section className="relative flex flex-col items-center justify-center min-h-screen text-center px-6 pt-14">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-accent/20 bg-accent/5 mb-8">
            <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
            <span className="text-xs font-medium text-accent tracking-wider uppercase">Powered by Claude Sonnet 4.6</span>
          </div>

          <h1 className="font-display text-[clamp(2.5rem,7vw,5.5rem)] font-normal tracking-tight leading-[1.05] max-w-[900px] mb-6">
            Your career, matched<br />
            <span className="text-accent">by intelligence</span>
          </h1>

          <p className="text-[clamp(1rem,2vw,1.2rem)] text-text-muted max-w-[560px] leading-relaxed mb-10 font-light">
            Upload your CV once. Let AI compare your profile across every active role and surface the positions where you&apos;ll genuinely excel.
          </p>

          <div className="flex items-center gap-4 flex-wrap justify-center">
            <a
              href={`/${locale}/signup`}
              className="px-8 py-3.5 rounded-[var(--radius-sm)] bg-accent text-base font-medium hover:bg-accent-hover hover:-translate-y-px transition-all shadow-[0_0_30px_rgba(245,158,11,0.2)]"
            >
              Get started free
            </a>
            <a
              href={`/${locale}/login`}
              className="px-8 py-3.5 rounded-[var(--radius-sm)] border border-border text-text-muted hover:text-text hover:border-text-dim transition-all"
            >
              Sign in
            </a>
          </div>

          {/* Score preview */}
          <div className="mt-20 flex items-center gap-3 flex-wrap justify-center">
            {[
              { label: 'Hard Skills', score: 92, color: '#f59e0b' },
              { label: 'Experience', score: 87, color: '#3B82F6' },
              { label: 'Culture', score: 78, color: '#22C55E' },
              { label: 'Logistics', score: 95, color: '#a78bfa' },
            ].map(({ label, score, color }) => (
              <div key={label} className="glass rounded-xl px-4 py-3 flex items-center gap-3 min-w-[140px]">
                <div className="w-8 h-8 rounded-full border-2 flex items-center justify-center" style={{ borderColor: color }}>
                  <span className="font-mono text-[10px] font-medium" style={{ color }}>{score}</span>
                </div>
                <span className="text-xs text-text-muted">{label}</span>
              </div>
            ))}
          </div>
        </section>

        {/* ── Features ── */}
        <section className="relative max-w-[1100px] mx-auto px-6 py-32">
          <p className="text-xs uppercase tracking-widest text-text-dim text-center mb-3">Why MatchPoint</p>
          <h2 className="font-display text-4xl font-normal text-center mb-16 tracking-tight">
            Built different
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {FEATURES.map((f) => (
              <div key={f.title} className="glass rounded-[var(--radius-card)] p-8 flex flex-col gap-4">
                <span className="text-3xl text-accent">{f.icon}</span>
                <h3 className="font-display text-xl font-normal">{f.title}</h3>
                <p className="text-sm text-text-muted leading-relaxed">{f.body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── How it works ── */}
        <section className="relative max-w-[800px] mx-auto px-6 py-20">
          <p className="text-xs uppercase tracking-widest text-text-dim text-center mb-3">The process</p>
          <h2 className="font-display text-4xl font-normal text-center mb-16 tracking-tight">
            Three steps to your next role
          </h2>
          <div className="flex flex-col gap-0">
            {STEPS.map((s, i) => (
              <div key={s.n} className="flex gap-8 pb-12 last:pb-0 relative">
                {i < STEPS.length - 1 && (
                  <div className="absolute left-[19px] top-10 bottom-0 w-px bg-gradient-to-b from-border to-transparent" />
                )}
                <div className="flex-shrink-0 w-10 h-10 rounded-full border border-accent/30 bg-accent/5 flex items-center justify-center">
                  <span className="font-mono text-xs text-accent">{s.n}</span>
                </div>
                <div className="pt-1">
                  <h3 className="font-display text-xl font-normal mb-2">{s.title}</h3>
                  <p className="text-sm text-text-muted leading-relaxed">{s.body}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── CTA ── */}
        <section className="relative max-w-[600px] mx-auto px-6 py-32 text-center">
          <div className="glass rounded-[var(--radius-card)] p-12">
            <h2 className="font-display text-3xl font-normal tracking-tight mb-4">
              Ready to find your match?
            </h2>
            <p className="text-text-muted mb-8 leading-relaxed">
              Free to use. No credit card required. Your CV never leaves our secure pipeline.
            </p>
            <a
              href={`/${locale}/signup`}
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-[var(--radius-sm)] bg-accent text-base font-medium hover:bg-accent-hover transition-all"
            >
              Start matching
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </a>
          </div>
        </section>

        {/* ── Footer ── */}
        <footer className="border-t border-border-subtle py-8 px-6">
          <div className="max-w-[1100px] mx-auto flex items-center justify-between flex-wrap gap-4">
            <span className="font-display text-sm text-text-dim">MatchPoint AI</span>
            <span className="text-xs text-text-dim">Built with Claude Sonnet 4.6 · Next.js 16 · Supabase</span>
          </div>
        </footer>
      </div>
    </>
  );
}
