'use client';

import { useState, useTransition } from 'react';
import { updateApplicationStage } from '@/lib/actions/applications';
import type { AgencyWithRole, AgencyCandidate } from '@/lib/actions/agency';
import type { Job, ApplicationStage } from '@/types/database';

interface Props {
  agency: AgencyWithRole;
  jobs: Job[];
  candidates: AgencyCandidate[];
  locale: string;
}

function ScoreBar({ label, score }: { label: string; score: number }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-[10px] text-text-dim w-16 shrink-0">{label}</span>
      <div className="flex-1 h-1 bg-surface-raised rounded-full overflow-hidden">
        <div className="h-full rounded-full bg-accent/60" style={{ width: `${score}%` }} />
      </div>
      <span className="text-[10px] text-text-dim w-5 text-right tabular-nums">{score}</span>
    </div>
  );
}

function ReadyToSignBtn({ applicationId, stage }: { applicationId: string; stage: ApplicationStage }) {
  const [current, setCurrent] = useState(stage);
  const [isPending, start] = useTransition();

  if (current === 'offer_sent' || current === 'hired') {
    return <span className="text-xs text-success font-medium">✅ Ready to Sign</span>;
  }
  return (
    <button
      disabled={isPending}
      onClick={() => start(async () => {
        const r = await updateApplicationStage(applicationId, 'offer_sent');
        if (r.success) setCurrent('offer_sent');
      })}
      className="text-xs px-3 py-1.5 rounded-lg bg-accent text-base-dark font-medium hover:bg-accent-hover transition-all disabled:opacity-60"
    >
      {isPending ? '…' : '✅ Ready to Sign'}
    </button>
  );
}

