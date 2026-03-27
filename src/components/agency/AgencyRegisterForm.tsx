'use client';

import { useTransition, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createAgency } from '@/lib/actions/agency';

interface Props { locale: string }

export function AgencyRegisterForm({ locale }: Props) {
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      const result = await createAgency(formData);
      if (result.success) {
        router.push(`/${locale}/agency`);
      } else {
        setError(result.error ?? 'Something went wrong.');
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <div>
        <label className="text-xs text-text-dim uppercase tracking-wider block mb-2">
          Agency / Company name *
        </label>
        <input
          name="name"
          required
          minLength={2}
          placeholder="Acme Recruitment"
          className="w-full bg-surface border border-border rounded-xl px-4 py-3 text-sm text-text placeholder:text-text-dim focus:outline-none focus:border-accent/50 transition-colors"
        />
      </div>

      <div>
        <label className="text-xs text-text-dim uppercase tracking-wider block mb-2">
          Website (optional)
        </label>
        <input
          name="website"
          type="url"
          placeholder="https://acme-recruitment.com"
          className="w-full bg-surface border border-border rounded-xl px-4 py-3 text-sm text-text placeholder:text-text-dim focus:outline-none focus:border-accent/50 transition-colors"
        />
      </div>

      <div>
        <label className="text-xs text-text-dim uppercase tracking-wider block mb-2">
          What sectors do you recruit for? (optional)
        </label>
        <textarea
          name="description"
          rows={3}
          placeholder="e.g. Technology and finance professionals in Switzerland and Germany"
          className="w-full bg-surface border border-border rounded-xl px-4 py-3 text-sm text-text placeholder:text-text-dim focus:outline-none focus:border-accent/50 transition-colors resize-none"
        />
      </div>

      {error && (
        <p className="text-xs text-error bg-error/5 border border-error/20 rounded-lg px-4 py-3">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={isPending}
        className="w-full py-3.5 rounded-xl bg-accent text-base-dark font-medium hover:bg-accent-hover transition-all disabled:opacity-60 text-sm"
      >
        {isPending ? 'Creating workspace…' : 'Create workspace →'}
      </button>

      <p className="text-xs text-text-dim text-center leading-relaxed">
        By creating a workspace you agree to our Terms of Service and Data Processing Agreement.
      </p>
    </form>
  );
}
