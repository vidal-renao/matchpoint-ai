// ============================================================================
// MatchPoint AI — AnalysisStatusWrapper
// Real-time feedback while AI extracts CV data
//
// - Fluid orbital spinner (pure CSS, no jank)
// - Progressive messages that cycle naturally
// - Client-only state to avoid hydration mismatches
// - Uses startTransition-compatible design
// ============================================================================

'use client';

import { useState, useEffect, useRef } from 'react';
import { useTranslations, type Locale } from '@/lib/i18n';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface AnalysisStatusWrapperProps {
  locale?: Locale;
  phase: 'uploading' | 'analyzing';
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function AnalysisStatusWrapper({
  locale = 'es',
  phase,
}: AnalysisStatusWrapperProps) {
  const t = useTranslations(locale);
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Analysis step messages (from translations)
  const steps = [
    t('analysis.step1'),
    t('analysis.step2'),
    t('analysis.step3'),
    t('analysis.step4'),
    t('analysis.step5'),
  ];

  // Entrance animation
  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 50);
    return () => clearTimeout(timer);
  }, []);

  // Cycle through steps
  useEffect(() => {
    if (phase !== 'analyzing') return;

    intervalRef.current = setInterval(() => {
      setCurrentStep((prev) => {
        // Stay on the last step once reached (don't loop)
        if (prev >= steps.length - 1) return prev;
        return prev + 1;
      });
    }, 2200); // Each step shows for ~2.2s

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [phase, steps.length]);

  const progressPercent =
    phase === 'uploading'
      ? 15
      : Math.min(95, 20 + (currentStep / (steps.length - 1)) * 75);

  return (
    <div
      className={`mp-analysis-root ${isVisible ? 'mp-analysis-root--visible' : ''}`}
    >
      {/* Orbital spinner */}
      <div className="mp-spinner-container">
        <div className="mp-spinner">
          <div className="mp-spinner-ring mp-spinner-ring--1" />
          <div className="mp-spinner-ring mp-spinner-ring--2" />
          <div className="mp-spinner-ring mp-spinner-ring--3" />
          <div className="mp-spinner-core">
            <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
              <path
                d="M11 1L21 6v10l-10 5L1 16V6l10-5z"
                stroke="currentColor"
                strokeWidth="1.2"
                fill="none"
                opacity="0.8"
              />
            </svg>
          </div>
        </div>
      </div>

      {/* Status message */}
      <div className="mp-analysis-message-container">
        {steps.map((step, idx) => (
          <p
            key={idx}
            className={`mp-analysis-message ${
              idx === currentStep ? 'mp-analysis-message--active' : ''
            } ${idx < currentStep ? 'mp-analysis-message--done' : ''}`}
          >
            {step}
          </p>
        ))}
      </div>

      {/* Progress bar */}
      <div className="mp-progress-track">
        <div
          className="mp-progress-fill"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* Step dots */}
      <div className="mp-step-dots">
        {steps.map((_, idx) => (
          <div
            key={idx}
            className={`mp-step-dot ${
              idx <= currentStep ? 'mp-step-dot--active' : ''
            }`}
          />
        ))}
      </div>

      <style>{`
        /* =========================================================
           AnalysisStatusWrapper Styles
           ========================================================= */

        .mp-analysis-root {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1.5rem;
          padding: 2rem 0 1rem;
          opacity: 0;
          transform: translateY(8px);
          transition: opacity 0.5s cubic-bezier(0.16, 1, 0.3, 1),
                      transform 0.5s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .mp-analysis-root--visible {
          opacity: 1;
          transform: translateY(0);
        }

        /* ---- Orbital Spinner ---- */
        .mp-spinner-container {
          position: relative;
          width: 80px;
          height: 80px;
        }

        .mp-spinner {
          position: relative;
          width: 100%;
          height: 100%;
        }

        .mp-spinner-ring {
          position: absolute;
          inset: 0;
          border-radius: 50%;
          border: 1.5px solid transparent;
        }

        .mp-spinner-ring--1 {
          border-top-color: var(--mp-accent, #F59E0B);
          animation: mp-spin 1.8s cubic-bezier(0.5, 0, 0.5, 1) infinite;
        }

        .mp-spinner-ring--2 {
          inset: 8px;
          border-right-color: rgba(245, 158, 11, 0.4);
          animation: mp-spin 2.4s cubic-bezier(0.5, 0, 0.5, 1) infinite reverse;
        }

        .mp-spinner-ring--3 {
          inset: 16px;
          border-bottom-color: rgba(245, 158, 11, 0.2);
          animation: mp-spin 3.2s linear infinite;
        }

        @keyframes mp-spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        .mp-spinner-core {
          position: absolute;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--mp-accent, #F59E0B);
          animation: mp-core-pulse 2s ease-in-out infinite;
        }

        @keyframes mp-core-pulse {
          0%, 100% { opacity: 0.6; transform: scale(0.95); }
          50% { opacity: 1; transform: scale(1.05); }
        }

        /* ---- Message container ---- */
        .mp-analysis-message-container {
          position: relative;
          height: 1.5rem;
          overflow: hidden;
          width: 100%;
          text-align: center;
        }

        .mp-analysis-message {
          position: absolute;
          width: 100%;
          left: 0;
          top: 0;
          margin: 0;
          font-size: 0.875rem;
          font-weight: 400;
          letter-spacing: 0.01em;
          color: var(--mp-text-muted, #8A8A94);
          opacity: 0;
          transform: translateY(12px);
          transition: opacity 0.4s ease, transform 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .mp-analysis-message--active {
          opacity: 1;
          transform: translateY(0);
          color: var(--mp-text, #F5F5F4);
        }

        .mp-analysis-message--done {
          opacity: 0;
          transform: translateY(-12px);
        }

        /* ---- Progress bar ---- */
        .mp-progress-track {
          width: 100%;
          max-width: 280px;
          height: 3px;
          background: var(--mp-surface-raised, #1C1C20);
          border-radius: 2px;
          overflow: hidden;
        }

        .mp-progress-fill {
          height: 100%;
          background: linear-gradient(
            90deg,
            var(--mp-accent, #F59E0B),
            #FBBF24
          );
          border-radius: 2px;
          transition: width 1s cubic-bezier(0.16, 1, 0.3, 1);
          position: relative;
        }

        .mp-progress-fill::after {
          content: '';
          position: absolute;
          right: 0;
          top: -1px;
          width: 20px;
          height: 5px;
          background: var(--mp-accent, #F59E0B);
          border-radius: 3px;
          filter: blur(4px);
          opacity: 0.8;
        }

        /* ---- Step dots ---- */
        .mp-step-dots {
          display: flex;
          gap: 6px;
        }

        .mp-step-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: var(--mp-border, #2A2A30);
          transition: background 0.4s ease, transform 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .mp-step-dot--active {
          background: var(--mp-accent, #F59E0B);
          transform: scale(1.2);
        }
      `}</style>
    </div>
  );
}

export default AnalysisStatusWrapper;
