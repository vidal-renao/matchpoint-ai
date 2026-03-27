import { AuthForm } from '@/components/auth/AuthForm';
import type { Locale } from '@/lib/i18n';

interface Props {
  params: Promise<{ locale: Locale }>;
}

export default async function SignupPage({ params }: Props) {
  const { locale } = await params;

  return (
    <div className="relative w-full max-w-[420px]">
      <div className="glass rounded-[var(--radius-card)] p-10">
        {/* Logo */}
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent to-accent-hover flex items-center justify-center flex-shrink-0">
            <svg width="20" height="20" viewBox="0 0 28 28" fill="none">
              <path d="M14 2L26 8v12l-12 6L2 20V8l12-6z" stroke="#050505" strokeWidth="1.5" fill="none" />
              <circle cx="14" cy="14" r="4" fill="#050505" opacity="0.8" />
            </svg>
          </div>
          <span className="font-display text-xl text-text">MatchPoint AI</span>
        </div>

        <h1 className="font-display text-2xl font-normal tracking-tight mb-1">Get started free</h1>
        <p className="text-sm text-text-muted mb-8">Upload your CV and let AI find your perfect match</p>

        <AuthForm mode="signup" locale={locale} />

        <p className="text-center text-sm text-text-dim mt-6">
          Already have an account?{' '}
          <a href={`/${locale}/login`} className="text-accent hover:text-accent-hover transition-colors">
            Sign in
          </a>
        </p>
      </div>
    </div>
  );
}
