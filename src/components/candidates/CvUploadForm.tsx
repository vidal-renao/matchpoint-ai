'use client';

// ============================================================================
// CvUploadForm — drag-and-drop CV upload with AI analysis feedback
// frontend-design: Luxury-Editorial, amber glassmorphism
// ui-ux-pro-max: framer-motion for all phase transitions, zero jank
// ============================================================================

import {
  useState,
  useRef,
  useCallback,
  startTransition,
  type DragEvent,
  type ChangeEvent,
} from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslations, type Locale } from '@/lib/i18n';
import { uploadAndExtractCv, type UploadCvResult } from '@/lib/actions/candidates';
import { triggerMatchingIfReady } from '@/lib/actions/matching';
import { AnalysisStatusWrapper } from './AnalysisStatusWrapper';
import { cn } from '@/lib/utils';

type UploadPhase = 'idle' | 'selected' | 'uploading' | 'analyzing' | 'success' | 'error';

interface CvUploadFormProps {
  locale?: Locale;
  onSuccess?: (result: UploadCvResult) => void;
}

const ACCEPTED_TYPES = ['application/pdf', 'image/png', 'image/jpeg', 'image/webp'];
const MAX_SIZE = 10 * 1024 * 1024;
const FILE_ICONS: Record<string, string> = {
  'application/pdf': '📄',
  'image/png': '🖼️',
  'image/jpeg': '🖼️',
  'image/webp': '🖼️',
};

const cardVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.98 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } },
};

const phaseVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] } },
  exit:   { opacity: 0, y: -12, transition: { duration: 0.25 } },
};

