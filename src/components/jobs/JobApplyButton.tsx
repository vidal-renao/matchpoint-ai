'use client';

import { useState, useTransition } from 'react';
import { applyToJob } from '@/lib/actions/applications';
import type { Locale } from '@/lib/i18n';

interface Props {
  jobId: string;
  candidateId: string | null;
  locale: Locale;
  hasCV: boolean;
}

export function JobApplyButton({ jobId, candidateId, locale, hasCV }: Props) {
  const [applied, setApplied] = useState(false);
  const [error, setError] = useState('');
  const [isPending, startTransition] = useTransition();

  // Not logged in → go to signup
  if (!candidateId && !hasCV) {
    return (
      <div className="flex flex-col gap-2">
        <a
          href={`/${locale}/signup?next=/${locale}/jobs/${jobId}`}
          className="w-full py-3.5 rounded-xl bg-accent text-base font-medium text-center hover:bg-accent-hover transition-all text-[15px]"
        >
          Apply Now
        </a>
        <p className="text-[11px] text-text-dim text-center">Free account · No credit card</p>
      </div>
    );
  }

  // Logged in but no CV yet → go upload
  if (!candidateId && hasCV === false) {
    return (
      <a
        href={`/${locale}/upload`}
        className="w-full py-3.5 rounded-xl bg-accent text-base font-medium text-center hover:bg-accent-hover transition-all text-[15px] block"
      >
        Upload CV to Apply
      </a>
    );
  }

  if (applied) {
    return (
      <div className="flex flex-col items-center gap-2 py-3">
        <div className="w-10 h-10 rounded-full bg-success/10 border border-success/30 flex items-center justify-center">
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <path d="M3 9.5l4.5 4.5L15 5" stroke="#22C55E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <p className="text-sm text-success font-medium">Application submitted!</p>
        <a href={`/${locale}/applications`} className="text-xs text-accent hover:underline">
          Track in pipeline →
        </a>
      </div>
    );
  }

  const handleApply = () => {
    if (!candidateId) return;
    setError('');
    startTransition(async () => {
      const result = await applyToJob(candidateId, jobId);
      if (result.success) {
        setApplied(true);
      } else {
        setError(result.error ?? 'Could not submit application.');
      }
    });
  };

  return (
    <div className="flex flex-col gap-2">
      <button
        onClick={handleApply}
        disabled={isPending}
        className="w-full py-3.5 rounded-xl bg-accent text-base font-medium hover:bg-accent-hover transition-all text-[15px] disabled:opacity-60 shadow-[0_0_20px_rgba(245,158,11,0.15)]"
      >
        {isPending ? 'Applying…' : 'Apply Now — AI Will Score You'}
      </button>
      {error && <p className="text-xs text-error text-center">{error}</p>}
      <p className="text-[11px] text-text-dim text-center">AI screening is instant · Free to apply</p>
    </div>
  );
}
