'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { SECTORS } from '@/lib/constants/jobs';
import type { Locale } from '@/lib/i18n';

interface Props {
  locale: Locale;
  activeSector?: string;
  activeRemote?: string;
  activeSearch?: string;
}

const REMOTE_OPTIONS = [
  { key: 'all',      label: 'All types' },
  { key: 'remote',   label: '🌐 Remote' },
  { key: 'hybrid',   label: '🏠 Hybrid' },
  { key: 'onsite',   label: '🏢 On-site' },
  { key: 'flexible', label: '🔄 Flexible' },
];

export function JobFilters({ locale, activeSector, activeRemote, activeSearch }: Props) {
  const router = useRouter();
  const [search, setSearch] = useState(activeSearch ?? '');

  const navigate = (newSector?: string, newRemote?: string, newSearch?: string) => {
    const params = new URLSearchParams();
    if (newSector && newSector !== 'all') params.set('sector', newSector);
    if (newRemote && newRemote !== 'all') params.set('remote', newRemote);
    if (newSearch?.trim()) params.set('search', newSearch.trim());
    router.push(`/${locale}/jobs?${params.toString()}`);
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Search */}
      <div>
        <p className="text-xs uppercase tracking-widest text-text-dim mb-3">Search</p>
        <form onSubmit={(e) => { e.preventDefault(); navigate(activeSector, activeRemote, search); }}
          className="flex gap-2">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Title, skill…"
            className="flex-1 bg-surface border border-border rounded-lg px-3 py-2 text-sm text-text placeholder:text-text-dim focus:outline-none focus:border-accent/50 transition-colors"
          />
          <button type="submit"
            className="px-3 py-2 rounded-lg bg-accent text-base text-sm hover:bg-accent-hover transition-colors">
            →
          </button>
        </form>
      </div>

      {/* Remote filter */}
      <div>
        <p className="text-xs uppercase tracking-widest text-text-dim mb-3">Work type</p>
        <div className="flex flex-col gap-1">
          {REMOTE_OPTIONS.map((opt) => (
            <button
              key={opt.key}
              onClick={() => navigate(activeSector, opt.key, search)}
              className={`text-left text-sm px-3 py-2 rounded-lg transition-colors ${
                (activeRemote ?? 'all') === opt.key
                  ? 'bg-accent/10 text-accent border border-accent/20'
                  : 'text-text-muted hover:text-text hover:bg-surface-raised'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Sector filter */}
      <div>
        <p className="text-xs uppercase tracking-widest text-text-dim mb-3">Sector</p>
        <div className="flex flex-col gap-1">
          <button
            onClick={() => navigate(undefined, activeRemote, search)}
            className={`text-left text-sm px-3 py-2 rounded-lg transition-colors ${
              !activeSector
                ? 'bg-accent/10 text-accent border border-accent/20'
                : 'text-text-muted hover:text-text hover:bg-surface-raised'
            }`}
          >
            All sectors
          </button>
          {SECTORS.map((s) => (
            <button
              key={s.key}
              onClick={() => navigate(s.key, activeRemote, search)}
              className={`text-left text-sm px-3 py-2 rounded-lg transition-colors flex items-center gap-2 ${
                activeSector === s.key
                  ? 'bg-accent/10 text-accent border border-accent/20'
                  : 'text-text-muted hover:text-text hover:bg-surface-raised'
              }`}
            >
              <span>{s.icon}</span>
              <span>{s.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
