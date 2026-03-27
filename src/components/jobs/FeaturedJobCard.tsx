import type { JobWithSector } from '@/lib/actions/jobs';
import type { Locale } from '@/lib/i18n';

interface Props {
  job: JobWithSector;
  locale: Locale;
}

const REMOTE_LABELS: Record<string, string> = {
  remote: '🌐 Remote',
  hybrid: '🏠 Hybrid',
  onsite: '🏢 On-site',
  flexible: '🔄 Flexible',
};

export function FeaturedJobCard({ job, locale }: Props) {
  const salary = job.salary_min
    ? `${job.salary_currency} ${Math.round(job.salary_min / 1000)}k${job.salary_max ? `–${Math.round(job.salary_max / 1000)}k` : '+'}`
    : null;

  const postedDaysAgo = Math.floor(
    (Date.now() - new Date(job.created_at).getTime()) / 86_400_000
  );

  return (
    <a
      href={`/${locale}/jobs/${job.id}`}
      className="glass rounded-xl p-6 flex flex-col gap-4 hover:border-accent/25 transition-all group"
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="w-10 h-10 rounded-lg bg-accent/10 border border-accent/20 flex items-center justify-center flex-shrink-0">
          <span className="font-display text-base font-semibold text-accent">
            {job.company.charAt(0).toUpperCase()}
          </span>
        </div>
        <span className="text-[10px] text-text-dim ml-auto">
          {postedDaysAgo === 0 ? 'Today' : `${postedDaysAgo}d ago`}
        </span>
      </div>

      {/* Title */}
      <div>
        <h3 className="font-display text-[15px] font-normal text-text group-hover:text-accent transition-colors leading-snug">
          {job.title}
        </h3>
        <p className="text-sm text-text-muted mt-0.5">{job.company}</p>
      </div>

      {/* Tags */}
      <div className="flex flex-wrap gap-1.5">
        {job.location && (
          <span className="text-[11px] px-2 py-0.5 rounded-md bg-surface-raised border border-border-subtle text-text-muted">
            📍 {job.location}
          </span>
        )}
        <span className="text-[11px] px-2 py-0.5 rounded-md bg-surface-raised border border-border-subtle text-text-muted">
          {REMOTE_LABELS[job.remote_policy] ?? job.remote_policy}
        </span>
        {salary && (
          <span className="text-[11px] px-2 py-0.5 rounded-md bg-accent/8 border border-accent/15 text-accent">
            {salary}
          </span>
        )}
      </div>

      {/* Skills preview */}
      {job.required_skills?.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {job.required_skills.slice(0, 3).map((s) => (
            <span key={s} className="text-[10px] px-2 py-0.5 rounded bg-surface-raised text-text-dim border border-border-subtle">
              {s}
            </span>
          ))}
          {job.required_skills.length > 3 && (
            <span className="text-[10px] px-2 py-0.5 rounded bg-surface-raised text-text-dim border border-border-subtle">
              +{job.required_skills.length - 3}
            </span>
          )}
        </div>
      )}

      {/* CTA */}
      <div className="mt-auto pt-1">
        <span className="text-xs text-accent group-hover:underline">View & Apply →</span>
      </div>
    </a>
  );
}
