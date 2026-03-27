// ============================================================================
// MatchPoint AI — CvUploadForm
// Premium drag-and-drop CV upload with AI analysis feedback
//
// Design: Luxury-editorial / tech-forward
// - Dark glass-morphism surfaces
// - Warm amber accent (#F59E0B → #D97706)
// - Animated border gradients on drag
// - Staggered analysis steps with smooth transitions
// ============================================================================

'use client';

import {
  useState,
  useRef,
  useCallback,
  startTransition,
  type DragEvent,
  type ChangeEvent,
} from 'react';
import { useTranslations, type Locale } from '@/lib/i18n';
import { uploadAndExtractCv, type UploadCvResult } from '@/lib/actions/candidates';
import { AnalysisStatusWrapper } from './AnalysisStatusWrapper';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type UploadPhase = 'idle' | 'selected' | 'uploading' | 'analyzing' | 'success' | 'error';

interface CvUploadFormProps {
  locale?: Locale;
  onSuccess?: (result: UploadCvResult) => void;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const ACCEPTED_TYPES = [
  'application/pdf',
  'image/png',
  'image/jpeg',
  'image/webp',
];

const MAX_SIZE = 10 * 1024 * 1024; // 10 MB

const FILE_ICONS: Record<string, string> = {
  'application/pdf': '📄',
  'image/png': '🖼️',
  'image/jpeg': '🖼️',
  'image/webp': '🖼️',
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function CvUploadForm({ locale = 'es', onSuccess }: CvUploadFormProps) {
  const t = useTranslations(locale);

  // State
  const [phase, setPhase] = useState<UploadPhase>('idle');
  const [file, setFile] = useState<File | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [result, setResult] = useState<UploadCvResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>('');

  const inputRef = useRef<HTMLInputElement>(null);

  // --------------------------------------------------
  // File validation
  // --------------------------------------------------
  const validateFile = useCallback(
    (f: File): string | null => {
      if (!ACCEPTED_TYPES.includes(f.type)) {
        return t('upload.supportedFormats');
      }
      if (f.size > MAX_SIZE) {
        return t('upload.supportedFormats');
      }
      return null;
    },
    [t]
  );

  // --------------------------------------------------
  // Handle file selection
  // --------------------------------------------------
  const handleFileAccepted = useCallback(
    (f: File) => {
      const err = validateFile(f);
      if (err) {
        setErrorMessage(err);
        setPhase('error');
        return;
      }
      setFile(f);
      setPhase('selected');
      setErrorMessage('');
    },
    [validateFile]
  );

  // --------------------------------------------------
  // Drag handlers
  // --------------------------------------------------
  const onDragOver = useCallback((e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  }, []);

  const onDragLeave = useCallback((e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  }, []);

  const onDrop = useCallback(
    (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragOver(false);

      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile) {
        handleFileAccepted(droppedFile);
      }
    },
    [handleFileAccepted]
  );

  const onInputChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const selected = e.target.files?.[0];
      if (selected) {
        handleFileAccepted(selected);
      }
    },
    [handleFileAccepted]
  );

  // --------------------------------------------------
  // Submit: upload + AI extraction
  // --------------------------------------------------
  const handleSubmit = useCallback(() => {
    if (!file) return;

    setPhase('uploading');

    const formData = new FormData();
    formData.append('cv', file);

    // Brief pause to show upload state, then switch to analyzing
    setTimeout(() => setPhase('analyzing'), 800);

    startTransition(() => {
      uploadAndExtractCv(formData)
        .then((res) => {
          if (res.success) {
            setResult(res);
            setPhase('success');
            onSuccess?.(res);
          } else {
            setErrorMessage(res.error ?? t('upload.error'));
            setPhase('error');
          }
        })
        .catch(() => {
          setErrorMessage(t('upload.error'));
          setPhase('error');
        });
    });
  }, [file, onSuccess, t]);

  // --------------------------------------------------
  // Reset
  // --------------------------------------------------
  const handleReset = useCallback(() => {
    setPhase('idle');
    setFile(null);
    setResult(null);
    setErrorMessage('');
    if (inputRef.current) inputRef.current.value = '';
  }, []);

  // --------------------------------------------------
  // Format file size
  // --------------------------------------------------
  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  // --------------------------------------------------
  // Render
  // --------------------------------------------------
  const isProcessing = phase === 'uploading' || phase === 'analyzing';

  return (
    <div className="mp-upload-root">
      {/* Ambient glow */}
      <div className="mp-ambient-glow" />

      {/* Main card */}
      <div className="mp-card">
        {/* Header */}
        <div className="mp-card-header">
          <div className="mp-logo-mark">
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
              <path
                d="M14 2L26 8v12l-12 6L2 20V8l12-6z"
                stroke="currentColor"
                strokeWidth="1.5"
                fill="none"
              />
              <circle cx="14" cy="14" r="4" fill="currentColor" opacity="0.6" />
            </svg>
          </div>
          <h2 className="mp-card-title">{t('upload.title')}</h2>
          <p className="mp-card-subtitle">{t('upload.subtitle')}</p>
        </div>

        {/* Analysis in progress */}
        {isProcessing && (
          <AnalysisStatusWrapper locale={locale} phase={phase} />
        )}

        {/* Success state */}
        {phase === 'success' && result?.extraction && (
          <div className="mp-success-container">
            <div className="mp-success-icon">
              <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
                <circle cx="24" cy="24" r="22" stroke="#22C55E" strokeWidth="2" opacity="0.3" />
                <path
                  d="M15 24.5L21 30.5L33 18.5"
                  stroke="#22C55E"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="mp-check-path"
                />
              </svg>
            </div>

            <p className="mp-success-text">{t('upload.success')}</p>

            <div className="mp-extraction-results">
              <div className="mp-result-row">
                <span className="mp-result-label">{t('analysis.extractedName')}</span>
                <span className="mp-result-value">{result.extraction.full_name}</span>
              </div>
              {result.extraction.email && (
                <div className="mp-result-row">
                  <span className="mp-result-label">{t('analysis.extractedEmail')}</span>
                  <span className="mp-result-value">{result.extraction.email}</span>
                </div>
              )}
              <div className="mp-result-row">
                <span className="mp-result-label">{t('analysis.extractedSkills')}</span>
                <div className="mp-skill-tags">
                  {result.extraction.top_skills.map((skill) => (
                    <span key={skill} className="mp-skill-tag">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
              <div className="mp-result-row">
                <span className="mp-result-label">{t('analysis.confidence')}</span>
                <div className="mp-confidence-bar-wrapper">
                  <div
                    className="mp-confidence-bar"
                    style={{ width: `${Math.round(result.extraction.raw_confidence * 100)}%` }}
                  />
                  <span className="mp-confidence-value">
                    {Math.round(result.extraction.raw_confidence * 100)}%
                  </span>
                </div>
              </div>
            </div>

            <div className="mp-success-actions">
              <button onClick={handleReset} className="mp-btn mp-btn-ghost">
                {t('upload.tryAgain')}
              </button>
              <a
                href={`/${locale}/profile?id=${result.candidateId}`}
                className="mp-btn mp-btn-primary"
              >
                {t('upload.viewProfile')}
              </a>
            </div>
          </div>
        )}

        {/* Error state */}
        {phase === 'error' && (
          <div className="mp-error-container">
            <div className="mp-error-icon">
              <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
                <circle cx="20" cy="20" r="18" stroke="#EF4444" strokeWidth="1.5" opacity="0.3" />
                <path d="M14 14l12 12M26 14L14 26" stroke="#EF4444" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </div>
            <p className="mp-error-text">{errorMessage || t('upload.error')}</p>
            <button onClick={handleReset} className="mp-btn mp-btn-ghost">
              {t('upload.tryAgain')}
            </button>
          </div>
        )}

        {/* Drop zone (idle & selected) */}
        {(phase === 'idle' || phase === 'selected') && (
          <>
            <div
              className={`mp-dropzone ${isDragOver ? 'mp-dropzone--active' : ''} ${
                file ? 'mp-dropzone--has-file' : ''
              }`}
              onDragOver={onDragOver}
              onDragLeave={onDragLeave}
              onDrop={onDrop}
              onClick={() => inputRef.current?.click()}
              role="button"
              tabIndex={0}
              aria-label={t('upload.dragPrompt')}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') inputRef.current?.click();
              }}
            >
              <input
                ref={inputRef}
                type="file"
                accept=".pdf,.png,.jpg,.jpeg,.webp"
                onChange={onInputChange}
                className="mp-input-hidden"
                aria-hidden="true"
              />

              {/* Animated border */}
              <div className="mp-dropzone-border" />

              {!file ? (
                <div className="mp-dropzone-content">
                  <div className="mp-upload-icon">
                    <svg width="44" height="44" viewBox="0 0 44 44" fill="none">
                      <path
                        d="M22 30V14M22 14l-7 7M22 14l7 7"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M8 28v6a4 4 0 004 4h20a4 4 0 004-4v-6"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        opacity="0.4"
                      />
                    </svg>
                  </div>
                  <p className="mp-dropzone-text">
                    {isDragOver ? t('upload.dragActive') : t('upload.dragPrompt')}
                  </p>
                  <p className="mp-dropzone-subtext">{t('upload.orBrowse')}</p>
                  <p className="mp-dropzone-formats">{t('upload.supportedFormats')}</p>
                </div>
              ) : (
                <div className="mp-file-preview" onClick={(e) => e.stopPropagation()}>
                  <span className="mp-file-icon">{FILE_ICONS[file.type] ?? '📄'}</span>
                  <div className="mp-file-info">
                    <p className="mp-file-name">{file.name}</p>
                    <p className="mp-file-size">{formatSize(file.size)}</p>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleReset();
                    }}
                    className="mp-file-remove"
                    aria-label={t('upload.removeFile')}
                  >
                    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                      <path d="M5 5l8 8M13 5l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                    </svg>
                  </button>
                </div>
              )}
            </div>

            {/* Submit button */}
            {file && (
              <button
                onClick={handleSubmit}
                className="mp-btn mp-btn-primary mp-btn-submit"
                disabled={isProcessing}
              >
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none" className="mp-btn-icon">
                  <path
                    d="M9 2L16 9l-7 7M16 9H2"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                {t('upload.submit')}
              </button>
            )}
          </>
        )}
      </div>

      {/* ---- STYLES ---- */}
      <style>{`
        /* =========================================================
           MatchPoint AI — Upload Component Styles
           Aesthetic: Luxury-editorial / tech-forward
           ========================================================= */

        @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;1,9..40,300&display=swap');

        .mp-upload-root {
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
          --mp-glass: rgba(20, 20, 22, 0.8);
          --mp-radius: 16px;
          --mp-radius-sm: 10px;
          --mp-font-display: 'Instrument Serif', Georgia, serif;
          --mp-font-body: 'DM Sans', system-ui, sans-serif;

          position: relative;
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 100%;
          padding: 2rem;
          font-family: var(--mp-font-body);
          color: var(--mp-text);
          -webkit-font-smoothing: antialiased;
        }

        /* Ambient glow behind card */
        .mp-ambient-glow {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 500px;
          height: 400px;
          background: radial-gradient(
            ellipse at center,
            var(--mp-accent-glow) 0%,
            transparent 70%
          );
          pointer-events: none;
          filter: blur(60px);
          opacity: 0.5;
        }

        /* Card */
        .mp-card {
          position: relative;
          width: 100%;
          max-width: 520px;
          background: var(--mp-glass);
          backdrop-filter: blur(24px);
          -webkit-backdrop-filter: blur(24px);
          border: 1px solid var(--mp-border-subtle);
          border-radius: var(--mp-radius);
          padding: 2.5rem;
          box-shadow:
            0 0 0 1px rgba(255, 255, 255, 0.03) inset,
            0 20px 60px rgba(0, 0, 0, 0.4);
          animation: mp-card-enter 0.6s cubic-bezier(0.16, 1, 0.3, 1) both;
        }

        @keyframes mp-card-enter {
          from {
            opacity: 0;
            transform: translateY(20px) scale(0.98);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        /* Header */
        .mp-card-header {
          text-align: center;
          margin-bottom: 2rem;
        }

        .mp-logo-mark {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 48px;
          height: 48px;
          color: var(--mp-accent);
          margin-bottom: 1rem;
          animation: mp-pulse-soft 3s ease-in-out infinite;
        }

        @keyframes mp-pulse-soft {
          0%, 100% { opacity: 0.8; }
          50% { opacity: 1; }
        }

        .mp-card-title {
          font-family: var(--mp-font-display);
          font-size: 1.75rem;
          font-weight: 400;
          letter-spacing: -0.01em;
          margin: 0 0 0.5rem;
          color: var(--mp-text);
        }

        .mp-card-subtitle {
          font-size: 0.875rem;
          color: var(--mp-text-muted);
          margin: 0;
          font-weight: 300;
          letter-spacing: 0.01em;
        }

        /* Drop Zone */
        .mp-dropzone {
          position: relative;
          border-radius: var(--mp-radius-sm);
          padding: 2.5rem 1.5rem;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
          overflow: hidden;
          background: var(--mp-surface);
        }

        .mp-dropzone:hover {
          background: var(--mp-surface-raised);
        }

        .mp-dropzone:focus-visible {
          outline: 2px solid var(--mp-accent);
          outline-offset: 2px;
        }

        /* Animated gradient border */
        .mp-dropzone-border {
          position: absolute;
          inset: 0;
          border-radius: inherit;
          border: 1.5px dashed var(--mp-border);
          transition: border-color 0.3s ease;
          pointer-events: none;
        }

        .mp-dropzone--active .mp-dropzone-border {
          border-color: var(--mp-accent);
          border-style: solid;
          box-shadow: inset 0 0 30px var(--mp-accent-glow);
        }

        .mp-dropzone--active {
          background: rgba(245, 158, 11, 0.04);
          transform: scale(1.01);
        }

        /* Drop zone content */
        .mp-dropzone-content {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.5rem;
        }

        .mp-upload-icon {
          color: var(--mp-text-dim);
          transition: color 0.3s, transform 0.3s;
          margin-bottom: 0.25rem;
        }

        .mp-dropzone:hover .mp-upload-icon,
        .mp-dropzone--active .mp-upload-icon {
          color: var(--mp-accent);
          transform: translateY(-2px);
        }

        .mp-dropzone-text {
          font-family: var(--mp-font-display);
          font-size: 1.125rem;
          color: var(--mp-text);
          margin: 0;
        }

        .mp-dropzone-subtext {
          font-size: 0.8125rem;
          color: var(--mp-text-muted);
          margin: 0;
        }

        .mp-dropzone-formats {
          font-size: 0.6875rem;
          color: var(--mp-text-dim);
          margin: 0.5rem 0 0;
          letter-spacing: 0.04em;
          text-transform: uppercase;
        }

        /* File preview */
        .mp-file-preview {
          display: flex;
          align-items: center;
          gap: 0.875rem;
          width: 100%;
          cursor: default;
        }

        .mp-file-icon {
          font-size: 1.75rem;
          flex-shrink: 0;
        }

        .mp-file-info {
          flex: 1;
          min-width: 0;
        }

        .mp-file-name {
          font-size: 0.875rem;
          font-weight: 500;
          color: var(--mp-text);
          margin: 0;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .mp-file-size {
          font-size: 0.75rem;
          color: var(--mp-text-muted);
          margin: 0.125rem 0 0;
        }

        .mp-file-remove {
          flex-shrink: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 32px;
          height: 32px;
          border-radius: 8px;
          border: none;
          background: transparent;
          color: var(--mp-text-dim);
          cursor: pointer;
          transition: all 0.2s;
        }

        .mp-file-remove:hover {
          background: rgba(239, 68, 68, 0.1);
          color: var(--mp-error);
        }

        /* Hidden input */
        .mp-input-hidden {
          position: absolute;
          width: 1px;
          height: 1px;
          overflow: hidden;
          clip: rect(0, 0, 0, 0);
        }

        /* Buttons */
        .mp-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          padding: 0.75rem 1.5rem;
          border-radius: var(--mp-radius-sm);
          font-family: var(--mp-font-body);
          font-size: 0.875rem;
          font-weight: 500;
          letter-spacing: 0.01em;
          cursor: pointer;
          transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
          border: none;
          text-decoration: none;
        }

        .mp-btn-primary {
          background: var(--mp-accent);
          color: #0A0A0B;
        }

        .mp-btn-primary:hover {
          background: var(--mp-accent-hover);
          transform: translateY(-1px);
          box-shadow: 0 4px 20px var(--mp-accent-glow);
        }

        .mp-btn-primary:active {
          transform: translateY(0);
        }

        .mp-btn-primary:disabled {
          opacity: 0.5;
          cursor: not-allowed;
          transform: none;
          box-shadow: none;
        }

        .mp-btn-ghost {
          background: transparent;
          color: var(--mp-text-muted);
          border: 1px solid var(--mp-border);
        }

        .mp-btn-ghost:hover {
          color: var(--mp-text);
          border-color: var(--mp-text-dim);
          background: var(--mp-surface-raised);
        }

        .mp-btn-submit {
          width: 100%;
          margin-top: 1rem;
          padding: 0.875rem;
          font-size: 0.9375rem;
        }

        .mp-btn-icon {
          flex-shrink: 0;
        }

        /* Success */
        .mp-success-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1.25rem;
          animation: mp-fade-up 0.5s cubic-bezier(0.16, 1, 0.3, 1) both;
        }

        @keyframes mp-fade-up {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .mp-success-icon {
          animation: mp-fade-up 0.4s cubic-bezier(0.16, 1, 0.3, 1) both;
        }

        .mp-check-path {
          stroke-dasharray: 30;
          stroke-dashoffset: 30;
          animation: mp-draw-check 0.6s 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        @keyframes mp-draw-check {
          to { stroke-dashoffset: 0; }
        }

        .mp-success-text {
          font-family: var(--mp-font-display);
          font-size: 1.125rem;
          color: var(--mp-success);
          margin: 0;
        }

        /* Extraction results */
        .mp-extraction-results {
          width: 100%;
          display: flex;
          flex-direction: column;
          gap: 0.875rem;
          background: var(--mp-surface);
          border-radius: var(--mp-radius-sm);
          padding: 1.25rem;
          border: 1px solid var(--mp-border-subtle);
        }

        .mp-result-row {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 1rem;
        }

        .mp-result-label {
          font-size: 0.75rem;
          color: var(--mp-text-dim);
          letter-spacing: 0.04em;
          text-transform: uppercase;
          flex-shrink: 0;
          padding-top: 0.125rem;
        }

        .mp-result-value {
          font-size: 0.875rem;
          color: var(--mp-text);
          font-weight: 500;
          text-align: right;
        }

        .mp-skill-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 0.375rem;
          justify-content: flex-end;
        }

        .mp-skill-tag {
          display: inline-block;
          padding: 0.25rem 0.625rem;
          border-radius: 100px;
          font-size: 0.75rem;
          font-weight: 500;
          background: var(--mp-accent-glow);
          color: var(--mp-accent);
          border: 1px solid rgba(245, 158, 11, 0.2);
        }

        /* Confidence bar */
        .mp-confidence-bar-wrapper {
          display: flex;
          align-items: center;
          gap: 0.625rem;
          flex: 1;
          max-width: 180px;
        }

        .mp-confidence-bar-wrapper {
          position: relative;
          height: 6px;
          background: var(--mp-surface-raised);
          border-radius: 3px;
          overflow: hidden;
        }

        .mp-confidence-bar {
          position: absolute;
          top: 0;
          left: 0;
          height: 100%;
          background: linear-gradient(90deg, var(--mp-accent), var(--mp-success));
          border-radius: 3px;
          transition: width 0.8s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .mp-confidence-value {
          position: absolute;
          right: -36px;
          top: 50%;
          transform: translateY(-50%);
          font-size: 0.75rem;
          font-weight: 500;
          color: var(--mp-text-muted);
          white-space: nowrap;
        }

        /* Success actions */
        .mp-success-actions {
          display: flex;
          gap: 0.75rem;
          width: 100%;
          margin-top: 0.5rem;
        }

        .mp-success-actions .mp-btn {
          flex: 1;
        }

        /* Error */
        .mp-error-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1rem;
          padding: 1rem 0;
          animation: mp-fade-up 0.4s cubic-bezier(0.16, 1, 0.3, 1) both;
        }

        .mp-error-text {
          font-size: 0.875rem;
          color: var(--mp-error);
          margin: 0;
          text-align: center;
          line-height: 1.5;
        }
      `}</style>
    </div>
  );
}

export default CvUploadForm;
