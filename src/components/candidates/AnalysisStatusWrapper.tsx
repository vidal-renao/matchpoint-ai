'use client';

// ============================================================================
// AnalysisStatusWrapper — orbital spinner + progressive steps
// ui-ux-pro-max: framer-motion for state transitions, no jank
// ============================================================================

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslations, type Locale } from '@/lib/i18n';

interface AnalysisStatusWrapperProps {
  locale?: Locale;
  phase: 'uploading' | 'analyzing';
}

export function AnalysisStatusWrapper({ locale = 'es', phase }: AnalysisStatusWrapperProps) {
  const t = useTranslations(locale);
  const [currentStep, setCurrentStep] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const steps = [
    t('analysis.step1'),
    t('analysis.step2'),
    t('analysis.step3'),
    t('analysis.step4'),
    t('analysis.step5'),
  ];

  useEffect(() => {
    if (phase !== 'analyzing') return;
    intervalRef.current = setInterval(() => {
      setCurrentStep((prev) => (prev >= steps.length - 1 ? prev : prev + 1));
    }, 2200);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [phase, steps.length]);

  const progress =
    phase === 'uploading' ? 15 : Math.min(95, 20 + (currentStep / (steps.length - 1)) * 75);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="flex flex-col items-center gap-6 py-8"
    >
      {/* Orbital spinner (pure CSS — continuous rotation, no React re-renders) */}
      <div className="relative w-20 h-20">
        <div className="absolute inset-0 rounded-full border border-transparent border-t-accent animate-[spin_1.8s_cubic-bezier(0.5,0,0.5,1)_infinite]" />
        <div className="absolute inset-2 rounded-full border border-transparent border-r-accent/40 animate-[spin_2.4s_cubic-bezier(0.5,0,0.5,1)_infinite_reverse]" />
        <div className="absolute inset-4 rounded-full border border-transparent border-b-accent/20 animate-[spin_3.2s_linear_infinite]" />
        <div className="absolute inset-0 flex items-center justify-center text-accent animate-pulse">
          <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
            <path d="M11 1L21 6v10l-10 5L1 16V6l10-5z" stroke="currentColor" strokeWidth="1.2" fill="none" opacity="0.8" />
          </svg>
        </div>
      </div>

      {/* Step message — AnimatePresence for smooth in/out */}
      <div className="relative h-5 w-full text-center overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.p
            key={currentStep}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="absolute inset-0 text-sm text-text-muted tracking-wide"
          >
            {steps[currentStep]}
          </motion.p>
        </AnimatePresence>
      </div>

      {/* Progress bar */}
      <div className="w-full max-w-[280px] h-[3px] bg-surface-raised rounded-full overflow-hidden">
        <motion.div
          className="h-full rounded-full bg-gradient-to-r from-accent to-yellow-300"
          animate={{ width: `${progress}%` }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
        />
      </div>

      {/* Step dots */}
      <div className="flex gap-1.5">
        {steps.map((_, i) => (
          <motion.div
            key={i}
            animate={{
              backgroundColor: i <= currentStep ? 'var(--color-accent)' : 'var(--color-border)',
              scale: i === currentStep ? 1.25 : 1,
            }}
            transition={{ duration: 0.4 }}
            className="w-1.5 h-1.5 rounded-full"
          />
        ))}
      </div>
    </motion.div>
  );
}

export default AnalysisStatusWrapper;
