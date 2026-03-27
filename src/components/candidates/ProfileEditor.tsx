'use client';

// ============================================================================
// ProfileEditor — Inline CV editing with AI enhancement
// frontend-design: Luxury-Editorial, glassmorphism, framer-motion
// ============================================================================

import { useState, useTransition, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { updateCandidateProfile, enhanceProfileWithAI } from '@/lib/actions/profile';
import type { Candidate } from '@/types/database';

interface ProfileEditorProps {
  candidate: Candidate;
  onSaved: (updated: Partial<Candidate>) => void;
}

const SENIORITY_LEVELS = ['Intern', 'Junior', 'Mid', 'Senior', 'Lead', 'Principal', 'Director', 'VP', 'C-Level'];

export function ProfileEditor({ candidate, onSaved }: ProfileEditorProps) {
  const [fullName, setFullName] = useState(candidate.full_name);
  const [email, setEmail] = useState(candidate.email ?? '');
  const [phone, setPhone] = useState(candidate.phone ?? '');
  const [location, setLocation] = useState(candidate.location ?? '');
  const [skills, setSkills] = useState(candidate.skills.join(', '));
  const [yearsExp, setYearsExp] = useState(String(candidate.years_of_experience ?? ''));
  const [seniority, setSeniority] = useState(candidate.seniority_level ?? '');
  const [aiText, setAiText] = useState('');
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saved' | 'error'>('idle');
  const [aiStatus, setAiStatus] = useState<'idle' | 'enhancing' | 'done' | 'error'>('idle');
  const [isPending, startTransition] = useTransition();
  const [isAiPending, startAiTransition] = useTransition();
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleSave = () => {
    startTransition(async () => {
      const result = await updateCandidateProfile({
        full_name: fullName.trim() || undefined,
        email: email.trim() || undefined,
        phone: phone.trim() || undefined,
        location: location.trim() || undefined,
        skills: skills.split(',').map((s) => s.trim()).filter(Boolean),
        years_of_experience: yearsExp ? Number(yearsExp) : null,
        seniority_level: seniority || null,
      });

      if (result.success) {
        setSaveStatus('saved');
        onSaved({
          full_name: fullName,
          email: email || null,
          phone: phone || null,
          location: location || null,
          skills: skills.split(',').map((s) => s.trim()).filter(Boolean),
          years_of_experience: yearsExp ? Number(yearsExp) : null,
          seniority_level: seniority || null,
        });
        if (timerRef.current) clearTimeout(timerRef.current);
        timerRef.current = setTimeout(() => setSaveStatus('idle'), 2500);
      } else {
        setSaveStatus('error');
      }
    });
  };

  const handleEnhance = () => {
    if (!aiText.trim()) return;
    setAiStatus('enhancing');
    startAiTransition(async () => {
      const result = await enhanceProfileWithAI(candidate.id, aiText);
      if (result.success) {
        setAiStatus('done');
        setAiText('');
        onSaved({ cv_structured: result.cv_structured });
      } else {
        setAiStatus('error');
      }
    });
  };

  return (
    <div className="space-y-8">
      {/* Basic info */}
      <div className="glass rounded-xl p-6 space-y-4">
        <p className="text-xs uppercase tracking-widest text-text-dim mb-2">Basic Info</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Full Name" value={fullName} onChange={setFullName} />
          <Field label="Email" value={email} onChange={setEmail} type="email" />
          <Field label="Phone" value={phone} onChange={setPhone} />
          <Field label="Location" value={location} onChange={setLocation} />
        </div>

        <Field
          label="Skills (comma-separated)"
          value={skills}
          onChange={setSkills}
          hint="e.g. React, TypeScript, Node.js"
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field
            label="Years of Experience"
            value={yearsExp}
            onChange={setYearsExp}
            type="number"
          />
          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-text-dim uppercase tracking-widest">Seniority Level</label>
            <select
              value={seniority}
              onChange={(e) => setSeniority(e.target.value)}
              className="bg-surface border border-border rounded-lg px-3 py-2.5 text-sm text-text focus:outline-none focus:border-accent/50 transition-colors"
            >
              <option value="">— Select —</option>
              {SENIORITY_LEVELS.map((l) => (
                <option key={l} value={l}>{l}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Save button */}
        <div className="flex items-center gap-3 pt-2">
          <button
            onClick={handleSave}
            disabled={isPending}
            className="px-6 py-2.5 rounded-lg bg-accent text-base text-sm font-medium hover:bg-accent-hover transition-all disabled:opacity-50"
          >
            {isPending ? 'Saving…' : 'Save changes'}
          </button>
          <AnimatePresence>
            {saveStatus === 'saved' && (
              <motion.span
                initial={{ opacity: 0, x: -4 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0 }}
                className="text-xs text-success"
              >
                ✓ Saved
              </motion.span>
            )}
            {saveStatus === 'error' && (
              <motion.span
                initial={{ opacity: 0, x: -4 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0 }}
                className="text-xs text-error"
              >
                Save failed — try again
              </motion.span>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* AI Enhancement */}
      <div className="glass rounded-xl p-6 space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-widest text-text-dim">AI Profile Enhancement</p>
            <p className="text-sm text-text-muted mt-1">
              Paste your work history or bio — Claude will structure it into your profile.
            </p>
          </div>
          <span className="text-xs px-2.5 py-1 rounded-full border border-accent/30 text-accent bg-accent/5 flex-shrink-0">
            claude-sonnet-4-6
          </span>
        </div>

        <textarea
          value={aiText}
          onChange={(e) => setAiText(e.target.value)}
          placeholder="I worked as a Senior Software Engineer at Acme Corp from 2021 to 2024…"
          rows={5}
          className="w-full bg-surface border border-border rounded-lg px-3 py-2.5 text-sm text-text placeholder:text-text-dim focus:outline-none focus:border-accent/50 transition-colors resize-none"
        />

        <div className="flex items-center gap-3">
          <button
            onClick={handleEnhance}
            disabled={isAiPending || !aiText.trim()}
            className="px-6 py-2.5 rounded-lg border border-accent/30 text-accent text-sm hover:bg-accent/10 transition-all disabled:opacity-50"
          >
            {isAiPending ? 'Enhancing…' : '✦ Enhance with AI'}
          </button>
          <AnimatePresence>
            {aiStatus === 'done' && (
              <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="text-xs text-success">
                ✓ Profile enhanced
              </motion.span>
            )}
            {aiStatus === 'error' && (
              <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="text-xs text-error">
                Enhancement failed
              </motion.span>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

function Field({
  label, value, onChange, type = 'text', hint,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  hint?: string;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs text-text-dim uppercase tracking-widest">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="bg-surface border border-border rounded-lg px-3 py-2.5 text-sm text-text placeholder:text-text-dim focus:outline-none focus:border-accent/50 transition-colors"
      />
      {hint && <p className="text-[11px] text-text-dim">{hint}</p>}
    </div>
  );
}
