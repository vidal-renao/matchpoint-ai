// ============================================================================
// MatchPoint AI — MatchCard
// Premium "Luxury-Editorial" card for a single job match result
//
// Displays: Match %, 4 dimension bars, AI verdict, strengths/gaps
// ============================================================================

'use client';

import { useState } from 'react';
import { useTranslations, type Locale } from '@/lib/i18n';
import type { MatchWithJob } from '@/lib/actions/matching';

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface MatchCardProps {
  match: MatchWithJob;
  locale: Locale;
  index: number; // For staggered animation delay
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const RECOMMENDATION_CONFIG = {
  strong_match: { label: 'matches.level.strong', color: '#22C55E', glow: 'rgba(34,197,94,0.15)', ring: 'rgba(34,197,94,0.25)' },
  good_match:   { label: 'matches.level.good',   color: '#F59E0B', glow: 'rgba(245,158,11,0.15)', ring: 'rgba(245,158,11,0.25)' },
  partial_match:{ label: 'matches.level.partial', color: '#3B82F6', glow: 'rgba(59,130,246,0.12)', ring: 'rgba(59,130,246,0.2)' },
  poor_match:   { label: 'matches.level.poor',   color: '#6B7280', glow: 'rgba(107,114,128,0.08)', ring: 'rgba(107,114,128,0.15)' },
} as const;

const DIMENSION_KEYS = [
  { key: 'hard_skills_score',  label: 'matches.dimension.hardSkills',  icon: '⬡' },
  { key: 'experience_score',   label: 'matches.dimension.experience',  icon: '◈' },
  { key: 'culture_score',      label: 'matches.dimension.culture',     icon: '◎' },
  { key: 'logistics_score',    label: 'matches.dimension.logistics',   icon: '◆' },
] as const;

function ScoreArc({ score, color }: { score: number; color: string }) {
  const r = 26;
  const circ = 2 * Math.PI * r;
  const dash = (score / 100) * circ;

  return (
    <svg width="72" height="72" viewBox="0 0 72 72" className="mp-score-svg">
      {/* Track */}
      <circle cx="36" cy="36" r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="4" />
      {/* Progress */}
      <circle
        cx="36"
        cy="36"
        r={r}
        fill="none"
        stroke={color}
        strokeWidth="4"
        strokeLinecap="round"
        strokeDasharray={`${dash} ${circ}`}
        strokeDashoffset={circ * 0.25}  // Start from top
        className="mp-score-arc"
      />
      {/* Score label */}
      <text
        x="36"
        y="40"
        textAnchor="middle"
        fill={color}
        fontSize="14"
        fontWeight="600"
        fontFamily="'DM Sans', system-ui, sans-serif"
      >
        {score}
      </text>
    </svg>
  );
}

function DimensionBar({
  score,
  label,
  icon,
  reasoning,
  color,
}: {
  score: number;
  label: string;
  icon: string;
  reasoning?: string;
  color: string;
}) {
  const [hovered, setHovered] = useState(false);
  const pct = Math.max(0, Math.min(100, score));

  return (
    <div
      className="mp-dimension"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className="mp-dimension-header">
        <span className="mp-dimension-icon" style={{ color }}>{icon}</span>
        <span className="mp-dimension-label">{label}</span>
        <span className="mp-dimension-score" style={{ color }}>{score}</span>
      </div>
      <div className="mp-dimension-track">
        <div
          className="mp-dimension-fill"
          style={{ width: `${pct}%`, background: color }}
        />
      </div>
      {reasoning && hovered && (
        <p className="mp-dimension-tooltip">{reasoning}</p>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function MatchCard({ match, locale, index }: MatchCardProps) {
  const t = useTranslations(locale);
  const [expanded, setExpanded] = useState(false);
  const cfg = RECOMMENDATION_CONFIG[match.recommendation] ?? RECOMMENDATION_CONFIG.partial_match;

  const salary =
    match.job.salary_min
      ? `${match.job.salary_currency ?? 'USD'} ${(match.job.salary_min / 1000).toFixed(0)}k–${(
          (match.job.salary_max ?? match.job.salary_min * 1.3) / 1000
        ).toFixed(0)}k`
      : null;

  return (
    <article
      className="mp-match-card"
      style={{
        '--card-color': cfg.color,
        '--card-glow': cfg.glow,
        '--card-ring': cfg.ring,
        animationDelay: `${index * 0.08}s`,
      } as React.CSSProperties}
    >
      {/* Score glow */}
      <div className="mp-card-glow" />

      {/* Top row: company info + score arc */}
      <div className="mp-card-top">
        <div className="mp-job-meta">
          {/* Recommendation badge */}
          <span className="mp-rec-badge" style={{ color: cfg.color, borderColor: cfg.ring, background: cfg.glow }}>
            {t(cfg.label)}
          </span>

          <h3 className="mp-job-title">{match.job.title}</h3>
          <p className="mp-job-company">{match.job.company}</p>

          <div className="mp-job-tags">
            {match.job.location && (
              <span className="mp-tag">📍 {match.job.location}</span>
            )}
            {match.job.remote_policy && (
              <span className="mp-tag">🌐 {match.job.remote_policy}</span>
            )}
            {salary && (
              <span className="mp-tag mp-tag-salary">💰 {salary}</span>
            )}
          </div>
        </div>

        {/* Score arc */}
        <div className="mp-score-container">
          <ScoreArc score={match.overall_score} color={cfg.color} />
          <p className="mp-score-label">{t('matches.match')}</p>
        </div>
      </div>

      {/* AI Verdict */}
      <p className="mp-verdict">{match.ai_verdict}</p>

      {/* Dimension bars */}
      <div className="mp-dimensions">
        {DIMENSION_KEYS.map(({ key, label, icon }) => (
          <DimensionBar
            key={key}
            score={match[key] as number}
            label={t(label)}
            icon={icon}
            reasoning={match[`${key.replace('_score', '_reasoning')}` as keyof typeof match] as string | undefined}
            color={cfg.color}
          />
        ))}
      </div>

      {/* Expand toggle */}
      <button
        className="mp-expand-btn"
        onClick={() => setExpanded((v) => !v)}
        aria-expanded={expanded}
      >
        {expanded ? t('matches.seeLess') : t('matches.seeMore')}
        <svg
          width="14"
          height="14"
          viewBox="0 0 14 14"
          fill="none"
          style={{ transform: expanded ? 'rotate(180deg)' : 'none', transition: 'transform 0.3s' }}
        >
          <path d="M3 5l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {/* Expanded: strengths & gaps */}
      {expanded && (
        <div className="mp-expanded-content">
          {match.strengths?.length > 0 && (
            <div className="mp-list-section">
              <p className="mp-list-title mp-list-title--positive">{t('matches.strengths')}</p>
              <ul className="mp-list">
                {match.strengths.map((s, i) => (
                  <li key={i} className="mp-list-item mp-list-item--positive">{s}</li>
                ))}
              </ul>
            </div>
          )}
          {match.gaps?.length > 0 && (
            <div className="mp-list-section">
              <p className="mp-list-title mp-list-title--warning">{t('matches.gaps')}</p>
              <ul className="mp-list">
                {match.gaps.map((g, i) => (
                  <li key={i} className="mp-list-item mp-list-item--warning">{g}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Required skills */}
          {match.job.required_skills?.length > 0 && (
            <div className="mp-list-section">
              <p className="mp-list-title">{t('matches.requiredSkills')}</p>
              <div className="mp-skills-row">
                {match.job.required_skills.map((skill) => (
                  <span key={skill} className="mp-skill-chip">{skill}</span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Styles */}
      <style>{`
        .mp-match-card {
          --mp-bg: #0A0A0B;
          --mp-surface: #141416;
          --mp-surface-raised: #1C1C20;
          --mp-border: #2A2A30;
          --mp-border-subtle: #1E1E24;
          --mp-text: #F5F5F4;
          --mp-text-muted: #8A8A94;
          --mp-text-dim: #5A5A64;
          --mp-accent: #F59E0B;
          --mp-success: #22C55E;
          --mp-error: #EF4444;
          --mp-radius: 16px;
          --mp-radius-sm: 10px;
          --mp-font-display: 'Instrument Serif', Georgia, serif;
          --mp-font-body: 'DM Sans', system-ui, sans-serif;

          position: relative;
          background: rgba(20, 20, 22, 0.85);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border: 1px solid var(--mp-border-subtle);
          border-radius: var(--mp-radius);
          padding: 1.75rem;
          display: flex;
          flex-direction: column;
          gap: 1.125rem;
          overflow: hidden;
          transition: border-color 0.3s ease, transform 0.3s cubic-bezier(0.16, 1, 0.3, 1);
          animation: mp-card-in 0.5s cubic-bezier(0.16, 1, 0.3, 1) both;
          font-family: var(--mp-font-body);
          color: var(--mp-text);
          -webkit-font-smoothing: antialiased;
        }

        @keyframes mp-card-in {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .mp-match-card:hover {
          border-color: var(--card-ring);
          transform: translateY(-2px);
        }

        .mp-card-glow {
          position: absolute;
          top: -40px;
          right: -40px;
          width: 180px;
          height: 180px;
          border-radius: 50%;
          background: var(--card-glow);
          filter: blur(50px);
          pointer-events: none;
          opacity: 0.7;
          transition: opacity 0.4s;
        }

        .mp-match-card:hover .mp-card-glow { opacity: 1; }

        /* Top row */
        .mp-card-top {
          display: flex;
          gap: 1rem;
          align-items: flex-start;
          justify-content: space-between;
        }

        .mp-job-meta {
          flex: 1;
          min-width: 0;
          display: flex;
          flex-direction: column;
          gap: 0.375rem;
        }

        .mp-rec-badge {
          display: inline-flex;
          align-items: center;
          padding: 0.2rem 0.625rem;
          border-radius: 100px;
          border: 1px solid;
          font-size: 0.6875rem;
          font-weight: 600;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          width: fit-content;
        }

        .mp-job-title {
          font-family: var(--mp-font-display);
          font-size: 1.25rem;
          font-weight: 400;
          margin: 0.25rem 0 0;
          color: var(--mp-text);
          line-height: 1.2;
        }

        .mp-job-company {
          font-size: 0.8125rem;
          color: var(--card-color);
          margin: 0;
          font-weight: 500;
        }

        .mp-job-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 0.375rem;
          margin-top: 0.375rem;
        }

        .mp-tag {
          font-size: 0.6875rem;
          padding: 0.2rem 0.5rem;
          border-radius: 6px;
          background: var(--mp-surface-raised);
          color: var(--mp-text-muted);
          border: 1px solid var(--mp-border-subtle);
        }

        .mp-tag-salary {
          color: var(--mp-accent);
          background: rgba(245,158,11,0.06);
          border-color: rgba(245,158,11,0.15);
        }

        /* Score arc */
        .mp-score-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.25rem;
          flex-shrink: 0;
        }

        .mp-score-svg {
          display: block;
        }

        .mp-score-arc {
          transition: stroke-dasharray 1s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .mp-score-label {
          font-size: 0.625rem;
          color: var(--mp-text-dim);
          text-transform: uppercase;
          letter-spacing: 0.06em;
          margin: 0;
        }

        /* AI Verdict */
        .mp-verdict {
          font-size: 0.8125rem;
          color: var(--mp-text-muted);
          line-height: 1.6;
          margin: 0;
          padding: 0.875rem 1rem;
          background: var(--mp-surface-raised);
          border-radius: var(--mp-radius-sm);
          border-left: 2px solid var(--card-color);
        }

        /* Dimensions */
        .mp-dimensions {
          display: flex;
          flex-direction: column;
          gap: 0.625rem;
        }

        .mp-dimension {
          position: relative;
          cursor: default;
        }

        .mp-dimension-header {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-bottom: 0.3rem;
        }

        .mp-dimension-icon {
          font-size: 0.75rem;
          flex-shrink: 0;
        }

        .mp-dimension-label {
          font-size: 0.75rem;
          color: var(--mp-text-muted);
          flex: 1;
        }

        .mp-dimension-score {
          font-size: 0.75rem;
          font-weight: 600;
          min-width: 2ch;
          text-align: right;
        }

        .mp-dimension-track {
          height: 3px;
          background: var(--mp-border);
          border-radius: 2px;
          overflow: hidden;
        }

        .mp-dimension-fill {
          height: 100%;
          border-radius: 2px;
          transition: width 1s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .mp-dimension-tooltip {
          margin: 0.375rem 0 0;
          font-size: 0.6875rem;
          color: var(--mp-text-dim);
          line-height: 1.4;
          padding: 0.375rem 0.625rem;
          background: var(--mp-surface-raised);
          border-radius: 6px;
          animation: mp-fade-in 0.2s ease;
        }

        @keyframes mp-fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        /* Expand button */
        .mp-expand-btn {
          display: inline-flex;
          align-items: center;
          gap: 0.375rem;
          background: none;
          border: none;
          color: var(--mp-text-dim);
          font-size: 0.75rem;
          font-family: var(--mp-font-body);
          cursor: pointer;
          padding: 0.25rem 0;
          transition: color 0.2s;
          align-self: flex-start;
          letter-spacing: 0.01em;
        }

        .mp-expand-btn:hover { color: var(--mp-text-muted); }

        /* Expanded content */
        .mp-expanded-content {
          display: flex;
          flex-direction: column;
          gap: 1rem;
          border-top: 1px solid var(--mp-border-subtle);
          padding-top: 1rem;
          animation: mp-slide-down 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }

        @keyframes mp-slide-down {
          from { opacity: 0; transform: translateY(-6px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .mp-list-section { display: flex; flex-direction: column; gap: 0.5rem; }

        .mp-list-title {
          font-size: 0.6875rem;
          text-transform: uppercase;
          letter-spacing: 0.06em;
          font-weight: 600;
          margin: 0;
          color: var(--mp-text-dim);
        }

        .mp-list-title--positive { color: var(--mp-success); }
        .mp-list-title--warning  { color: #F59E0B; }

        .mp-list {
          margin: 0;
          padding: 0;
          list-style: none;
          display: flex;
          flex-direction: column;
          gap: 0.3rem;
        }

        .mp-list-item {
          font-size: 0.8125rem;
          color: var(--mp-text-muted);
          padding-left: 1rem;
          position: relative;
          line-height: 1.4;
        }

        .mp-list-item::before {
          content: '—';
          position: absolute;
          left: 0;
          color: var(--mp-text-dim);
        }

        .mp-list-item--positive::before { color: var(--mp-success); }
        .mp-list-item--warning::before  { color: #F59E0B; }

        .mp-skills-row {
          display: flex;
          flex-wrap: wrap;
          gap: 0.375rem;
        }

        .mp-skill-chip {
          display: inline-block;
          padding: 0.25rem 0.625rem;
          border-radius: 100px;
          font-size: 0.6875rem;
          font-weight: 500;
          background: rgba(245,158,11,0.08);
          color: var(--mp-accent);
          border: 1px solid rgba(245,158,11,0.15);
        }
      `}</style>
    </article>
  );
}

export default MatchCard;
