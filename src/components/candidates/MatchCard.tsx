'use client';

// ============================================================================
// MatchCard — Premium job match card
// frontend-design: amber glassmorphism, Geist Mono scores
// ui-ux-pro-max: framer-motion expand/collapse, no jank
// ============================================================================

import { useState, useTransition } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslations, type Locale } from '@/lib/i18n';
import { cn } from '@/lib/utils';
import { applyToJob } from '@/lib/actions/applications';
import type { MatchWithJob } from '@/types/database';

interface MatchCardProps {
  match: MatchWithJob;
  locale: Locale;
  index: number;
  candidateId: string;
}

const REC_CONFIG = {
  strong_match:  { labelKey: 'matches.level.strong',  color: '#22C55E', bg: 'rgba(34,197,94,0.06)',   border: 'rgba(34,197,94,0.2)',   glow: 'rgba(34,197,94,0.12)' },
  good_match:    { labelKey: 'matches.level.good',    color: '#f59e0b', bg: 'rgba(245,158,11,0.06)', border: 'rgba(245,158,11,0.2)', glow: 'rgba(245,158,11,0.12)' },
  partial_match: { labelKey: 'matches.level.partial', color: '#3B82F6', bg: 'rgba(59,130,246,0.06)',  border: 'rgba(59,130,246,0.15)',  glow: 'rgba(59,130,246,0.08)' },
  poor_match:    { labelKey: 'matches.level.poor',    color: '#6B7280', bg: 'rgba(107,114,128,0.04)', border: 'rgba(107,114,128,0.12)', glow: 'rgba(107,114,128,0.06)' },
} as const;

const DIMENSIONS = [
  { scoreKey: 'hard_skills_score',  reasonKey: 'hard_skills_reasoning',  labelKey: 'matches.dimension.hardSkills',  icon: '⬡' },
  { scoreKey: 'experience_score',   reasonKey: 'experience_reasoning',   labelKey: 'matches.dimension.experience',  icon: '◈' },
  { scoreKey: 'culture_score',      reasonKey: 'culture_reasoning',      labelKey: 'matches.dimension.culture',     icon: '◎' },
  { scoreKey: 'logistics_score',    reasonKey: 'logistics_reasoning',    labelKey: 'matches.dimension.logistics',   icon: '◆' },
] as const;

// SVG arc score indicator
function ScoreArc({ score, color }: { score: number; color: string }) {
  const r = 26;
  const circ = 2 * Math.PI * r;
  const dash = (score / 100) * circ;
  return (
    <svg width="72" height="72" viewBox="0 0 72 72" className="block">
      <circle cx="36" cy="36" r={r} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="4" />
      <motion.circle
        cx="36" cy="36" r={r} fill="none" stroke={color} strokeWidth="4" strokeLinecap="round"
        strokeDasharray={`${dash} ${circ}`}
        strokeDashoffset={circ * 0.25}
        initial={{ strokeDasharray: `0 ${circ}` }}
        animate={{ strokeDasharray: `${dash} ${circ}` }}
        transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
      />
      <text x="36" y="41" textAnchor="middle" fill={color} fontSize="14" fontWeight="600"
        fontFamily="'Geist Mono', 'Fira Code', monospace">
        {score}
      </text>
    </svg>
  );
}

