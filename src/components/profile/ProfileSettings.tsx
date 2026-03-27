'use client';

import { useState, useTransition } from 'react';
import { createClient } from '@/lib/supabase/browser';

interface Props {
  locale: string;
  userEmail: string;
}

const inputCls = 'w-full bg-surface border border-border rounded-lg px-3 py-2.5 text-sm text-text placeholder:text-text-dim focus:outline-none focus:border-accent/50 transition-colors';
const sectionCls = 'glass rounded-2xl p-6 flex flex-col gap-4';

export function ProfileSettings({ locale, userEmail }: Props) {
  const [pwSuccess, setPwSuccess] = useState('');
  const [pwError,   setPwError]   = useState('');
  const [isPwPending, startPw]    = useTransition();

  const handleChangePassword = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setPwSuccess(''); setPwError('');
    const fd  = new FormData(e.currentTarget);
    const pw  = fd.get('password') as string;
    const pw2 = fd.get('password2') as string;

    if (pw.length < 8) { setPwError('Password must be at least 8 characters.'); return; }
    if (pw !== pw2)    { setPwError('Passwords do not match.');                   return; }

    startPw(async () => {
      const supabase = createClient();
      const { error } = await supabase.auth.updateUser({ password: pw });
      if (error) { setPwError(error.message); }
      else       { setPwSuccess('Password updated successfully.'); (e.target as HTMLFormElement).reset(); }
    });
  };

  return (
    <div className="flex flex-col gap-6">

      {/* ── Account info ──────────────────────────────────────────── */}
      <div className={sectionCls}>
        <h2 className="text-sm font-medium text-text-muted uppercase tracking-wider">Account</h2>
        <div>
          <label className="text-xs text-text-dim mb-1.5 block">Email</label>
          <input value={userEmail} disabled className={`${inputCls} opacity-60 cursor-not-allowed`} />
          <p className="text-[11px] text-text-dim mt-1">Email changes require support. Contact us below.</p>
        </div>
      </div>

      {/* ── Change password ──────────────────────────────────────── */}
      <form onSubmit={handleChangePassword} className={sectionCls}>
        <h2 className="text-sm font-medium text-text-muted uppercase tracking-wider">Change Password</h2>

        <div>
          <label className="text-xs text-text-dim mb-1.5 block">New password</label>
          <input
            name="password"
            type="password"
            required
            minLength={8}
            placeholder="At least 8 characters"
            className={inputCls}
          />
        </div>
        <div>
          <label className="text-xs text-text-dim mb-1.5 block">Confirm new password</label>
          <input
            name="password2"
            type="password"
            required
            placeholder="Repeat new password"
            className={inputCls}
          />
        </div>

        {pwError   && <p className="text-xs text-error bg-error/5 border border-error/20 rounded-lg px-4 py-3">{pwError}</p>}
        {pwSuccess && <p className="text-xs text-success bg-success/5 border border-success/20 rounded-lg px-4 py-3">{pwSuccess}</p>}

        <button
          type="submit"
          disabled={isPwPending}
          className="py-2.5 rounded-xl bg-accent text-base-dark font-medium hover:bg-accent-hover transition-all disabled:opacity-60 text-sm"
        >
          {isPwPending ? 'Updating…' : 'Update password'}
        </button>
      </form>

      {/* ── Privacy & Data ───────────────────────────────────────── */}
      <div className={sectionCls}>
        <h2 className="text-sm font-medium text-text-muted uppercase tracking-wider">Privacy & Data</h2>
        <p className="text-xs text-text-dim leading-relaxed">
          Your data is processed in accordance with GDPR. You have the right to access, export, or delete your data at any time.
          Contact us at <a href="mailto:privacy@matchpoint.ai" className="text-accent hover:underline">privacy@matchpoint.ai</a>.
        </p>
        <div className="flex flex-wrap gap-3">
          <a
            href={`/${locale}/upload`}
            className="text-xs px-4 py-2 rounded-lg border border-border text-text-muted hover:text-text hover:border-text-dim transition-all"
          >
            Update CV →
          </a>
          <a
            href="mailto:privacy@matchpoint.ai?subject=Data%20deletion%20request"
            className="text-xs px-4 py-2 rounded-lg border border-error/30 text-error/80 hover:bg-error/5 transition-all"
          >
            Request data deletion
          </a>
        </div>
      </div>

      {/* ── Notifications ────────────────────────────────────────── */}
      <div className={sectionCls}>
        <h2 className="text-sm font-medium text-text-muted uppercase tracking-wider">Notifications</h2>
        <p className="text-xs text-text-dim">You will receive email notifications when your match score exceeds 90% on a new job. To unsubscribe, contact us.</p>
        <div className="flex items-center gap-3 p-3 bg-surface-raised rounded-lg">
          <div className="w-2 h-2 rounded-full bg-success shrink-0" />
          <p className="text-xs text-text-muted">High-score match alerts — <span className="text-success">Active</span></p>
        </div>
      </div>

    </div>
  );
}
