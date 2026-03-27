'use client';

import { useState } from 'react';
import { ProfileEditor } from './ProfileEditor';
import { CvPrintView } from './CvPrintView';
import type { Candidate } from '@/types/database';
import type { Locale } from '@/lib/i18n';

interface Props {
  candidate: Candidate;
  locale: Locale;
}

export function ProfileEditorWrapper({ candidate: initial, locale }: Props) {
  const [candidate, setCandidate] = useState<Candidate>(initial);

  const handleSaved = (updates: Partial<Candidate>) => {
    setCandidate((prev) => ({ ...prev, ...updates }));
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <>
      <div className="mb-6 flex justify-end">
        <button
          onClick={handlePrint}
          className="text-xs px-4 py-2 rounded-lg border border-border text-text-muted hover:text-text hover:border-text-dim transition-all flex items-center gap-2"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M3 5V2h8v3M3 9H1V5h12v4h-2M3 9v3h8V9" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Print CV
        </button>
      </div>

      <ProfileEditor candidate={candidate} onSaved={handleSaved} />
      <CvPrintView candidate={candidate} />
    </>
  );
}
