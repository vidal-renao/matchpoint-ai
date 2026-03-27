'use client';

import { useTransition, useState } from 'react';
import { useRouter } from 'next/navigation';
import { postJobForAgency } from '@/lib/actions/agency';
import { SECTORS } from '@/lib/constants/jobs';

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

export function AgencyPostJobForm({ agencyId, locale }: Props) {
  const [error, setError] = useState<string | null>(null);
  const [skillInput, setSkillInput] = useState('');
  const [skills, setSkills] = useState<string[]>([]);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const addSkill = () => {
    const s = skillInput.trim();
    if (s && !skills.includes(s) && skills.length < 10) {
      setSkills([...skills, s]);
      setSkillInput('');
    }
  };

  const removeSkill = (skill: string) => setSkills(skills.filter((s) => s !== skill));

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
      sector:           fd.get('sector') as string,
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
      {/* Basic info */}
      <div className="glass rounded-2xl p-6 flex flex-col gap-4">
        <h2 className="text-sm font-medium text-text-muted uppercase tracking-wider">Position details</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs text-text-dim mb-1.5 block">Job title *</label>
            <input name="title" required placeholder="e.g. Senior Software Engineer"
              className="w-full bg-base border border-border rounded-lg px-3 py-2.5 text-sm text-text placeholder:text-text-dim focus:outline-none focus:border-accent/50 transition-colors" />
          </div>
          <div>
            <label className="text-xs text-text-dim mb-1.5 block">Company name *</label>
            <input name="company" required placeholder="Your client's company"
              className="w-full bg-base border border-border rounded-lg px-3 py-2.5 text-sm text-text placeholder:text-text-dim focus:outline-none focus:border-accent/50 transition-colors" />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs text-text-dim mb-1.5 block">Location</label>
            <input name="location" placeholder="e.g. Barcelona, ES"
              className="w-full bg-base border border-border rounded-lg px-3 py-2.5 text-sm text-text placeholder:text-text-dim focus:outline-none focus:border-accent/50 transition-colors" />
          </div>
          <div>
            <label className="text-xs text-text-dim mb-1.5 block">Work type</label>
            <select name="remote_policy" defaultValue="hybrid"
              className="w-full bg-base border border-border rounded-lg px-3 py-2.5 text-sm text-text focus:outline-none focus:border-accent/50 transition-colors cursor-pointer">
              {REMOTE_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="text-xs text-text-dim mb-1.5 block">Sector *</label>
          <select name="sector" required defaultValue=""
            className="w-full bg-base border border-border rounded-lg px-3 py-2.5 text-sm text-text focus:outline-none focus:border-accent/50 transition-colors cursor-pointer">
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
            className="w-full bg-base border border-border rounded-lg px-3 py-2.5 text-sm text-text placeholder:text-text-dim focus:outline-none focus:border-accent/50 transition-colors resize-none" />
        </div>
      </div>

      {/* Skills */}
      <div className="glass rounded-2xl p-6 flex flex-col gap-4">
        <h2 className="text-sm font-medium text-text-muted uppercase tracking-wider">Required skills</h2>
        <p className="text-xs text-text-dim">The AI will use these to score candidates. Add up to 10.</p>

        <div className="flex gap-2">
          <input
            value={skillInput}
            onChange={(e) => setSkillInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addSkill(); } }}
            placeholder="e.g. Python, React, Project Management"
            className="flex-1 bg-base border border-border rounded-lg px-3 py-2.5 text-sm text-text placeholder:text-text-dim focus:outline-none focus:border-accent/50 transition-colors"
          />
          <button type="button" onClick={addSkill}
            className="px-4 py-2 rounded-lg bg-accent/10 text-accent border border-accent/20 text-sm hover:bg-accent/20 transition-colors">
            Add
          </button>
        </div>

        {skills.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {skills.map((s) => (
              <span key={s} className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full bg-accent/10 text-accent border border-accent/20">
                {s}
                <button type="button" onClick={() => removeSkill(s)} className="hover:text-error transition-colors">×</button>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Compensation */}
      <div className="glass rounded-2xl p-6 flex flex-col gap-4">
        <h2 className="text-sm font-medium text-text-muted uppercase tracking-wider">Compensation (optional)</h2>

        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="text-xs text-text-dim mb-1.5 block">Min salary</label>
            <input name="salary_min" type="number" placeholder="40000"
              className="w-full bg-base border border-border rounded-lg px-3 py-2.5 text-sm text-text placeholder:text-text-dim focus:outline-none focus:border-accent/50 transition-colors" />
          </div>
          <div>
            <label className="text-xs text-text-dim mb-1.5 block">Max salary</label>
            <input name="salary_max" type="number" placeholder="60000"
              className="w-full bg-base border border-border rounded-lg px-3 py-2.5 text-sm text-text placeholder:text-text-dim focus:outline-none focus:border-accent/50 transition-colors" />
          </div>
          <div>
            <label className="text-xs text-text-dim mb-1.5 block">Currency</label>
            <select name="salary_currency" defaultValue="EUR"
              className="w-full bg-base border border-border rounded-lg px-3 py-2.5 text-sm text-text focus:outline-none focus:border-accent/50 transition-colors cursor-pointer">
              <option value="EUR">EUR €</option>
              <option value="CHF">CHF</option>
              <option value="GBP">GBP £</option>
              <option value="USD">USD $</option>
            </select>
          </div>
        </div>

        <div>
          <label className="text-xs text-text-dim mb-1.5 block">Years of experience required</label>
          <input name="experience_years" type="number" min="0" max="30" placeholder="3"
            className="w-full sm:w-32 bg-base border border-border rounded-lg px-3 py-2.5 text-sm text-text placeholder:text-text-dim focus:outline-none focus:border-accent/50 transition-colors" />
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
