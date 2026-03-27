// ============================================================================
// MatchPoint AI — ProfileClient
// Client component: renders candidate profile with real-time polling
// for status changes (uses startTransition to avoid UI jank)
// ============================================================================

'use client';

import { useState, useEffect, useCallback, startTransition } from 'react';
import { useTranslations, type Locale } from '@/lib/i18n';
import { getCandidateById } from '@/lib/actions/candidates';
import type { Candidate, ProcessingStatus } from '@/types/database';

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface ProfileClientProps {
  candidate: Candidate;
  locale: Locale;
}

// ---------------------------------------------------------------------------
// Status config
// ---------------------------------------------------------------------------

const STATUS_CONFIG: Record<
  ProcessingStatus,
  { color: string; icon: string; pulse: boolean }
> = {
  pending: { color: '#8A8A94', icon: '⏳', pulse: false },
  extracting: { color: '#F59E0B', icon: '🔍', pulse: true },
  extracted: { color: '#3B82F6', icon: '✓', pulse: false },
  enriching: { color: '#F59E0B', icon: '⚡', pulse: true },
  ready: { color: '#22C55E', icon: '✦', pulse: false },
  failed: { color: '#EF4444', icon: '✕', pulse: false },
};

const TERMINAL_STATUSES: ProcessingStatus[] = ['ready', 'failed', 'extracted'];

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function ProfileClient({ candidate: initial, locale }: ProfileClientProps) {
  const t = useTranslations(locale);
  const [candidate, setCandidate] = useState<Candidate>(initial);
  const [isPolling, setIsPolling] = useState(
    !TERMINAL_STATUSES.includes(initial.processing_status)
  );

  // --------------------------------------------------
  // Poll for status changes (startTransition for no UI jank)
  // --------------------------------------------------
  const poll = useCallback(() => {
    startTransition(() => {
      getCandidateById(candidate.id).then((updated) => {
        if (updated) {
          setCandidate(updated);
          if (TERMINAL_STATUSES.includes(updated.processing_status)) {
            setIsPolling(false);
          }
        }
      }).catch(() => {
        // Silently continue polling
      });
    });
  }, [candidate.id]);

  useEffect(() => {
    if (!isPolling) return;
    const interval = setInterval(poll, 2500);
    return () => clearInterval(interval);
  }, [isPolling, poll]);

  // --------------------------------------------------
  // Derived data
  // --------------------------------------------------
  const status = candidate.processing_status;
  const statusCfg = STATUS_CONFIG[status];
  const statusLabel = t(`profile.statusLabels.${status}`);
  const hasStructuredData =
    candidate.cv_structured &&
    typeof candidate.cv_structured === 'object' &&
    Object.keys(candidate.cv_structured).length > 0;
  const structured = candidate.cv_structured;
  const updatedDate = new Date(candidate.updated_at).toLocaleDateString(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className="mp-profile-root">
      <div className="mp-profile-ambient" />

      <div className="mp-profile-container">
        {/* Header */}
        <header className="mp-profile-header">
          <div className="mp-profile-avatar">
            <span className="mp-profile-avatar-letter">
              {candidate.full_name.charAt(0).toUpperCase()}
            </span>
          </div>

          <div className="mp-profile-identity">
            <h1 className="mp-profile-name">{candidate.full_name}</h1>
            {candidate.email && (
              <p className="mp-profile-email">{candidate.email}</p>
            )}
            {candidate.location && (
              <p className="mp-profile-location">📍 {candidate.location}</p>
            )}
          </div>

          {/* Status badge */}
          <div
            className={`mp-status-badge ${statusCfg.pulse ? 'mp-status-badge--pulse' : ''}`}
            style={{
              '--badge-color': statusCfg.color,
            } as React.CSSProperties}
          >
            <span className="mp-status-dot" />
            <span className="mp-status-label">{statusLabel}</span>
          </div>
        </header>

        {/* Failure reason */}
        {status === 'failed' && candidate.failure_reason && (
          <div className="mp-profile-section mp-profile-alert">
            <p className="mp-alert-label">{t('profile.failureReason')}</p>
            <p className="mp-alert-text">{candidate.failure_reason}</p>
            <a href={`/${locale}/`} className="mp-btn mp-btn-small mp-btn-accent">
              {t('profile.uploadNew')}
            </a>
          </div>
        )}

        {/* Skills */}
        <section className="mp-profile-section">
          <h2 className="mp-section-title">{t('profile.sections.skills')}</h2>
          {candidate.skills.length > 0 ? (
            <div className="mp-skill-grid">
              {candidate.skills.map((skill, idx) => (
                <span
                  key={skill}
                  className="mp-skill-chip"
                  style={{ animationDelay: `${idx * 0.06}s` }}
                >
                  {skill}
                </span>
              ))}
            </div>
          ) : (
            <p className="mp-empty-text">{t('profile.noSkills')}</p>
          )}
          {candidate.years_of_experience != null && (
            <p className="mp-experience-badge">
              {t('profile.yearsExp', { count: candidate.years_of_experience })}
              {candidate.seniority_level && (
                <span className="mp-seniority-tag">
                  {candidate.seniority_level}
                </span>
              )}
            </p>
          )}
        </section>

        {/* Experience */}
        {hasStructuredData && structured.experience?.length > 0 && (
          <section className="mp-profile-section">
            <h2 className="mp-section-title">{t('profile.sections.experience')}</h2>
            <div className="mp-timeline">
              {structured.experience.map((exp, idx) => (
                <div key={idx} className="mp-timeline-item" style={{ animationDelay: `${idx * 0.1}s` }}>
                  <div className="mp-timeline-dot" />
                  <div className="mp-timeline-content">
                    <div className="mp-timeline-header">
                      <h3 className="mp-timeline-title">{exp.title}</h3>
                      <span className="mp-timeline-dates">
                        {exp.start_date} — {exp.end_date ?? t('profile.currentPosition')}
                      </span>
                    </div>
                    <p className="mp-timeline-company">{exp.company}</p>
                    {exp.description && (
                      <p className="mp-timeline-desc">{exp.description}</p>
                    )}
                    {exp.highlights?.length > 0 && (
                      <div className="mp-timeline-highlights">
                        {exp.highlights.map((h, hIdx) => (
                          <span key={hIdx} className="mp-highlight-tag">
                            {h}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Education */}
        {hasStructuredData && structured.education?.length > 0 && (
          <section className="mp-profile-section">
            <h2 className="mp-section-title">{t('profile.sections.education')}</h2>
            <div className="mp-education-list">
              {structured.education.map((edu, idx) => (
                <div key={idx} className="mp-education-item">
                  <span className="mp-edu-degree">{edu.degree}</span>
                  <span className="mp-edu-institution">{edu.institution}</span>
                  <span className="mp-edu-year">{edu.year}</span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Languages */}
        {hasStructuredData && structured.languages?.length > 0 && (
          <section className="mp-profile-section">
            <h2 className="mp-section-title">{t('profile.sections.languages')}</h2>
            <div className="mp-lang-list">
              {structured.languages.map((lang, idx) => (
                <div key={idx} className="mp-lang-item">
                  <span className="mp-lang-name">{lang.language}</span>
                  <span className="mp-lang-level">{lang.level}</span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Certifications */}
        {hasStructuredData && structured.certifications?.length > 0 && (
          <section className="mp-profile-section">
            <h2 className="mp-section-title">{t('profile.sections.certifications')}</h2>
            <div className="mp-cert-list">
              {structured.certifications.map((cert, idx) => (
                <span key={idx} className="mp-cert-tag">{cert}</span>
              ))}
            </div>
          </section>
        )}

        {/* Footer */}
        <footer className="mp-profile-footer">
          <p className="mp-footer-text">
            {t('profile.lastUpdated')}: {updatedDate}
          </p>
          <a href={`/${locale}/`} className="mp-btn mp-btn-ghost mp-btn-small">
            {t('profile.uploadNew')}
          </a>
        </footer>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;1,9..40,300&display=swap');

        .mp-profile-root {
          --mp-bg: #0A0A0B;
          --mp-surface: #141416;
          --mp-surface-raised: #1C1C20;
          --mp-border: #2A2A30;
          --mp-border-subtle: #1E1E24;
          --mp-text: #F5F5F4;
          --mp-text-muted: #8A8A94;
          --mp-text-dim: #5A5A64;
          --mp-accent: #F59E0B;
          --mp-accent-hover: #D97706;
          --mp-accent-glow: rgba(245, 158, 11, 0.15);
          --mp-success: #22C55E;
          --mp-error: #EF4444;
          --mp-radius: 16px;
          --mp-radius-sm: 10px;
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

        .mp-profile-ambient {
          position: fixed;
          top: 0;
          left: 50%;
          transform: translateX(-50%);
          width: 600px;
          height: 300px;
          background: radial-gradient(ellipse, var(--mp-accent-glow) 0%, transparent 70%);
          pointer-events: none;
          filter: blur(80px);
          opacity: 0.3;
        }

        .mp-profile-container {
          position: relative;
          width: 100%;
          max-width: 640px;
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
          animation: mp-page-enter 0.6s cubic-bezier(0.16, 1, 0.3, 1) both;
        }

        @keyframes mp-page-enter {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }

        /* ---- Header ---- */
        .mp-profile-header {
          display: flex;
          align-items: flex-start;
          gap: 1.25rem;
          flex-wrap: wrap;
        }

        .mp-profile-avatar {
          width: 64px;
          height: 64px;
          border-radius: 16px;
          background: linear-gradient(135deg, var(--mp-accent), var(--mp-accent-hover));
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .mp-profile-avatar-letter {
          font-family: var(--mp-font-display);
          font-size: 1.75rem;
          color: #0A0A0B;
          font-weight: 400;
        }

        .mp-profile-identity {
          flex: 1;
          min-width: 0;
        }

        .mp-profile-name {
          font-family: var(--mp-font-display);
          font-size: 1.75rem;
          font-weight: 400;
          margin: 0;
          letter-spacing: -0.01em;
        }

        .mp-profile-email {
          font-size: 0.875rem;
          color: var(--mp-text-muted);
          margin: 0.25rem 0 0;
        }

        .mp-profile-location {
          font-size: 0.8125rem;
          color: var(--mp-text-dim);
          margin: 0.25rem 0 0;
        }

        /* ---- Status Badge ---- */
        .mp-status-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.375rem 0.875rem;
          border-radius: 100px;
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid var(--mp-border-subtle);
          flex-shrink: 0;
          align-self: flex-start;
          margin-top: 0.25rem;
        }

        .mp-status-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: var(--badge-color);
        }

        .mp-status-badge--pulse .mp-status-dot {
          animation: mp-dot-pulse 1.5s ease-in-out infinite;
        }

        @keyframes mp-dot-pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(0.8); }
        }

        .mp-status-label {
          font-size: 0.75rem;
          font-weight: 500;
          color: var(--badge-color);
          letter-spacing: 0.02em;
        }

        /* ---- Sections ---- */
        .mp-profile-section {
          background: var(--mp-surface);
          border: 1px solid var(--mp-border-subtle);
          border-radius: var(--mp-radius);
          padding: 1.5rem;
        }

        .mp-section-title {
          font-family: var(--mp-font-display);
          font-size: 1.125rem;
          font-weight: 400;
          margin: 0 0 1rem;
          color: var(--mp-text);
        }

        .mp-empty-text {
          font-size: 0.8125rem;
          color: var(--mp-text-dim);
          margin: 0;
          font-style: italic;
        }

        /* ---- Skills ---- */
        .mp-skill-grid {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
        }

        .mp-skill-chip {
          display: inline-block;
          padding: 0.375rem 0.875rem;
          border-radius: 100px;
          font-size: 0.8125rem;
          font-weight: 500;
          background: var(--mp-accent-glow);
          color: var(--mp-accent);
          border: 1px solid rgba(245, 158, 11, 0.2);
          animation: mp-chip-in 0.4s cubic-bezier(0.16, 1, 0.3, 1) both;
        }

        @keyframes mp-chip-in {
          from { opacity: 0; transform: scale(0.9) translateY(4px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }

        .mp-experience-badge {
          display: flex;
          align-items: center;
          gap: 0.625rem;
          margin: 1rem 0 0;
          font-size: 0.8125rem;
          color: var(--mp-text-muted);
        }

        .mp-seniority-tag {
          display: inline-block;
          padding: 0.2rem 0.625rem;
          border-radius: 100px;
          font-size: 0.6875rem;
          font-weight: 500;
          text-transform: uppercase;
          letter-spacing: 0.06em;
          background: rgba(59, 130, 246, 0.1);
          color: #60A5FA;
          border: 1px solid rgba(59, 130, 246, 0.15);
        }

        /* ---- Timeline (Experience) ---- */
        .mp-timeline {
          display: flex;
          flex-direction: column;
          gap: 0;
          position: relative;
          padding-left: 1.5rem;
        }

        .mp-timeline::before {
          content: '';
          position: absolute;
          left: 5px;
          top: 8px;
          bottom: 8px;
          width: 1px;
          background: var(--mp-border);
        }

        .mp-timeline-item {
          position: relative;
          padding-bottom: 1.5rem;
          animation: mp-fade-up 0.5s cubic-bezier(0.16, 1, 0.3, 1) both;
        }

        @keyframes mp-fade-up {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .mp-timeline-item:last-child { padding-bottom: 0; }

        .mp-timeline-dot {
          position: absolute;
          left: -1.5rem;
          top: 6px;
          width: 11px;
          height: 11px;
          border-radius: 50%;
          background: var(--mp-surface);
          border: 2px solid var(--mp-accent);
          transform: translateX(-0px);
        }

        .mp-timeline-content {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .mp-timeline-header {
          display: flex;
          justify-content: space-between;
          align-items: baseline;
          gap: 0.75rem;
          flex-wrap: wrap;
        }

        .mp-timeline-title {
          font-size: 0.9375rem;
          font-weight: 500;
          margin: 0;
          color: var(--mp-text);
        }

        .mp-timeline-dates {
          font-size: 0.75rem;
          color: var(--mp-text-dim);
          white-space: nowrap;
        }

        .mp-timeline-company {
          font-size: 0.8125rem;
          color: var(--mp-accent);
          margin: 0;
        }

        .mp-timeline-desc {
          font-size: 0.8125rem;
          color: var(--mp-text-muted);
          margin: 0.25rem 0 0;
          line-height: 1.5;
        }

        .mp-timeline-highlights {
          display: flex;
          flex-wrap: wrap;
          gap: 0.375rem;
          margin-top: 0.5rem;
        }

        .mp-highlight-tag {
          font-size: 0.6875rem;
          padding: 0.2rem 0.5rem;
          border-radius: 6px;
          background: var(--mp-surface-raised);
          color: var(--mp-text-muted);
          border: 1px solid var(--mp-border-subtle);
        }

        /* ---- Education ---- */
        .mp-education-list {
          display: flex;
          flex-direction: column;
          gap: 0.875rem;
        }

        .mp-education-item {
          display: flex;
          flex-direction: column;
          gap: 0.125rem;
        }

        .mp-edu-degree {
          font-size: 0.875rem;
          font-weight: 500;
          color: var(--mp-text);
        }

        .mp-edu-institution {
          font-size: 0.8125rem;
          color: var(--mp-text-muted);
        }

        .mp-edu-year {
          font-size: 0.75rem;
          color: var(--mp-text-dim);
        }

        /* ---- Languages ---- */
        .mp-lang-list {
          display: flex;
          flex-wrap: wrap;
          gap: 0.625rem;
        }

        .mp-lang-item {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.375rem 0.75rem;
          border-radius: 8px;
          background: var(--mp-surface-raised);
          border: 1px solid var(--mp-border-subtle);
        }

        .mp-lang-name {
          font-size: 0.8125rem;
          color: var(--mp-text);
        }

        .mp-lang-level {
          font-size: 0.6875rem;
          padding: 0.125rem 0.375rem;
          border-radius: 4px;
          background: rgba(245, 158, 11, 0.08);
          color: var(--mp-accent);
          font-weight: 500;
        }

        /* ---- Certifications ---- */
        .mp-cert-list {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
        }

        .mp-cert-tag {
          display: inline-flex;
          align-items: center;
          gap: 0.375rem;
          padding: 0.375rem 0.75rem;
          border-radius: 8px;
          font-size: 0.8125rem;
          background: rgba(34, 197, 94, 0.06);
          color: var(--mp-success);
          border: 1px solid rgba(34, 197, 94, 0.12);
        }

        .mp-cert-tag::before {
          content: '◆';
          font-size: 0.5rem;
          opacity: 0.6;
        }

        /* ---- Alert (failure) ---- */
        .mp-profile-alert {
          border-color: rgba(239, 68, 68, 0.2);
          background: rgba(239, 68, 68, 0.04);
        }

        .mp-alert-label {
          font-size: 0.75rem;
          text-transform: uppercase;
          letter-spacing: 0.06em;
          color: var(--mp-error);
          margin: 0 0 0.375rem;
          font-weight: 500;
        }

        .mp-alert-text {
          font-size: 0.8125rem;
          color: var(--mp-text-muted);
          margin: 0 0 1rem;
          line-height: 1.5;
        }

        /* ---- Footer ---- */
        .mp-profile-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-top: 0.5rem;
        }

        .mp-footer-text {
          font-size: 0.75rem;
          color: var(--mp-text-dim);
          margin: 0;
        }

        /* ---- Shared Buttons ---- */
        .mp-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          padding: 0.625rem 1.25rem;
          border-radius: var(--mp-radius-sm);
          font-family: var(--mp-font-body);
          font-size: 0.8125rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
          border: none;
          text-decoration: none;
        }

        .mp-btn-small {
          padding: 0.5rem 1rem;
          font-size: 0.75rem;
        }

        .mp-btn-accent {
          background: var(--mp-accent);
          color: #0A0A0B;
        }

        .mp-btn-accent:hover {
          background: var(--mp-accent-hover);
        }

        .mp-btn-ghost {
          background: transparent;
          color: var(--mp-text-muted);
          border: 1px solid var(--mp-border);
        }

        .mp-btn-ghost:hover {
          color: var(--mp-text);
          border-color: var(--mp-text-dim);
        }
      `}</style>
    </div>
  );
}

export default ProfileClient;
