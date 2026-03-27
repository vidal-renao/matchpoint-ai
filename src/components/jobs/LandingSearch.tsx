'use client';

import { useState } from 'react';
import type { Locale } from '@/lib/i18n';

interface Props { locale: Locale }

export function LandingSearch({ locale }: Props) {
  const [query, setQuery] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (query.trim()) params.set('search', query.trim());
    window.location.href = `/${locale}/jobs?${params.toString()}`;
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full max-w-[680px] flex gap-0 glass rounded-xl overflow-hidden border border-border-subtle focus-within:border-accent/40 transition-colors"
    >
      <div className="flex items-center gap-3 flex-1 px-5">
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none" className="flex-shrink-0 text-text-dim">
          <circle cx="8" cy="8" r="5.5" stroke="currentColor" strokeWidth="1.5" />
          <path d="M12.5 12.5L16 16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Job title, company or skill…"
          className="flex-1 bg-transparent py-4 text-[15px] text-text placeholder:text-text-dim focus:outline-none"
        />
      </div>
      <button
        type="submit"
        className="px-7 py-4 bg-accent text-base font-medium text-[15px] hover:bg-accent-hover transition-colors flex-shrink-0"
      >
        Search jobs
      </button>
    </form>
  );
}
