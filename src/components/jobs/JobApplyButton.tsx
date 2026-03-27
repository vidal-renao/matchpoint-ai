'use client';

import { useState, useTransition } from 'react';
import { applyToJob } from '@/lib/actions/applications';
import type { Locale } from '@/lib/i18n';

interface Props {
  jobId: string;
  candidateId: string | null;  // null = no CV uploaded yet
  locale: Locale;
  isLoggedIn: boolean;          // true = authenticated, regardless of CV
}

export function JobApplyButton({ jobId, candidateId, locale, isLoggedIn }: Props) {
  const [applied, setApplied] = useState(false);
  const [error, setError] = useState('');
  const [isPending, startTransition] = useTransition();

  // State 1: Not logged in → signup
  if (!isLoggedIn) {
    return (
      <div className="flex flex-col gap-2">
        <a
          href={`/${locale}/signup?next=/${locale}/jobs/${jobId}`}
          className="w-full py-3.5 rounded-xl bg-accent text-base font-medium text-center hover:bg-accent-hover transition-all text-[15px]"
        >
          Apply Now — It&apos;s Free
        </a>
        <p className="text-[11px] text-text-dim text-center">Free account · No credit card · 2 min setup</p>
      </div>
    );
  }

  // State 2: Logged in but no CV uploaded yet
  if (!candidateId) {
    return (
      <div className="flex flex-col gap-2">
        <a
          href={`/${locale}/upload`}
          className="w-full py-3.5 rounded-xl bg-accent text-base font-medium text-center hover:bg-accent-hover transition-all text-[15px] block"
        >
          Upload CV to Apply
        </a>
        <p className="text-[11px] text-text-dim text-center">Upload once — apply to any job instantly</p>
      </div>
    );
  }

  // State 3: Applied successfully
  if (applied) {
    return (
      <div className="flex flex-col items-center gap-3 py-3">
        <div className="w-12 h-12 rounded-full bg-success/10 border border-success/30 flex items-center justify-center">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M4 10.5l5 5L16 6" stroke="#22C55E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <p className="text-sm text-success font-medium text-center">Application submitted!</p>
        <p className="text-xs text-text-dim text-center">AI is scoring you against this role now.</p>
        <a href={`/${locale}/applications`} className="text-xs text-accent hover:underline">
          Track in pipeline →
        </a>
      </div>
    );
  }

  // State 4: Ready to apply
  const handleApply = () => {
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
        {isPending ? 'Applying…' : 'Apply Now — AI Scores You Instantly'}
      </button>
      {error && <p className="text-xs text-error text-center">{error}</p>}
      <p className="text-[11px] text-text-dim text-center">Free · No cover letter · Results in seconds</p>
    </div>
  );
}