export function CvUploadForm({ locale = 'es', onSuccess }: CvUploadFormProps) {
  const t = useTranslations(locale);
  const [phase, setPhase] = useState<UploadPhase>('idle');
  const [file, setFile] = useState<File | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [result, setResult] = useState<UploadCvResult | null>(null);
  const [errorMsg, setErrorMsg] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const validateFile = useCallback((f: File): string | null => {
    if (!ACCEPTED_TYPES.includes(f.type)) return t('upload.supportedFormats');
    if (f.size > MAX_SIZE) return t('upload.supportedFormats');
    return null;
  }, [t]);

  const handleFileAccepted = useCallback((f: File) => {
    const err = validateFile(f);
    if (err) { setErrorMsg(err); setPhase('error'); return; }
    setFile(f); setPhase('selected'); setErrorMsg('');
  }, [validateFile]);

  const onDragOver = useCallback((e: DragEvent) => { e.preventDefault(); setIsDragOver(true); }, []);
  const onDragLeave = useCallback((e: DragEvent) => { e.preventDefault(); setIsDragOver(false); }, []);
  const onDrop = useCallback((e: DragEvent) => {
    e.preventDefault(); setIsDragOver(false);
    const f = e.dataTransfer.files[0];
    if (f) handleFileAccepted(f);
  }, [handleFileAccepted]);
  const onInputChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) handleFileAccepted(f);
  }, [handleFileAccepted]);

  const handleSubmit = useCallback(() => {
    if (!file) return;
    setPhase('uploading');
    const formData = new FormData();
    formData.append('cv', file);
    const timer = setTimeout(() => setPhase('analyzing'), 800);

    startTransition(() => {
      uploadAndExtractCv(formData)
        .then((res) => {
          clearTimeout(timer);
          if (res.success && res.candidateId) {
            setResult(res);
            setPhase('success');
            onSuccess?.(res);
            // Fire-and-forget: trigger matching pipeline
            triggerMatchingIfReady(res.candidateId, 'review_needed').catch(() => {});
          } else {
            setErrorMsg(res.error ?? t('upload.error'));
            setPhase('error');
          }
        })
        .catch(() => { clearTimeout(timer); setErrorMsg(t('upload.error')); setPhase('error'); });
    });
  }, [file, onSuccess, t]);

  const handleReset = useCallback(() => {
    setPhase('idle'); setFile(null); setResult(null); setErrorMsg('');
    if (inputRef.current) inputRef.current.value = '';
  }, []);

  const formatSize = (b: number) =>
    b < 1024 ? `${b} B` : b < 1048576 ? `${(b / 1024).toFixed(1)} KB` : `${(b / 1048576).toFixed(1)} MB`;

  const isProcessing = phase === 'uploading' || phase === 'analyzing';

  return (
    <div className="relative flex items-center justify-center min-h-full p-8">
      {/* Ambient glow */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-[500px] h-[400px] rounded-full bg-accent/5 blur-[80px] opacity-60" />
      </div>

      <motion.div
        variants={cardVariants}
        initial="hidden"
        animate="visible"
        className="relative w-full max-w-[520px] glass rounded-[var(--radius-card)] p-10 shadow-[var(--shadow-card)]"
        style={{ boxShadow: '0 0 0 1px rgba(255,255,255,0.03) inset, 0 20px 60px rgba(0,0,0,0.5)' }}
      >
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 text-accent mb-4 animate-pulse">
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
              <path d="M14 2L26 8v12l-12 6L2 20V8l12-6z" stroke="currentColor" strokeWidth="1.5" fill="none" />
              <circle cx="14" cy="14" r="4" fill="currentColor" opacity="0.6" />
            </svg>
          </div>
          <h2 className="font-display text-[1.75rem] font-normal tracking-tight text-text mb-2">{t('upload.title')}</h2>
          <p className="text-sm text-text-muted font-light">{t('upload.subtitle')}</p>
        </div>

        <AnimatePresence mode="wait">
          {/* Processing */}
          {isProcessing && (
            <motion.div key="processing" variants={phaseVariants} initial="hidden" animate="visible" exit="exit">
              <AnalysisStatusWrapper locale={locale} phase={phase} />
            </motion.div>
          )}

          {/* Success */}
          {phase === 'success' && result?.extraction && (
            <motion.div key="success" variants={phaseVariants} initial="hidden" animate="visible" exit="exit"
              className="flex flex-col items-center gap-5">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              >
                <svg width="56" height="56" viewBox="0 0 56 56" fill="none">
                  <circle cx="28" cy="28" r="26" stroke="#22C55E" strokeWidth="2" opacity="0.3" />
                  <path d="M17 28.5L24 35.5L39 21.5" stroke="#22C55E" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
                    strokeDasharray="30" strokeDashoffset="30"
                    style={{ animation: 'draw-check 0.6s 0.2s ease forwards' }} />
                </svg>
              </motion.div>
              <p className="font-display text-lg text-success">{t('upload.success')}</p>

              <div className="w-full bg-surface rounded-[var(--radius-sm)] border border-border-subtle p-5 flex flex-col gap-3">
                <div className="flex justify-between items-center">
                  <span className="text-xs uppercase tracking-widest text-text-dim">{t('analysis.extractedName')}</span>
                  <span className="text-sm font-medium text-text">{result.extraction.full_name}</span>
                </div>
                {result.extraction.email && (
                  <div className="flex justify-between items-center">
                    <span className="text-xs uppercase tracking-widest text-text-dim">{t('analysis.extractedEmail')}</span>
                    <span className="text-sm text-text">{result.extraction.email}</span>
                  </div>
                )}
                <div className="flex justify-between items-start">
                  <span className="text-xs uppercase tracking-widest text-text-dim pt-0.5">{t('analysis.extractedSkills')}</span>
                  <div className="flex flex-wrap gap-1.5 justify-end max-w-[60%]">
                    {result.extraction.top_skills.map((s) => (
                      <span key={s} className="px-2.5 py-1 rounded-full text-xs font-medium bg-accent/10 text-accent border border-accent/20">{s}</span>
                    ))}
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs uppercase tracking-widest text-text-dim">{t('analysis.confidence')}</span>
                  <span className="font-mono text-sm text-text-muted">{Math.round(result.extraction.raw_confidence * 100)}%</span>
                </div>
              </div>

              <div className="flex gap-3 w-full mt-1">
                <button onClick={handleReset} className="flex-1 py-3 rounded-[var(--radius-sm)] border border-border text-text-muted text-sm hover:text-text hover:border-text-dim transition-all">
                  {t('upload.tryAgain')}
                </button>
                <a href={`/${locale}/matches?id=${result.candidateId}`}
                  className="flex-1 py-3 rounded-[var(--radius-sm)] bg-accent text-base text-sm font-medium text-center hover:bg-accent-hover transition-all hover:-translate-y-px hover:shadow-[var(--shadow-glow)]">
                  {t('upload.viewProfile')}
                </a>
              </div>
            </motion.div>
          )}

          {/* Error */}
          {phase === 'error' && (
            <motion.div key="error" variants={phaseVariants} initial="hidden" animate="visible" exit="exit"
              className="flex flex-col items-center gap-4 py-4">
              <svg width="44" height="44" viewBox="0 0 44 44" fill="none">
                <circle cx="22" cy="22" r="20" stroke="#EF4444" strokeWidth="1.5" opacity="0.3" />
                <path d="M15 15l14 14M29 15L15 29" stroke="#EF4444" strokeWidth="2" strokeLinecap="round" />
              </svg>
              <p className="text-sm text-error text-center leading-relaxed">{errorMsg || t('upload.error')}</p>
              <button onClick={handleReset} className="px-6 py-2.5 rounded-[var(--radius-sm)] border border-border text-text-muted text-sm hover:text-text transition-all">
                {t('upload.tryAgain')}
              </button>
            </motion.div>
          )}

          {/* Idle / Selected */}
          {(phase === 'idle' || phase === 'selected') && (
            <motion.div key="dropzone" variants={phaseVariants} initial="hidden" animate="visible" exit="exit">
              <motion.div
                animate={{ scale: isDragOver ? 1.015 : 1 }}
                transition={{ duration: 0.2 }}
                className={cn(
                  'relative rounded-[var(--radius-sm)] p-10 cursor-pointer transition-colors duration-200 overflow-hidden',
                  isDragOver ? 'bg-accent/5' : file ? 'bg-surface' : 'bg-surface hover:bg-surface-raised'
                )}
                onDragOver={onDragOver}
                onDragLeave={onDragLeave}
                onDrop={onDrop}
                onClick={() => inputRef.current?.click()}
                role="button"
                tabIndex={0}
                aria-label={t('upload.dragPrompt')}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') inputRef.current?.click(); }}
              >
                {/* Animated border */}
                <div className={cn(
                  'absolute inset-0 rounded-[var(--radius-sm)] border transition-all duration-300 pointer-events-none',
                  isDragOver ? 'border-accent shadow-[inset_0_0_30px_rgba(245,158,11,0.08)]' : 'border-dashed border-border'
                )} />

                <input ref={inputRef} type="file" accept=".pdf,.png,.jpg,.jpeg,.webp"
                  onChange={onInputChange} className="sr-only" aria-hidden />

                {!file ? (
                  <div className="flex flex-col items-center gap-2 text-center">
                    <motion.div
                      animate={{ color: isDragOver ? 'var(--color-accent)' : 'var(--color-text-dim)', y: isDragOver ? -3 : 0 }}
                      className="mb-1"
                    >
                      <svg width="44" height="44" viewBox="0 0 44 44" fill="none">
                        <path d="M22 30V14M22 14l-7 7M22 14l7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M8 28v6a4 4 0 004 4h20a4 4 0 004-4v-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.4" />
                      </svg>
                    </motion.div>
                    <p className="font-display text-lg text-text">
                      {isDragOver ? t('upload.dragActive') : t('upload.dragPrompt')}
                    </p>
                    <p className="text-sm text-text-muted">{t('upload.orBrowse')}</p>
                    <p className="text-xs text-text-dim uppercase tracking-widest mt-1">{t('upload.supportedFormats')}</p>
                  </div>
                ) : (
                  <div className="flex items-center gap-3 w-full" onClick={(e) => e.stopPropagation()}>
                    <span className="text-3xl">{FILE_ICONS[file.type] ?? '📄'}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-text truncate">{file.name}</p>
                      <p className="text-xs text-text-muted mt-0.5">{formatSize(file.size)}</p>
                    </div>
                    <button onClick={(e) => { e.stopPropagation(); handleReset(); }}
                      className="w-8 h-8 flex items-center justify-center rounded-lg text-text-dim hover:text-error hover:bg-error/10 transition-all"
                      aria-label={t('upload.removeFile')}>
                      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                        <path d="M5 5l8 8M13 5l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                      </svg>
                    </button>
                  </div>
                )}
              </motion.div>

              {file && (
                <motion.button
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  onClick={handleSubmit}
                  disabled={isProcessing}
                  className="mt-4 w-full flex items-center justify-center gap-2 py-3.5 rounded-[var(--radius-sm)] bg-accent text-base text-[15px] font-medium hover:bg-accent-hover hover:shadow-[var(--shadow-glow)] hover:-translate-y-px transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                    <path d="M9 2L16 9l-7 7M16 9H2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  {t('upload.submit')}
                </motion.button>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      <style>{`
        @keyframes draw-check { to { stroke-dashoffset: 0; } }
      `}</style>
    </div>
  );
}

export default CvUploadForm;
