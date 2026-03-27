import type { JobWithSector } from '@/lib/actions/jobs';
import type { Locale } from '@/lib/i18n';
import { SECTORS } from '@/lib/constants/jobs';

interface Props {
  job: JobWithSector;
  locale: Locale;
  matchScore?: number;
}

const REMOTE_SHORT: Record<string, string> = {
  remote:   'Remote',
  hybrid:   'Hybrid',
  onsite:   'On-site',
  flexible: 'Flexible',
};

function getSectorLabel(skills: string[]): string | null {
  if (!skills?.length) return null;
  const s = SECTORS.find((x) => x.key === skills[0]);
  return s ? s.label : null;
}

function MatchBadge({ score }: { score: number }) {
  const color =
    score >= 95 ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
    : score >= 90 ? 'bg-amber-500/15 text-amber-400 border-amber-500/30'
    : score >= 75 ? 'bg-blue-500/15 text-blue-400 border-blue-500/30'
    : 'bg-surface-raised text-text-dim border-border';

  return (
    <span className={`shrink-0 inline-flex items-center gap-1 px-2 py-0.5 rounded-md border text-[11px] font-semibold tabular-nums ${color}`}>
      {score}% match
    </span>
  );
}

export function JobListRow({ job, locale, matchScore }: Props) {
  const salary = job.salary_min
    ? `${job.salary_currency} ${Math.round(job.salary_min / 1000)}k${job.salary_max ? `–${Math.round(job.salary_max / 1000)}k` : '+'}`
    : null;

  const daysAgo = Math.floor((Date.now() - new Date(job.created_at).getTime()) / 86_400_000);
  const dateLabel = daysAgo === 0 ? 'Today' : daysAgo === 1 ? 'Yesterday' : `${daysAgo}d ago`;

  const sectorLabel = getSectorLabel(job.required_skills);
  const companyInitial = job.company.charAt(0).toUpperCase();

  // For Indeed jobs, clicking goes to Indeed; for internal, goes to detail page
  const href = job.apply_url ?? `/${locale}/jobs/${job.id}`;
  const target = job.apply_url ? '_blank' : '_self';
  const rel = job.apply_url ? 'noopener noreferrer' : undefined;

  return (
    <a
      href={href}
      target={target}
      rel={rel}
      className="group flex items-center gap-4 px-5 py-4 border-b border-border-subtle hover:bg-surface/60 transition-colors"
    >
      {/* Company logo / initial */}
      <div className="w-10 h-10 rounded-lg bg-accent/8 border border-accent/15 flex items-center justify-center flex-shrink-0">
        <span className="font-display text-[15px] font-semibold text-accent">{companyInitial}</span>
      </div>

      {/* Main content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start gap-2 flex-wrap">
          <span className="text-sm font-medium text-text group-hover:text-accent transition-colors leading-snug">
            {job.title}
          </span>
          {matchScore !== undefined && <MatchBadge score={matchScore} />}
        </div>
        <div className="flex items-center gap-2 mt-0.5 flex-wrap text-xs text-text-dim">
          <span className="font-medium text-text-muted">{job.company}</span>
          {job.location && (
            <>
              <span>·</span>
              <span>{job.location}</span>
            </>
          )}
          <span>·</span>
          <span>{REMOTE_SHORT[job.remote_policy] ?? job.remote_policy}</span>
          {sectorLabel && (
            <>
              <span>·</span>
              <span className="text-accent/70">{sectorLabel}</span>
            </>
          )}
          {salary && (
            <>
              <span>·</span>
              <span className="text-text-muted">{salary}</span>
            </>
          )}
        </div>
      </div>

      {/* Skills (desktop) */}
      <div className="hidden md:flex items-center gap-1 shrink-0 max-w-[220px]">
        {job.required_skills.slice(1, 4).map((s) => (
          <span
            key={s}
            className="text-[10px] px-1.5 py-0.5 rounded bg-surface-raised border border-border-subtle text-text-dim whitespace-nowrap"
          >
            {s}
          </span>
        ))}
      </div>

      {/* Date */}
      <span className="text-[11px] text-text-dim shrink-0 w-18 text-right hidden sm:block">
        {dateLabel}
      </span>

      {/* Arrow */}
      <svg
        className="w-4 h-4 text-text-dim group-hover:text-accent transition-colors shrink-0"
        viewBox="0 0 16 16" fill="none"
      >
        <path d="M6 3l5 5-5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </a>
  );
}
