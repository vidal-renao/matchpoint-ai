'use client';

import { useState, useTransition } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { signIn, signUp } from '@/lib/actions/auth';
import type { Locale } from '@/lib/i18n';

interface AuthFormProps {
  mode: 'login' | 'signup';
  locale: Locale;
  next?: string;
}

export function AuthForm({ mode, locale, next }: AuthFormProps) {
  const [error, setError] = useState('');
  const [isPending, startTransition] = useTransition();

  const isLogin = mode === 'login';

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError('');
    const form = e.currentTarget;
    const formData = new FormData(form);
    formData.set('locale', locale);
    if (next) formData.set('next', next);

    startTransition(async () => {
      const action = isLogin ? signIn : signUp;
      const result = await action(formData);
      if (result?.error) setError(result.error);
    });
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <label className="text-xs uppercase tracking-widest text-text-dim">Email</label>
        <input
          name="email"
          type="email"
          required
          autoComplete="email"
          className="w-full bg-surface-raised border border-border rounded-[var(--radius-sm)] px-4 py-3 text-sm text-text placeholder:text-text-dim focus:outline-none focus:border-accent transition-colors"
          placeholder="you@example.com"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-xs uppercase tracking-widest text-text-dim">Password</label>
        <input
          name="password"
          type="password"
          required
          minLength={8}
          autoComplete={isLogin ? 'current-password' : 'new-password'}
          className="w-full bg-surface-raised border border-border rounded-[var(--radius-sm)] px-4 py-3 text-sm text-text placeholder:text-text-dim focus:outline-none focus:border-accent transition-colors"
          placeholder="••••••••"
        />
      </div>

      <AnimatePresence>
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="text-xs text-error bg-error/8 border border-error/20 rounded-lg px-3 py-2"
          >
            {error}
          </motion.p>
        )}
      </AnimatePresence>

      <motion.button
        type="submit"
        disabled={isPending}
        whileHover={{ y: -1 }}
        whileTap={{ scale: 0.98 }}
        className="w-full py-3.5 rounded-[var(--radius-sm)] bg-accent text-base text-[15px] font-medium hover:bg-accent-hover transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-2"
      >
        {isPending
          ? (isLogin ? 'Signing in...' : 'Creating account...')
          : (isLogin ? 'Sign in' : 'Create account')}
      </motion.button>
    </form>
  );
}
