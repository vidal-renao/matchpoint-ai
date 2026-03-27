import { JobListRow } from './JobListRow';
import type { JobWithSector } from '@/lib/actions/jobs';
import type { Locale } from '@/lib/i18n';

interface Props {
  jobs: JobWithSector[];
  locale: Locale;
  matchMap?: Record<string, number>;
}

export function JobsList({ jobs, locale, matchMap = {} }: Props) {
  if (jobs.length === 0) {
    return (
      <div className="flex flex-col items-center gap-4 py-24 text-center border border-border-subtle rounded-xl">
        <div className="w-14 h-14 rounded-full border border-border flex items-center justify-center opacity-30">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.5" />
            <path d="M16.5 16.5l4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </div>
        <div>
          <p className="font-display text-lg text-text-muted">No jobs found</p>
          <p className="text-sm text-text-dim mt-1">Try adjusting your filters — new jobs are added daily.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="border border-border-subtle rounded-xl overflow-hidden">
      {jobs.map((job) => (
        <JobListRow
          key={job.id}
          job={job}
          locale={locale}
          matchScore={matchMap[job.id]}
        />
      ))}
    </div>
  );
}
