import { FeaturedJobCard } from './FeaturedJobCard';
import type { JobWithSector } from '@/lib/actions/jobs';
import type { Locale } from '@/lib/i18n';

interface Props {
  jobs: JobWithSector[];
  locale: Locale;
}

export function JobsGrid({ jobs, locale }: Props) {
  if (jobs.length === 0) {
    return (
      <div className="flex flex-col items-center gap-4 py-24 text-center">
        <div className="w-16 h-16 rounded-full border border-border-subtle flex items-center justify-center opacity-30">
          <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
            <circle cx="13" cy="13" r="8" stroke="currentColor" strokeWidth="1.5" />
            <path d="M19 19l5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </div>
        <p className="font-display text-xl text-text-muted">No jobs found</p>
        <p className="text-sm text-text-dim max-w-[320px] leading-relaxed">
          Try adjusting your filters or search terms. New jobs are added daily.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
      {jobs.map((job) => (
        <FeaturedJobCard key={job.id} job={job} locale={locale} />
      ))}
    </div>
  );
}
