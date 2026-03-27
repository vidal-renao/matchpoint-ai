'use client';

import { useState, useTransition } from 'react';
import { updateApplicationStage } from '@/lib/actions/applications';
import type { EliteEntry } from '@/lib/actions/admin';
import type { ApplicationStage, Job } from '@/types/database';

interface Props {
  entries: EliteEntry[];
  jobs: Pick<Job, 'id' | 'title' | 'company'>[];
  locale: string;
}

const STAGE_LABELS: Record<ApplicationStage, string> = {
  applied: 'Applied',
  shortlisted: 'Shortlisted',
  filter_passed: 'Filter Passed',
  interview_passed: 'Interview Passed',
  offer_sent: 'Ready to Sign',
  hired: 'Hired',
  rejected: 'Rejected',
};

const STAGE_COLORS: Record<ApplicationStage, string> = {
  applied: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  shortlisted: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
  filter_passed: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  interview_passed: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  offer_sent: 'bg-success/10 text-success border-success/20',
  hired: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  rejected: 'bg-red-500/10 text-red-400 border-red-500/20',
};

function ScoreBadge({ score }: { score: number }) {
  const color =
    score >= 95 ? 'text-emerald-400 border-emerald-400/40 bg-emerald-400/10'
    : score >= 90 ? 'text-success border-success/40 bg-success/10'
    : 'text-yellow-400 border-yellow-400/40 bg-yellow-400/10';

  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border text-sm font-semibold tabular-nums ${color}`}>
      {score}%
    </span>
  );
}

function DimBar({ label, score }: { label: string; score: number }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-[11px] text-text-dim w-20 shrink-0">{label}</span>
      <div className="flex-1 h-1 rounded-full bg-surface-raised overflow-hidden">
        <div
          className="h-full rounded-full bg-accent/70"
          style={{ width: `${score}%` }}
        />
      </div>
      <span className="text-[11px] text-text-dim tabular-nums w-7 text-right">{score}</span>
    </div>
  );
}

function ReadyToSignButton({ applicationId, currentStage }: { applicationId: string; currentStage: ApplicationStage }) {
  const [stage, setStage] = useState<ApplicationStage>(currentStage);
  const [isPending, startTransition] = useTransition();

  const isReady = stage === 'offer_sent' || stage === 'hired';

  const handleClick = () => {
    startTransition(async () => {
      const result = await updateApplicationStage(applicationId, 'offer_sent');
      if (result.success) setStage('offer_sent');
    });
  };

  if (isReady) {
    return (
      <span className="flex items-center gap-1.5 text-xs text-success font-medium">
        <svg width="14" height="14" viewBox="0 0 20 20" fill="none">
          <path d="M4 10.5l5 5L16 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        Ready to Sign
      </span>
    );
  }

  return (
    <button
      onClick={handleClick}
      disabled={isPending}
      className="text-xs px-3 py-1.5 rounded-lg bg-accent text-base-dark font-medium hover:bg-accent-hover transition-all disabled:opacity-60 whitespace-nowrap"
    >
      {isPending ? 'Updating…' : '✅ Ready to Sign'}
    </button>
  );
}

export function AdminDashboard({ entries, jobs, locale }: Props) {
  const [selectedJobId, setSelectedJobId] = useState<string>('');

  const filtered = selectedJobId
    ? entries.filter((e) => e.job.id === selectedJobId)
    : entries;

  // Stats
  const readyCount = entries.filter(
    (e) => e.application?.stage === 'offer_sent' || e.application?.stage === 'hired'
  ).length;
  const avgScore = entries.length
    ? Math.round(entries.reduce((acc, e) => acc + e.match.overall_score, 0) / entries.length)
    : 0;

  return (
    <div className="max-w-[1100px] mx-auto px-6 pt-28 pb-20">
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-display text-3xl font-normal tracking-tight mb-1">Recruiter Dashboard</h1>
        <p className="text-sm text-text-muted">Elite candidates — AI match score ≥ 90%</p>
      </div>

      {/* Stats strip */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {[
          { label: 'Elite Candidates', value: entries.length },
          { label: 'Ready to Sign', value: readyCount },
          { label: 'Avg Match Score', value: entries.length ? `${avgScore}%` : '—' },
        ].map(({ label, value }) => (
          <div key={label} className="glass rounded-2xl p-5">
            <p className="text-xs text-text-dim uppercase tracking-widest mb-1">{label}</p>
            <p className="font-display text-2xl font-semibold text-accent">{value}</p>
          </div>
        ))}
      </div>

      {/* Job filter */}
      <div className="glass rounded-2xl p-4 mb-6 flex items-center gap-3">
        <span className="text-sm text-text-dim shrink-0">Filter by job:</span>
        <select
          value={selectedJobId}
          onChange={(e) => setSelectedJobId(e.target.value)}
          className="flex-1 bg-transparent text-sm text-text focus:outline-none cursor-pointer"
        >
          <option value="">All jobs ({entries.length} candidates)</option>
          {jobs.map((job) => {
            const count = entries.filter((e) => e.job.id === job.id).length;
            return (
              <option key={job.id} value={job.id}>
                {job.title} @ {job.company} ({count})
              </option>
            );
          })}
        </select>
        {selectedJobId && (
          <button
            onClick={() => setSelectedJobId('')}
            className="text-xs text-text-dim hover:text-text-muted transition-colors"
          >
            Clear
          </button>
        )}
      </div>

      {/* Candidate list */}
      {filtered.length === 0 ? (
        <div className="glass rounded-2xl p-12 text-center">
          <p className="text-text-dim text-sm">No elite candidates yet.</p>
          <p className="text-text-dim text-xs mt-1">Run the matching engine to generate scores.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {filtered.map((entry) => {
            const { match, candidate, job, application } = entry;
            const waNumber = candidate.phone
              ? candidate.phone.replace(/\D/g, '')
              : null;
            const waLink = waNumber
              ? `https://wa.me/${waNumber}?text=${encodeURIComponent(`Hola ${candidate.full_name}, te contactamos desde MatchPoint AI por tu candidatura a ${job.title} en ${job.company}. Tu perfil ha superado el filtro de IA con un ${match.overall_score}% de match. ¿Tienes disponibilidad para hablar?`)}`
              : null;

            const stage: ApplicationStage = application?.stage ?? 'applied';

            return (
              <div key={match.id} className="glass rounded-2xl p-6">
                <div className="flex flex-col lg:flex-row lg:items-start gap-5">
                  {/* Left: candidate info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start gap-4 mb-4">
                      {/* Avatar */}
                      <div className="w-11 h-11 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center flex-shrink-0">
                        <span className="font-display text-lg font-semibold text-accent">
                          {candidate.full_name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h2 className="font-medium text-text">{candidate.full_name}</h2>
                          <ScoreBadge score={match.overall_score} />
                          {candidate.tags?.includes('ready_for_hire') && (
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-success/10 text-success border border-success/20 uppercase tracking-wider">
                              Ready for hire
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-text-dim mt-0.5">
                          {job.title} · {job.company}
                          {candidate.location ? ` · ${candidate.location}` : ''}
                        </p>
                        {candidate.email && (
                          <p className="text-xs text-text-dim mt-0.5">{candidate.email}</p>
                        )}
                      </div>
                    </div>

                    {/* Score breakdown */}
                    <div className="flex flex-col gap-1.5 mb-4">
                      <DimBar label="Hard Skills" score={match.hard_skills_score} />
                      <DimBar label="Experience" score={match.experience_score} />
                      <DimBar label="Culture" score={match.culture_score} />
                      <DimBar label="Logistics" score={match.logistics_score} />
                    </div>

                    {/* Verdict */}
                    {match.ai_verdict && (
                      <p className="text-xs text-text-muted leading-relaxed line-clamp-2 italic">
                        "{match.ai_verdict}"
                      </p>
                    )}

                    {/* Skills */}
                    {candidate.skills?.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-3">
                        {candidate.skills.slice(0, 6).map((skill) => (
                          <span
                            key={skill}
                            className="text-[11px] px-2 py-0.5 rounded-full bg-accent/8 text-accent border border-accent/15"
                          >
                            {skill}
                          </span>
                        ))}
                        {candidate.skills.length > 6 && (
                          <span className="text-[11px] text-text-dim">+{candidate.skills.length - 6}</span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Right: actions */}
                  <div className="flex flex-col gap-3 lg:w-48 shrink-0">
                    {/* Current stage badge */}
                    <div className={`text-center text-xs px-3 py-1.5 rounded-lg border ${STAGE_COLORS[stage]}`}>
                      {STAGE_LABELS[stage]}
                    </div>

                    {/* WhatsApp contact */}
                    {waLink ? (
                      <a
                        href={waLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-2 text-xs px-3 py-2 rounded-lg bg-[#25D366]/10 text-[#25D366] border border-[#25D366]/20 hover:bg-[#25D366]/20 transition-all"
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                        </svg>
                        Contact via WhatsApp
                      </a>
                    ) : (
                      <span className="text-xs text-text-dim text-center px-3 py-2 rounded-lg border border-border-subtle">
                        No phone number
                      </span>
                    )}

                    {/* View CV */}
                    <a
                      href={`/${locale}/profile?id=${candidate.id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-center text-xs px-3 py-1.5 rounded-lg border border-border-subtle text-text-muted hover:text-text hover:border-border transition-colors"
                    >
                      View Full Profile →
                    </a>

                    {/* Ready to Sign */}
                    {application ? (
                      <div className="flex justify-center">
                        <ReadyToSignButton
                          applicationId={application.id}
                          currentStage={stage}
                        />
                      </div>
                    ) : (
                      <span className="text-xs text-text-dim text-center">No application yet</span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
