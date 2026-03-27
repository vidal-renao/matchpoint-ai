'use client';

// ============================================================================
// ApplicationsPipeline — Kanban-style application tracker
// frontend-design: Luxury-Editorial, glassmorphism, framer-motion
// ============================================================================

import { motion, AnimatePresence } from 'framer-motion';
import type { ApplicationWithJob, ApplicationStage } from '@/types/database';

const STAGES: { key: ApplicationStage; label: string; color: string }[] = [
  { key: 'applied',          label: 'Applied',          color: '#6b7280' },
  { key: 'shortlisted',      label: 'Shortlisted',      color: '#3b82f6' },
  { key: 'filter_passed',    label: 'Filter Passed',    color: '#8b5cf6' },
  { key: 'interview_passed', label: 'Interview Passed', color: '#f59e0b' },
  { key: 'offer_sent',       label: 'Offer Sent',       color: '#22c55e' },
  { key: 'hired',            label: 'Hired',            color: '#10b981' },
  { key: 'rejected',         label: 'Rejected',         color: '#ef4444' },
];

interface ApplicationsPipelineProps {
  applications: ApplicationWithJob[];
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
}

export function ApplicationsPipeline({ applications }: ApplicationsPipelineProps) {
  const active = applications.filter((a) => a.stage !== 'hired' && a.stage !== 'rejected');
  const closed = applications.filter((a) => a.stage === 'hired' || a.stage === 'rejected');

  if (applications.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
        <div className="w-14 h-14 rounded-full border border-border-subtle flex items-center justify-center opacity-30">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
              stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </div>
        <p className="text-text-muted text-sm">No applications yet.</p>
        <p className="text-text-dim text-xs max-w-[300px] leading-relaxed">
          Apply to jobs from your Matches page and they&apos;ll appear here.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      {/* Active applications */}
      {active.length > 0 && (
        <div>
          <p className="text-xs uppercase tracking-widest text-text-dim mb-4">Active ({active.length})</p>
          <div className="grid grid-cols-1 gap-3">
            <AnimatePresence>
              {active.map((app, i) => (
                <ApplicationCard key={app.id} app={app} index={i} />
              ))}
            </AnimatePresence>
          </div>
        </div>
      )}

      {/* Closed applications */}
      {closed.length > 0 && (
        <div>
          <p className="text-xs uppercase tracking-widest text-text-dim mb-4">Closed ({closed.length})</p>
          <div className="grid grid-cols-1 gap-3 opacity-60">
            {closed.map((app, i) => (
              <ApplicationCard key={app.id} app={app} index={i} />
            ))}
          </div>
        </div>
      )}

      {/* Stage legend */}
      <div className="glass rounded-xl p-5">
        <p className="text-xs uppercase tracking-widest text-text-dim mb-3">Pipeline stages</p>
        <div className="flex flex-wrap gap-3">
          {STAGES.map((s) => (
            <div key={s.key} className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: s.color }} />
              <span className="text-xs text-text-muted">{s.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ApplicationCard({ app, index }: { app: ApplicationWithJob; index: number }) {
  const stage = STAGES.find((s) => s.key === app.stage) ?? STAGES[0];

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.04, ease: [0.16, 1, 0.3, 1] }}
      className="glass rounded-xl p-5 flex items-center gap-5"
    >
      {/* Stage indicator */}
      <div className="flex-shrink-0 flex flex-col items-center gap-1">
        <div
          className="w-3 h-3 rounded-full"
          style={{ backgroundColor: stage.color, boxShadow: `0 0 8px ${stage.color}60` }}
        />
      </div>

      {/* Job info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <p className="text-sm font-medium text-text truncate">{app.job.title}</p>
          <span className="text-text-dim">·</span>
          <p className="text-sm text-text-muted truncate">{app.job.company}</p>
        </div>
        {app.job.location && (
          <p className="text-xs text-text-dim mt-0.5">{app.job.location}</p>
        )}
        {app.notes && (
          <p className="text-xs text-text-muted mt-1 italic">{app.notes}</p>
        )}
      </div>

      {/* Stage badge + date */}
      <div className="flex-shrink-0 flex flex-col items-end gap-1">
        <span
          className="text-xs font-medium px-2.5 py-1 rounded-full border"
          style={{ color: stage.color, borderColor: `${stage.color}40`, backgroundColor: `${stage.color}10` }}
        >
          {stage.label}
        </span>
        <span className="text-[10px] text-text-dim">{formatDate(app.stage_updated_at)}</span>
      </div>
    </motion.div>
  );
}