export function AgencyDashboard({ agency, jobs, candidates, locale }: Props) {
  const [jobFilter, setJobFilter] = useState('');
  const [minScore, setMinScore] = useState(75);

  const filtered = candidates.filter((c) => {
    if (jobFilter && c.jobId !== jobFilter) return false;
    if (c.overallScore < minScore) return false;
    return true;
  });

  const eliteCount = candidates.filter((c) => c.overallScore >= 90).length;
  const avgScore = candidates.length
    ? Math.round(candidates.reduce((a, c) => a + c.overallScore, 0) / candidates.length)
    : 0;

  return (
    <div className="max-w-[1100px] mx-auto px-6 pt-28 pb-20">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="font-display text-3xl font-normal tracking-tight">{agency.name}</h1>
          <p className="text-sm text-text-muted mt-0.5">
            Agency Dashboard ·
            <span className="ml-1.5 text-xs px-2 py-0.5 rounded-full border border-accent/20 bg-accent/8 text-accent capitalize">
              {agency.plan}
            </span>
          </p>
        </div>
        <a
          href={`/${locale}/agency/jobs/new`}
          className="shrink-0 px-5 py-2.5 rounded-xl bg-accent text-base-dark font-medium hover:bg-accent-hover transition-all text-sm"
        >
          + Post a job
        </a>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
        {[
          { label: 'Active Jobs', value: jobs.filter((j) => j.status === 'active').length },
          { label: 'Total Candidates', value: candidates.length },
          { label: 'Elite (≥90%)', value: eliteCount },
          { label: 'Avg Match Score', value: candidates.length ? `${avgScore}%` : '—' },
        ].map(({ label, value }) => (
          <div key={label} className="glass rounded-xl p-4">
            <p className="text-[10px] text-text-dim uppercase tracking-widest mb-1">{label}</p>
            <p className="font-display text-2xl font-semibold text-accent">{value}</p>
          </div>
        ))}
      </div>

      {/* Jobs list (collapsed) */}
      {jobs.length > 0 && (
        <div className="glass rounded-2xl p-5 mb-6">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-medium">Your active jobs</p>
            <a href={`/${locale}/agency/jobs/new`} className="text-xs text-accent hover:underline">+ Post new</a>
          </div>
          <div className="flex flex-col gap-1">
            {jobs.slice(0, 5).map((job) => (
              <div key={job.id} className="flex items-center justify-between text-sm py-1.5 border-b border-border-subtle last:border-0">
                <span className="text-text-muted">{job.title} · <span className="text-text-dim">{job.company}</span></span>
                <span className={`text-xs px-2 py-0.5 rounded-full ${job.status === 'active' ? 'bg-success/10 text-success' : 'bg-surface-raised text-text-dim'}`}>
                  {job.status}
                </span>
              </div>
            ))}
            {jobs.length > 5 && (
              <p className="text-xs text-text-dim mt-1">+{jobs.length - 5} more jobs</p>
            )}
          </div>
        </div>
      )}

      {/* Candidate filters */}
      <div className="glass rounded-2xl p-4 mb-5 flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2 flex-1 min-w-[200px]">
          <span className="text-xs text-text-dim shrink-0">Job:</span>
          <select
            value={jobFilter}
            onChange={(e) => setJobFilter(e.target.value)}
            className="flex-1 bg-transparent text-sm text-text focus:outline-none cursor-pointer"
          >
            <option value="">All jobs</option>
            {jobs.map((j) => (
              <option key={j.id} value={j.id}>{j.title}</option>
            ))}
          </select>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-text-dim shrink-0">Min score:</span>
          <select
            value={minScore}
            onChange={(e) => setMinScore(Number(e.target.value))}
            className="bg-transparent text-sm text-text focus:outline-none cursor-pointer"
          >
            {[50, 60, 70, 75, 80, 85, 90, 95].map((s) => (
              <option key={s} value={s}>{s}%</option>
            ))}
          </select>
        </div>
        <span className="text-xs text-text-dim">{filtered.length} candidate{filtered.length !== 1 ? 's' : ''}</span>
      </div>

      {/* Candidate cards */}
      {filtered.length === 0 ? (
        <div className="glass rounded-2xl p-12 text-center">
          <p className="text-text-dim text-sm">No candidates yet.</p>
          <p className="text-text-dim text-xs mt-1">
            {jobs.length === 0
              ? 'Post your first job to start receiving AI-matched candidates.'
              : 'Candidates will appear here once they upload a CV and get matched.'}
          </p>
          {jobs.length === 0 && (
            <a href={`/${locale}/agency/jobs/new`}
              className="inline-block mt-4 px-5 py-2 rounded-lg bg-accent text-base-dark text-sm font-medium hover:bg-accent-hover transition-all">
              Post your first job →
            </a>
          )}
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {filtered.map((c) => {
            const waLink = c.candidatePhone
              ? `https://wa.me/${c.candidatePhone.replace(/\D/g, '')}?text=${encodeURIComponent(`Hola ${c.candidateName}, te contactamos respecto a la posición ${c.jobTitle}. Tu perfil ha obtenido un ${c.overallScore}% en nuestro proceso de matching con IA. ¿Tienes disponibilidad para hablar?`)}`
              : null;

            const scoreColor = c.overallScore >= 90
              ? 'bg-success/10 text-success border-success/20'
              : c.overallScore >= 75
              ? 'bg-accent/10 text-accent border-accent/20'
              : 'bg-blue-500/10 text-blue-400 border-blue-500/20';

            return (
              <div key={c.matchId} className="glass rounded-2xl p-5">
                <div className="flex flex-col lg:flex-row gap-5">
                  {/* Left */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start gap-3 mb-3">
                      <div className="w-10 h-10 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center shrink-0">
                        <span className="font-display text-base font-semibold text-accent">
                          {c.candidateName.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-medium text-text text-sm">{c.candidateName}</span>
                          <span className={`text-[11px] px-2 py-0.5 rounded-md border font-semibold tabular-nums ${scoreColor}`}>
                            {c.overallScore}%
                          </span>
                          {c.candidateTags?.includes('ready_for_hire') && (
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-success/10 text-success border border-success/20 uppercase tracking-wider">
                              AI Approved
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-text-dim mt-0.5">
                          {c.jobTitle}
                          {c.candidateLocation ? ` · ${c.candidateLocation}` : ''}
                        </p>
                        {c.candidateEmail && (
                          <p className="text-xs text-text-dim">{c.candidateEmail}</p>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-col gap-1 mb-3">
                      <ScoreBar label="Hard Skills" score={c.hardSkillsScore} />
                      <ScoreBar label="Experience" score={c.experienceScore} />
                      <ScoreBar label="Culture" score={c.cultureScore} />
                      <ScoreBar label="Logistics" score={c.logisticsScore} />
                    </div>

                    {c.aiVerdict && (
                      <p className="text-xs text-text-muted italic line-clamp-2">"{c.aiVerdict}"</p>
                    )}

                    {c.candidateSkills?.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {c.candidateSkills.slice(0, 5).map((s) => (
                          <span key={s} className="text-[10px] px-1.5 py-0.5 rounded bg-surface-raised border border-border-subtle text-text-dim">
                            {s}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Right: actions */}
                  <div className="flex flex-col gap-2 lg:w-44 shrink-0">
                    {c.applicationStage && (
                      <span className="text-center text-xs px-3 py-1.5 rounded-lg bg-surface-raised border border-border-subtle text-text-muted capitalize">
                        {c.applicationStage.replace('_', ' ')}
                      </span>
                    )}

                    {waLink ? (
                      <a href={waLink} target="_blank" rel="noopener noreferrer"
                        className="flex items-center justify-center gap-2 text-xs px-3 py-2 rounded-lg bg-[#25D366]/10 text-[#25D366] border border-[#25D366]/20 hover:bg-[#25D366]/20 transition-all">
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                        </svg>
                        WhatsApp
                      </a>
                    ) : (
                      <span className="text-center text-xs px-3 py-2 rounded-lg border border-border-subtle text-text-dim">
                        No phone
                      </span>
                    )}

                    <a href={`/${locale}/profile?id=${c.candidateId}`} target="_blank" rel="noopener noreferrer"
                      className="text-center text-xs px-3 py-1.5 rounded-lg border border-border-subtle text-text-muted hover:text-text hover:border-border transition-colors">
                      View profile →
                    </a>

                    {c.applicationId && (
                      <div className="flex justify-center">
                        <ReadyToSignBtn
                          applicationId={c.applicationId}
                          stage={(c.applicationStage ?? 'applied') as ApplicationStage}
                        />
                      </div>
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
