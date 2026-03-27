// ============================================================================
// MatchPoint AI — MatchesClient
// Client component: renders the matches dashboard with filter + cards
// ============================================================================

'use client';

import { useState, useMemo } from 'react';
import { useTranslations, type Locale } from '@/lib/i18n';
import { MatchCard } from './MatchCard';
import type { MatchWithJob } from '@/lib/actions/matching';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type FilterLevel = 'all' | 'strong_match' | 'good_match' | 'partial_match' | 'poor_match';

interface MatchesClientProps {
  matches: MatchWithJob[];
  locale: Locale;
  candidateName: string;
}

// ---------------------------------------------------------------------------
// Stats bar
// ---------------------------------------------------------------------------

function StatsBar({ matches, t }: { matches: MatchWithJob[]; t: (key: string) => string }) {
  const avg = matches.length
    ? Math.round(matches.reduce((s, m) => s + m.overall_score, 0) / matches.length)
    : 0;
  const strong = matches.filter((m) => m.recommendation === 'strong_match').length;
  const good = matches.filter((m) => m.recommendation === 'good_match').length;

  return (
    <div className="mp-stats-bar">
      <div className="mp-stat">
        <span className="mp-stat-value">{matches.length}</span>
        <span className="mp-stat-label">{t('matches.stats.total')}</span>
      </div>
      <div className="mp-stat-divider" />
      <div className="mp-stat">
        <span className="mp-stat-value mp-stat-value--green">{strong}</span>
        <span className="mp-stat-label">{t('matches.stats.strong')}</span>
      </div>
      <div className="mp-stat-divider" />
      <div className="mp-stat">
        <span className="mp-stat-value mp-stat-value--amber">{good}</span>
        <span className="mp-stat-label">{t('matches.stats.good')}</span>
      </div>
      <div className="mp-stat-divider" />
      <div className="mp-stat">
        <span className="mp-stat-value">{avg}%</span>
        <span className="mp-stat-label">{t('matches.stats.avgScore')}</span>
      </div>

      <style>{`
        .mp-stats-bar {
          display: flex;
          align-items: center;
          gap: 0;
          background: rgba(20,20,22,0.85);
          backdrop-filter: blur(16px);
          border: 1px solid #1E1E24;
          border-radius: 12px;
          padding: 1rem 1.5rem;
          flex-wrap: wrap;
        }
        .mp-stat {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.25rem;
          flex: 1;
          min-width: 60px;
        }
        .mp-stat-value {
          font-size: 1.5rem;
          font-weight: 600;
          color: #F5F5F4;
          font-family: 'DM Sans', system-ui, sans-serif;
          line-height: 1;
        }
        .mp-stat-value--green { color: #22C55E; }
        .mp-stat-value--amber { color: #F59E0B; }
        .mp-stat-label {
          font-size: 0.6875rem;
          color: #5A5A64;
          text-transform: uppercase;
          letter-spacing: 0.06em;
          text-align: center;
        }
        .mp-stat-divider {
          width: 1px;
          height: 32px;
          background: #1E1E24;
          flex-shrink: 0;
          margin: 0 0.5rem;
        }
      `}</style>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Filter tabs
// ---------------------------------------------------------------------------

const FILTER_OPTIONS: { key: FilterLevel; labelKey: string; color: string }[] = [
  { key: 'all',          labelKey: 'matches.filter.all',     color: '#8A8A94' },
  { key: 'strong_match', labelKey: 'matches.level.strong',   color: '#22C55E' },
  { key: 'good_match',   labelKey: 'matches.level.good',     color: '#F59E0B' },
  { key: 'partial_match',labelKey: 'matches.level.partial',  color: '#3B82F6' },
  { key: 'poor_match',   labelKey: 'matches.level.poor',     color: '#6B7280' },
];

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function MatchesClient({ matches, locale, candidateName }: MatchesClientProps) {
  const t = useTranslations(locale);
  const [filter, setFilter] = useState<FilterLevel>('all');

  const filtered = useMemo(() => {
    if (filter === 'all') return matches;
    return matches.filter((m) => m.recommendation === filter);
  }, [matches, filter]);

  return (
    <div className="mp-matches-root">
      {/* Ambient */}
      <div className="mp-matches-ambient" />

      <div className="mp-matches-container">
        {/* Page header */}
        <header className="mp-matches-header">
          <div className="mp-header-eyebrow">{t('matches.greeting')}</div>
          <h1 className="mp-matches-title">
            {t('matches.title')}
            <span className="mp-title-accent"> {candidateName.split(' ')[0]}</span>
          </h1>
          <p className="mp-matches-subtitle">{t('matches.subtitle')}</p>
        </header>

        {/* Stats */}
        {matches.length > 0 && <StatsBar matches={matches} t={t} />}

        {/* Filters */}
        {matches.length > 0 && (
          <div className="mp-filters" role="tablist">
            {FILTER_OPTIONS.map((opt) => {
              const count =
                opt.key === 'all'
                  ? matches.length
                  : matches.filter((m) => m.recommendation === opt.key).length;
              return (
                <button
                  key={opt.key}
                  role="tab"
                  aria-selected={filter === opt.key}
                  className={`mp-filter-btn ${filter === opt.key ? 'mp-filter-btn--active' : ''}`}
                  style={{ '--btn-color': opt.color } as React.CSSProperties}
                  onClick={() => setFilter(opt.key)}
                >
                  {t(opt.labelKey)}
                  <span className="mp-filter-count">{count}</span>
                </button>
              );
            })}
          </div>
        )}

        {/* Cards grid */}
        {filtered.length > 0 ? (
          <div className="mp-cards-grid">
            {filtered.map((match, idx) => (
              <MatchCard key={match.id} match={match} locale={locale} index={idx} />
            ))}
          </div>
        ) : (
          <div className="mp-empty-state">
            <div className="mp-empty-icon">
              <svg width="64" height="64" viewBox="0 0 64 64" fill="none">
                <circle cx="32" cy="32" r="30" stroke="#2A2A30" strokeWidth="2" />
                <path d="M20 32h24M32 20v24" stroke="#2A2A30" strokeWidth="2" strokeLinecap="round" opacity="0.5" />
                <circle cx="32" cy="32" r="8" stroke="#F59E0B" strokeWidth="1.5" opacity="0.4" />
              </svg>
            </div>
            <p className="mp-empty-text">
              {matches.length === 0
                ? t('matches.empty.noMatches')
                : t('matches.empty.noFilter')}
            </p>
            {matches.length === 0 && (
              <p className="mp-empty-subtext">{t('matches.empty.hint')}</p>
            )}
          </div>
        )}
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;1,9..40,300&display=swap');

        .mp-matches-root {
          --mp-bg: #0A0A0B;
          --mp-surface: #141416;
          --mp-surface-raised: #1C1C20;
          --mp-border: #2A2A30;
          --mp-border-subtle: #1E1E24;
          --mp-text: #F5F5F4;
          --mp-text-muted: #8A8A94;
          --mp-text-dim: #5A5A64;
          --mp-accent: #F59E0B;
          --mp-accent-glow: rgba(245,158,11,0.12);
          --mp-font-display: 'Instrument Serif', Georgia, serif;
          --mp-font-body: 'DM Sans', system-ui, sans-serif;

          position: relative;
          min-height: 100vh;
          background: var(--mp-bg);
          font-family: var(--mp-font-body);
          color: var(--mp-text);
          -webkit-font-smoothing: antialiased;
          padding: 2rem;
          display: flex;
          justify-content: center;
        }

        .mp-matches-ambient {
          position: fixed;
          top: -100px;
          left: 50%;
          transform: translateX(-50%);
          width: 800px;
          height: 400px;
          background: radial-gradient(ellipse, var(--mp-accent-glow) 0%, transparent 65%);
          filter: blur(100px);
          pointer-events: none;
          opacity: 0.4;
        }

        .mp-matches-container {
          position: relative;
          width: 100%;
          max-width: 720px;
          display: flex;
          flex-direction: column;
          gap: 1.75rem;
          padding-bottom: 4rem;
        }

        /* Header */
        .mp-matches-header {
          padding-top: 1rem;
          animation: mp-header-in 0.6s cubic-bezier(0.16,1,0.3,1) both;
        }

        @keyframes mp-header-in {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        .mp-header-eyebrow {
          font-size: 0.6875rem;
          text-transform: uppercase;
          letter-spacing: 0.12em;
          color: var(--mp-accent);
          font-weight: 500;
          margin-bottom: 0.5rem;
        }

        .mp-matches-title {
          font-family: var(--mp-font-display);
          font-size: clamp(2rem, 5vw, 2.75rem);
          font-weight: 400;
          margin: 0 0 0.5rem;
          color: var(--mp-text);
          line-height: 1.1;
          letter-spacing: -0.02em;
        }

        .mp-title-accent {
          color: var(--mp-accent);
          font-style: italic;
        }

        .mp-matches-subtitle {
          font-size: 0.9375rem;
          color: var(--mp-text-muted);
          margin: 0;
          font-weight: 300;
          line-height: 1.5;
        }

        /* Filters */
        .mp-filters {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
        }

        .mp-filter-btn {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 1rem;
          border-radius: 100px;
          border: 1px solid #2A2A30;
          background: rgba(20,20,22,0.6);
          color: #8A8A94;
          font-family: 'DM Sans', system-ui, sans-serif;
          font-size: 0.8125rem;
          cursor: pointer;
          transition: all 0.2s cubic-bezier(0.16,1,0.3,1);
        }

        .mp-filter-btn:hover {
          color: var(--btn-color, #F59E0B);
          border-color: var(--btn-color, #F59E0B);
        }

        .mp-filter-btn--active {
          color: var(--btn-color, #F59E0B);
          border-color: var(--btn-color, #F59E0B);
          background: rgba(255,255,255,0.04);
        }

        .mp-filter-count {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-width: 18px;
          height: 18px;
          border-radius: 9px;
          background: rgba(255,255,255,0.08);
          font-size: 0.625rem;
          font-weight: 600;
          padding: 0 4px;
        }

        /* Cards grid */
        .mp-cards-grid {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        /* Empty state */
        .mp-empty-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1rem;
          padding: 4rem 2rem;
          text-align: center;
        }

        .mp-empty-icon { opacity: 0.5; }

        .mp-empty-text {
          font-family: 'Instrument Serif', Georgia, serif;
          font-size: 1.25rem;
          color: #8A8A94;
          margin: 0;
        }

        .mp-empty-subtext {
          font-size: 0.875rem;
          color: #5A5A64;
          margin: 0;
          line-height: 1.5;
        }
      `}</style>
    </div>
  );
}

export default MatchesClient;
