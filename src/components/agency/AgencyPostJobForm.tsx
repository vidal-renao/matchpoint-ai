'use client';

import { useTransition, useState } from 'react';
import { useRouter } from 'next/navigation';
import { postJobForAgency } from '@/lib/actions/agency';
import { SECTORS, SECTOR_SKILLS, SALARY_PERIODS } from '@/lib/constants/jobs';

interface Props {
  agencyId: string;
  locale: string;
}

const REMOTE_OPTIONS = [
  { value: 'onsite',   label: 'On-site' },
  { value: 'hybrid',   label: 'Hybrid' },
  { value: 'remote',   label: 'Remote' },
  { value: 'flexible', label: 'Flexible' },
];

const selectCls = 'w-full bg-surface border border-border rounded-lg px-3 py-2.5 text-sm text-text focus:outline-none focus:border-accent/50 transition-colors cursor-pointer';
const inputCls  = 'w-full bg-surface border border-border rounded-lg px-3 py-2.5 text-sm text-text placeholder:text-text-dim focus:outline-none focus:border-accent/50 transition-colors';

export function AgencyPostJobForm({ agencyId, locale }: Props) {
  const [error, setError]           = useState<string | null>(null);
  const [skillInput, setSkillInput] = useState('');
  const [skills, setSkills]         = useState<string[]>([]);
  const [sector, setSector]         = useState('');
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const suggestedSkills = sector
    ? SECTOR_SKILLS[sector as keyof typeof SECTOR_SKILLS]?.filter((s) => !skills.includes(s)) ?? []
    : [];

  const addSkill = (s: string) => {
    const trimmed = s.trim();
    if (trimmed && !skills.includes(trimmed) && skills.length < 15) {
      setSkills((prev) => [...prev, trimmed]);
      setSkillInput('');
    }
  };

  const removeSkill = (skill: string) => setSkills((prev) => prev.filter((s) => s !== skill));

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    const fd = new FormData(e.currentTarget);

    const payload = {
      title:            (fd.get('title') as string).trim(),
      company:          (fd.get('company') as string).trim(),
      location:         (fd.get('location') as string).trim(),
      remote_policy:    fd.get('remote_policy') as 'onsite' | 'hybrid' | 'remote' | 'flexible',
      description:      (fd.get('description') as string).trim(),
      required_skills:  skills,
      experience_years: fd.get('experience_years') ? Number(fd.get('experience_years')) : null,
      salary_min:       fd.get('salary_min') ? Number(fd.get('salary_min')) : null,
      salary_max:       fd.get('salary_max') ? Number(fd.get('salary_max')) : null,
      salary_currency:  (fd.get('salary_currency') as string) || 'EUR',
      salary_period:    (fd.get('salary_period') as string) || 'annual',
      sector,
    };

    if (!payload.title || !payload.company || !payload.description || !payload.sector) {
      setError('Please fill in all required fields.');
      return;
    }

    startTransition(async () => {
      const result = await postJobForAgency(agencyId, payload);
      if (result.success) {
        router.push(`/${locale}/agency`);
      } else {
        setError(result.error ?? 'Failed to post job.');
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">

      {/* ── Basic info ─────────────────────────────────────────────────── */}
      <div className="glass rounded-2xl p-6 flex flex-col gap-4">
        <h2 className="text-sm font-medium text-text-muted uppercase tracking-wider">Position details</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs text-text-dim mb-1.5 block">Job title *</label>
            <input name="title" required placeholder="e.g. Senior Software Engineer"
              className={inputCls} />
          </div>
          <div>
            <label className="text-xs text-text-dim mb-1.5 block">Company name *</label>
            <input name="company" required placeholder="Your client's company"
              className={inputCls} />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs text-text-dim mb-1.5 block">Location</label>
            <input name="location" placeholder="e.g. Barcelona, ES"
              className={inputCls} />
          </div>
          <div>
            <label className="text-xs text-text-dim mb-1.5 block">Work type</label>
            <select name="remote_policy" defaultValue="hybrid" className={selectCls}>
              {REMOTE_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Sector — drives skill suggestions */}
        <div>
          <label className="text-xs text-text-dim mb-1.5 block">Sector *</label>
          <select
            name="sector"
            required
            value={sector}
            onChange={(e) => { setSector(e.target.value); setSkills([]); }}
            className={selectCls}
          >
            <option value="" disabled>Select a sector</option>
            {SECTORS.map((s) => (
              <option key={s.key} value={s.key}>{s.icon} {s.label}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-xs text-text-dim mb-1.5 block">Job description *</label>
          <textarea name="description" required rows={6}
            placeholder="Describe the role, responsibilities, ideal candidate, and what makes this opportunity compelling..."
            className={`${inputCls} resize-none`} />
        </div>
      </div>

      {/* ── Skills ─────────────────────────────────────────────────────── */}
      <div className="glass rounded-2xl p-6 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-medium text-text-muted uppercase tracking-wider">Required skills</h2>
          <span className="text-xs text-text-dim">{skills.length}/15</span>
        </div>

        {/* Manual input */}
        <div className="flex gap-2">
          <input
            value={skillInput}
            onChange={(e) => setSkillInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addSkill(skillInput); } }}
            placeholder="Type a skill and press Enter or Add"
            className={`flex-1 ${inputCls}`}
          />
          <button type="button" onClick={() => addSkill(skillInput)}
            className="px-4 py-2 rounded-lg bg-accent/10 text-accent border border-accent/20 text-sm hover:bg-accent/20 transition-colors shrink-0">
            Add
          </button>
        </div>

        {/* Sector suggestions */}
        {suggestedSkills.length > 0 && (
          <div>
            <p className="text-[10px] text-text-dim uppercase tracking-widest mb-2">Suggested for {sector}</p>
            <div className="flex flex-wrap gap-1.5">
              {suggestedSkills.slice(0, 10).map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => addSkill(s)}
                  className="text-[11px] px-2.5 py-1 rounded-full border border-dashed border-accent/30 text-text-dim hover:border-accent hover:text-accent transition-colors"
                >
                  + {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Selected skills */}
        {skills.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {skills.map((s) => (
              <span key={s} className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full bg-accent/10 text-accent border border-accent/20">
                {s}
                <button type="button" onClick={() => removeSkill(s)} className="hover:text-error transition-colors leading-none">×</button>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* ── Compensation ───────────────────────────────────────────────── */}
      <div className="glass rounded-2xl p-6 flex flex-col gap-4">
        <h2 className="text-sm font-medium text-text-muted uppercase tracking-wider">Compensation <span className="normal-case font-normal text-text-dim">(optional)</span></h2>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div>
            <label className="text-xs text-text-dim mb-1.5 block">Min</label>
            <input name="salary_min" type="number" min="0" placeholder="40000"
              className={inputCls} />
          </div>
          <div>
            <label className="text-xs text-text-dim mb-1.5 block">Max</label>
            <input name="salary_max" type="number" min="0" placeholder="60000"
              className={inputCls} />
          </div>
          <div>
            <label className="text-xs text-text-dim mb-1.5 block">Currency</label>
            <select name="salary_currency" defaultValue="EUR" className={selectCls}>
              <option value="EUR">EUR €</option>
              <option value="CHF">CHF</option>
              <option value="GBP">GBP £</option>
              <option value="USD">USD $</option>
            </select>
          </div>
          <div>
            <label className="text-xs text-text-dim mb-1.5 block">Period</label>
            <select name="salary_period" defaultValue="annual" className={selectCls}>
              {SALARY_PERIODS.map((p) => (
                <option key={p.value} value={p.value}>
                  {p.label[locale as keyof typeof p.label] ?? p.label.en}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs text-text-dim mb-1.5 block">Years of experience required</label>
            <input name="experience_years" type="number" min="0" max="30" placeholder="3"
              className={`${inputCls} sm:w-32`} />
          </div>
        </div>
      </div>

      {error && (
        <p className="text-xs text-error bg-error/5 border border-error/20 rounded-lg px-4 py-3">{error}</p>
      )}

      <div className="flex gap-3">
        <a href={`/${locale}/agency`}
          className="flex-1 text-center py-3 rounded-xl border border-border text-text-muted hover:text-text hover:border-text-dim transition-all text-sm">
          Cancel
        </a>
        <button type="submit" disabled={isPending}
          className="flex-1 py-3 rounded-xl bg-accent text-base-dark font-medium hover:bg-accent-hover transition-all disabled:opacity-60 text-sm">
          {isPending ? 'Publishing…' : 'Publish job →'}
        </button>
      </div>
    </form>
  );
}
