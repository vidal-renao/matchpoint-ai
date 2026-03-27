'use client';

// ============================================================================
// ProfileClient — candidate profile with real-time status polling
// ui-ux-pro-max: startTransition polling (zero jank), framer-motion animations
// ============================================================================

import { useState, useEffect, useCallback, startTransition } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslations, type Locale } from '@/lib/i18n';
import { getCandidateById } from '@/lib/actions/candidates';
import type { Candidate, ProcessingStatus } from '@/types/database';

interface ProfileClientProps {
  candidate: Candidate;
  locale: Locale;
}

const STATUS_CONFIG: Record<ProcessingStatus, { color: string; pulse: boolean }> = {
  pending:      { color: '#8A8A94', pulse: false },
  extracting:   { color: '#f59e0b', pulse: true  },
  extracted:    { color: '#3B82F6', pulse: false },
  review_needed:{ color: '#f59e0b', pulse: true  },
  enriching:    { color: '#f59e0b', pulse: true  },
  ready:        { color: '#22C55E', pulse: false },
  failed:       { color: '#EF4444', pulse: false },
};

const TERMINAL: ProcessingStatus[] = ['ready', 'failed', 'extracted'];

export function ProfileClient({ candidate: initial, locale }: ProfileClientProps) {
  const t = useTranslations(locale);
  const [candidate, setCandidate] = useState<Candidate>(initial);
  const [polling, setPolling] = useState(!TERMINAL.includes(initial.processing_status));

  const poll = useCallback(() => {
    startTransition(() => {
      getCandidateById(candidate.id).then((updated) => {
        if (!updated) return;
        setCandidate(updated);
        if (TERMINAL.includes(updated.processing_status)) setPolling(false);
      }).catch(() => {});
    });
  }, [candidate.id]);

  useEffect(() => {
    if (!polling) return;
    const id = setInterval(poll, 2500);
    return () => clearInterval(id);
  }, [polling, poll]);

  const status    = candidate.processing_status;
  const statusCfg = STATUS_CONFIG[status];
  const structured = candidate.cv_structured;
  const hasExp    = (structured.experience?.length ?? 0) > 0;
  const hasEdu    = (structured.education?.length ?? 0) > 0;
  const hasLangs  = (structured.languages?.length ?? 0) > 0;
  const hasCerts  = (structured.certifications?.length ?? 0) > 0;

  return (
    <div className="relative min-h-screen bg-base text-text font-body antialiased flex justify-center px-4 py-8">
      <div className="ambient-glow" />

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="relative w-full max-w-[640px] flex flex-col gap-6 pb-16"
      >
        {/* Header */}
        <header className="flex items-start gap-5 flex-wrap pt-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-accent to-accent-hover flex items-center justify-center flex-shrink-0">
            <span className="font-display text-[1.75rem] text-base leading-none">
              {candidate.full_name.charAt(0).toUpperCase()}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="font-display text-[1.75rem] font-normal tracking-tight leading-tight">{candidate.full_name}</h1>
            {candidate.email && <p className="text-sm text-text-muted mt-1">{candidate.email}</p>}
            {candidate.location && <p className="text-[13px] text-text-dim mt-0.5">📍 {candidate.location}</p>}
          </div>
          {/* Status badge */}
          <div
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-border-subtle bg-surface/50 flex-shrink-0 self-start mt-1"
            style={{ color: statusCfg.color }}
          >
            <motion.div
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: statusCfg.color }}
              animate={statusCfg.pulse ? { opacity: [1, 0.4, 1], scale: [1, 0.8, 1] } : {}}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
            <span className="text-xs font-medium">{t(`profile.statusLabels.${status}`)}</span>
          </div>
        </header>

        {/* Failure */}
        <AnimatePresence>
          {status === 'failed' && candidate.failure_reason && (
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="glass rounded-[var(--radius-card)] p-6 border border-error/20 bg-error/3"
            >
              <p className="text-xs uppercase tracking-widest text-error font-semibold mb-1.5">{t('profile.failureReason')}</p>
              <p className="text-[13px] text-text-muted leading-relaxed mb-4">{candidate.failure_reason}</p>
              <a href={`/${locale}/`} className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-accent text-base text-sm font-medium hover:bg-accent-hover transition-colors">
                {t('profile.uploadNew')}
              </a>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Skills */}
        <section className="glass rounded-[var(--radius-card)] p-6">
          <h2 className="font-display text-lg font-normal mb-4">{t('profile.sections.skills')}</h2>
          {candidate.skills.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {candidate.skills.map((skill, i) => (
                <motion.span
                  key={skill}
                  initial={{ opacity: 0, scale: 0.9, y: 4 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  transition={{ delay: i * 0.05, duration: 0.3 }}
                  className="px-3.5 py-1.5 rounded-full text-[13px] font-medium bg-accent/8 text-accent border border-accent/15"
                >
                  {skill}
                </motion.span>
              ))}
            </div>
          ) : (
            <p className="text-[13px] text-text-dim italic">{t('profile.noSkills')}</p>
          )}
          {candidate.years_of_experience != null && (
            <div className="flex items-center gap-2 mt-4">
              <p className="text-[13px] text-text-muted">{t('profile.yearsExp', { count: candidate.years_of_experience })}</p>
              {candidate.seniority_level && (
                <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-blue/10 text-blue border border-blue/15 uppercase tracking-wider font-medium">
                  {candidate.seniority_level}
                </span>
              )}
            </div>
          )}
        </section>

        {/* Experience */}
        {hasExp && (
          <section className="glass rounded-[var(--radius-card)] p-6">
            <h2 className="font-display text-lg font-normal mb-5">{t('profile.sections.experience')}</h2>
            <div className="relative pl-6">
              <div className="absolute left-[5px] top-2 bottom-2 w-px bg-border" />
              {structured.experience!.map((exp, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.08 }}
                  className="relative pb-6 last:pb-0"
                >
                  <div className="absolute -left-6 top-1.5 w-[11px] h-[11px] rounded-full bg-surface border-2 border-accent" />
                  <div className="flex justify-between items-baseline gap-3 flex-wrap mb-0.5">
                    <h3 className="text-[15px] font-medium text-text">{exp.title}</h3>
                    <span className="font-mono text-xs text-text-dim whitespace-nowrap">
                      {exp.start_date} — {exp.end_date ?? t('profile.currentPosition')}
                    </span>
                  </div>
                  <p className="text-[13px] text-accent mb-1">{exp.company}</p>
                  {exp.description && <p className="text-[13px] text-text-muted leading-relaxed mb-2">{exp.description}</p>}
                  {exp.highlights?.length && (
                    <div className="flex flex-wrap gap-1.5">
                      {exp.highlights.map((h, hi) => (
                        <span key={hi} className="text-[11px] px-2 py-0.5 rounded bg-surface-raised text-text-muted border border-border-subtle">{h}</span>
                      ))}
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          </section>
        )}

        {/* Education */}
        {hasEdu && (
          <section className="glass rounded-[var(--radius-card)] p-6">
            <h2 className="font-display text-lg font-normal mb-4">{t('profile.sections.education')}</h2>
            <div className="flex flex-col gap-3">
              {structured.education!.map((edu, i) => (
                <div key={i} className="flex flex-col gap-0.5">
                  <span className="text-[14px] font-medium text-text">{edu.degree}</span>
                  <span className="text-[13px] text-text-muted">{edu.institution}</span>
                  {edu.year && <span className="font-mono text-xs text-text-dim">{edu.year}</span>}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Languages */}
        {hasLangs && (
          <section className="glass rounded-[var(--radius-card)] p-6">
            <h2 className="font-display text-lg font-normal mb-4">{t('profile.sections.languages')}</h2>
            <div className="flex flex-wrap gap-2">
              {structured.languages!.map((lang, i) => (
                <div key={i} className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-surface-raised border border-border-subtle">
                  <span className="text-[13px] text-text">{lang.language}</span>
                  <span className="text-[11px] px-2 py-0.5 rounded bg-accent/8 text-accent font-medium">{lang.level}</span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Certifications */}
        {hasCerts && (
          <section className="glass rounded-[var(--radius-card)] p-6">
            <h2 className="font-display text-lg font-normal mb-4">{t('profile.sections.certifications')}</h2>
            <div className="flex flex-wrap gap-2">
              {structured.certifications!.map((cert, i) => (
                <span key={i} className="text-[13px] px-3 py-1.5 rounded-lg bg-success/5 text-success border border-success/12 flex items-center gap-1.5 before:content-['◆'] before:text-[8px] before:opacity-60">
                  {cert}
                </span>
              ))}
            </div>
          </section>
        )}

        {/* Footer */}
        <footer className="flex justify-between items-center pt-2">
          <p className="text-xs text-text-dim">
            {t('profile.lastUpdated')}: {new Date(candidate.updated_at).toLocaleDateString(locale, { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
          <a href={`/${locale}/`} className="text-xs text-text-dim border border-border px-3 py-1.5 rounded-lg hover:text-text-muted hover:border-text-dim transition-colors">
            {t('profile.uploadNew')}
          </a>
        </footer>
      </motion.div>
    </div>
  );
}

export default ProfileClient;