function DimensionBar({
  score, label, icon, reasoning, color,
}: {
  score: number; label: string; icon: string; reasoning?: string | null; color: string;
}) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="group cursor-default"
    >
      <div className="flex items-center gap-2 mb-1">
        <span className="text-xs" style={{ color }}>{icon}</span>
        <span className="text-xs text-text-muted flex-1">{label}</span>
        <span className="font-mono text-xs font-semibold" style={{ color }}>{score}</span>
      </div>
      <div className="h-[3px] bg-border rounded-full overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          style={{ backgroundColor: color }}
          initial={{ width: 0 }}
          animate={{ width: `${Math.min(100, Math.max(0, score))}%` }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: 0.3 }}
        />
      </div>
      <AnimatePresence>
        {hovered && reasoning && (
          <motion.p
            initial={{ opacity: 0, height: 0, marginTop: 0 }}
            animate={{ opacity: 1, height: 'auto', marginTop: 6 }}
            exit={{ opacity: 0, height: 0, marginTop: 0 }}
            transition={{ duration: 0.2 }}
            className="text-[11px] text-text-dim leading-relaxed bg-surface-raised px-2.5 py-1.5 rounded-lg overflow-hidden"
          >
            {reasoning}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}

export function MatchCard({ match, locale, index, candidateId }: MatchCardProps) {
  const t = useTranslations(locale);
  const [expanded, setExpanded] = useState(false);
  const [applied, setApplied] = useState(false);
  const [applyError, setApplyError] = useState('');
  const [isPending, startTransition] = useTransition();
  const cfg = REC_CONFIG[match.recommendation] ?? REC_CONFIG.partial_match;

  const handleApply = () => {
    startTransition(async () => {
      const result = await applyToJob(candidateId, match.job_id, match.id);
      if (result.success) {
        setApplied(true);
      } else {
        setApplyError(result.error ?? 'Failed to apply.');
      }
    });
  };

  const salary = match.job.salary_min
    ? `${match.job.salary_currency ?? 'USD'} ${Math.round(match.job.salary_min / 1000)}k${match.job.salary_max ? `–${Math.round(match.job.salary_max / 1000)}k` : '+'}`
    : null;

  return (
    <motion.article
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1], delay: index * 0.06 }}
      whileHover={{ y: -2, transition: { duration: 0.2 } }}
      className="relative glass rounded-[var(--radius-card)] p-7 overflow-hidden transition-[border-color] duration-300"
      style={{
        borderColor: 'transparent',
      }}
      onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.borderColor = cfg.border; }}
      onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = 'transparent'; }}
    >
      {/* Corner glow */}
      <div
        className="absolute -top-10 -right-10 w-44 h-44 rounded-full pointer-events-none blur-[50px] opacity-70 transition-opacity duration-300 group-hover:opacity-100"
        style={{ background: cfg.glow }}
      />

      {/* Top row */}
      <div className="flex gap-4 items-start justify-between relative">
        <div className="flex-1 min-w-0 flex flex-col gap-1.5">
          {/* Recommendation badge */}
          <span
            className="inline-flex items-center w-fit px-2.5 py-0.5 rounded-full text-[11px] font-semibold uppercase tracking-widest border"
            style={{ color: cfg.color, background: cfg.bg, borderColor: cfg.border }}
          >
            {t(cfg.labelKey)}
          </span>

          <h3 className="font-display text-xl font-normal text-text leading-tight mt-1">{match.job.title}</h3>
          <p className="text-sm font-medium" style={{ color: cfg.color }}>{match.job.company}</p>

          <div className="flex flex-wrap gap-1.5 mt-1">
            {match.job.location && (
              <span className="text-[11px] px-2 py-0.5 rounded-md bg-surface-raised border border-border-subtle text-text-muted">
                📍 {match.job.location}
              </span>
            )}
            {match.job.remote_policy && (
              <span className="text-[11px] px-2 py-0.5 rounded-md bg-surface-raised border border-border-subtle text-text-muted">
                🌐 {match.job.remote_policy}
              </span>
            )}
            {salary && (
              <span className="text-[11px] px-2 py-0.5 rounded-md bg-accent/6 border border-accent/15 text-accent">
                💰 {salary}
              </span>
            )}
          </div>
        </div>

        {/* Score arc */}
        <div className="flex flex-col items-center gap-1 flex-shrink-0">
          <ScoreArc score={match.overall_score} color={cfg.color} />
          <span className="text-[10px] uppercase tracking-widest text-text-dim">{t('matches.match')}</span>
        </div>
      </div>

      {/* AI Verdict */}
      <p
        className="text-[13px] text-text-muted leading-relaxed px-4 py-3 rounded-[var(--radius-sm)] mt-4 border-l-2"
        style={{ background: 'var(--color-surface-raised)', borderLeftColor: cfg.color }}
      >
        {match.ai_verdict}
      </p>

      {/* Dimension bars */}
      <div className="flex flex-col gap-3 mt-4">
        {DIMENSIONS.map(({ scoreKey, reasonKey, labelKey, icon }) => (
          <DimensionBar
            key={scoreKey}
            score={match[scoreKey] as number}
            label={t(labelKey)}
            icon={icon}
            reasoning={match[reasonKey] as string | null}
            color={cfg.color}
          />
        ))}
      </div>

      {/* Apply button */}
      <div className="mt-4 flex items-center justify-between gap-3">
        {applied ? (
          <span className="text-xs text-success flex items-center gap-1.5">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M2 7l4 4 6-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Applied
          </span>
        ) : (
          <button
            onClick={handleApply}
            disabled={isPending}
            className="text-xs px-4 py-1.5 rounded-lg border border-accent/30 text-accent hover:bg-accent/10 transition-all disabled:opacity-50"
          >
            {isPending ? 'Applying…' : 'Apply'}
          </button>
        )}
        {applyError && <span className="text-[11px] text-error">{applyError}</span>}

        {/* Expand toggle */}
        <button
          onClick={() => setExpanded((v) => !v)}
          className="flex items-center gap-1.5 text-[11px] text-text-dim hover:text-text-muted transition-colors ml-auto"
          aria-expanded={expanded}
        >
        {expanded ? t('matches.seeLess') : t('matches.seeMore')}
        <motion.svg
          width="14" height="14" viewBox="0 0 14 14" fill="none"
          animate={{ rotate: expanded ? 180 : 0 }} transition={{ duration: 0.3 }}
        >
          <path d="M3 5l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </motion.svg>
        </button>
      </div>

      {/* Expanded content */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden"
          >
            <div className="flex flex-col gap-4 border-t border-border-subtle pt-4 mt-0">
              {match.strengths?.length > 0 && (
                <div className="flex flex-col gap-2">
                  <p className="text-[11px] uppercase tracking-widest font-semibold text-success">{t('matches.strengths')}</p>
                  <ul className="space-y-1">
                    {match.strengths.map((s, i) => (
                      <li key={i} className="text-[13px] text-text-muted pl-4 relative before:absolute before:left-0 before:content-['—'] before:text-success">{s}</li>
                    ))}
                  </ul>
                </div>
              )}
              {match.gaps?.length > 0 && (
                <div className="flex flex-col gap-2">
                  <p className="text-[11px] uppercase tracking-widest font-semibold text-accent">{t('matches.gaps')}</p>
                  <ul className="space-y-1">
                    {match.gaps.map((g, i) => (
                      <li key={i} className="text-[13px] text-text-muted pl-4 relative before:absolute before:left-0 before:content-['—'] before:text-accent">{g}</li>
                    ))}
                  </ul>
                </div>
              )}
              {match.job.required_skills?.length > 0 && (
                <div className="flex flex-col gap-2">
                  <p className="text-[11px] uppercase tracking-widest font-semibold text-text-dim">{t('matches.requiredSkills')}</p>
                  <div className="flex flex-wrap gap-1.5">
                    {match.job.required_skills.map((s) => (
                      <span key={s} className="text-xs px-2.5 py-1 rounded-full bg-accent/8 text-accent border border-accent/15">{s}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.article>
  );
}

export default MatchCard;
