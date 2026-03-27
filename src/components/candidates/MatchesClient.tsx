'use client';

// ============================================================================
// MatchesClient — matches dashboard with filter tabs + staggered cards
// ui-ux-pro-max: framer-motion stagger, AnimatePresence for filter changes
// ============================================================================

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslations, type Locale } from '@/lib/i18n';
import { MatchCard } from './MatchCard';
import type { MatchWithJob, MatchRecommendation } from '@/types/database';

type FilterLevel = 'all' | MatchRecommendation;

interface MatchesClientProps {
  matches: MatchWithJob[];
  locale: Locale;
  candidateName: string;
  candidateId: string;
}

const FILTERS: { key: FilterLevel; labelKey: string; color: string }[] = [
  { key: 'all',           labelKey: 'matches.filter.all',    color: '#8A8A94' },
  { key: 'strong_match',  labelKey: 'matches.level.strong',  color: '#22C55E' },
  { key: 'good_match',    labelKey: 'matches.level.good',    color: '#f59e0b' },
  { key: 'partial_match', labelKey: 'matches.level.partial', color: '#3B82F6' },
  { key: 'poor_match',    labelKey: 'matches.level.poor',    color: '#6B7280' },
];

// Stagger container variants
const containerVariants = {
  hidden: {},
  show:   { transition: { staggerChildren: 0.07 } },
  exit:   {},
};

export function MatchesClient({ matches, locale, candidateName, candidateId }: MatchesClientProps) {
  const t = useTranslations(locale);
  const [filter, setFilter] = useState<FilterLevel>('all');

  const filtered = useMemo(
    () => filter === 'all' ? matches : matches.filter((m) => m.recommendation === filter),
    [matches, filter]
  );

  const stats = useMemo(() => ({
    total: matches.length,
    strong: matches.filter((m) => m.recommendation === 'strong_match').length,
    good:   matches.filter((m) => m.recommendation === 'good_match').length,
    avg:    matches.length
      ? Math.round(matches.reduce((s, m) => s + m.overall_score, 0) / matches.length)
      : 0,
  }), [matches]);

  return (
    <div className="relative min-h-screen bg-base text-text font-body antialiased flex justify-center px-4 py-8">
      {/* Ambient glow */}
      <div className="ambient-glow" />

      <div className="relative w-full max-w-[720px] flex flex-col gap-7 pb-16">

        {/* Page header */}
        <motion.header
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="pt-4"
        >
          <p className="text-[11px] uppercase tracking-[0.12em] text-accent font-medium mb-2">
            {t('matches.greeting')}
          </p>
          <h1 className="font-display text-[clamp(2rem,5vw,2.75rem)] font-normal tracking-tight leading-[1.1] mb-2">
            {t('matches.title')}
            <em className="text-accent not-italic"> {candidateName.split(' ')[0]}</em>
          </h1>
          <p className="text-[15px] text-text-muted font-light leading-relaxed">
            {t('matches.subtitle')}
          </p>
        </motion.header>

        {/* Stats bar */}
        {matches.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="glass rounded-xl px-6 py-4 flex flex-wrap"
          >
            {[
              { value: stats.total, label: t('matches.stats.total'),    color: 'text-text' },
              { value: stats.strong,label: t('matches.stats.strong'),   color: 'text-success' },
              { value: stats.good,  label: t('matches.stats.good'),     color: 'text-accent' },
              { value: `${stats.avg}%`, label: t('matches.stats.avgScore'), color: 'text-text' },
            ].map((s, i, arr) => (
              <div key={i} className="flex flex-1 min-w-[60px]">
                <div className="flex flex-col items-center flex-1 gap-1">
                  <span className={`font-mono text-2xl font-semibold leading-none ${s.color}`}>{s.value}</span>
                  <span className="text-[11px] text-text-dim uppercase tracking-widest text-center">{s.label}</span>
                </div>
                {i < arr.length - 1 && <div className="w-px h-8 bg-border my-auto mx-2" />}
              </div>
            ))}
          </motion.div>
        )}

        {/* Filter tabs */}
        {matches.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="flex flex-wrap gap-2"
            role="tablist"
          >
            {FILTERS.map((f) => {
              const count = f.key === 'all' ? matches.length : matches.filter((m) => m.recommendation === f.key).length;
              const isActive = filter === f.key;
              return (
                <motion.button
                  key={f.key}
                  role="tab"
                  aria-selected={isActive}
                  onClick={() => setFilter(f.key)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex items-center gap-2 px-4 py-2 rounded-full border text-[13px] transition-colors duration-200"
                  style={{
                    color: isActive ? f.color : '#8A8A94',
                    borderColor: isActive ? f.color : '#1f1f1f',
                    background: isActive ? `${f.color}08` : 'rgba(15,15,15,0.6)',
                  }}
                >
                  {t(f.labelKey)}
                  <span
                    className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full"
                    style={{ background: 'rgba(255,255,255,0.06)' }}
                  >
                    {count}
                  </span>
                </motion.button>
              );
            })}
          </motion.div>
        )}

        {/* Cards — AnimatePresence for filter transitions */}
        <AnimatePresence mode="wait">
          {filtered.length > 0 ? (
            <motion.div
              key={filter}
              variants={containerVariants}
              initial="hidden"
              animate="show"
              exit="exit"
              className="flex flex-col gap-4"
            >
              {filtered.map((match, idx) => (
                <MatchCard key={match.id} match={match} locale={locale} index={idx} candidateId={candidateId} />
              ))}
            </motion.div>
          ) : (
            <motion.div
              key="empty"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center gap-4 py-20 text-center"
            >
              <svg width="64" height="64" viewBox="0 0 64 64" fill="none" className="opacity-30">
                <circle cx="32" cy="32" r="30" stroke="#2A2A30" strokeWidth="2" />
                <circle cx="32" cy="32" r="8" stroke="#f59e0b" strokeWidth="1.5" opacity="0.6" />
                <path d="M20 32h5M39 32h5M32 20v5M32 39v5" stroke="#2A2A30" strokeWidth="2" strokeLinecap="round" />
              </svg>
              <p className="font-display text-xl text-text-muted">
                {matches.length === 0 ? t('matches.empty.noMatches') : t('matches.empty.noFilter')}
              </p>
              {matches.length === 0 && (
                <p className="text-sm text-text-dim max-w-sm leading-relaxed">{t('matches.empty.hint')}</p>
              )}
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}

export default MatchesClient;
