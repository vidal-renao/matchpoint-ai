'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/browser';
import { signOut } from '@/lib/actions/auth';
import type { User } from '@supabase/supabase-js';

interface HeaderProps {
  locale: string;
}

export function Header({ locale }: HeaderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  const initial = user?.email?.[0].toUpperCase() ?? '?';

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-border-subtle bg-base/80 backdrop-blur-xl">
      <div className="max-w-[1200px] mx-auto px-6 h-14 flex items-center justify-between">
        {/* Logo */}
        <a href={`/${locale}`} className="flex items-center gap-2.5 group">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-accent to-accent-hover flex items-center justify-center">
            <svg width="14" height="14" viewBox="0 0 28 28" fill="none">
              <path d="M14 2L26 8v12l-12 6L2 20V8l12-6z" stroke="#050505" strokeWidth="2" fill="none" />
              <circle cx="14" cy="14" r="4" fill="#050505" opacity="0.8" />
            </svg>
          </div>
          <span className="font-display text-[15px] text-text group-hover:text-accent transition-colors">MatchPoint AI</span>
        </a>

        {/* Nav */}
        {mounted && (
          <nav className="flex items-center gap-2">
            {user ? (
              <>
                <a href={`/${locale}/matches`} className="text-sm text-text-muted hover:text-text transition-colors px-3 py-1.5">
                  My Matches
                </a>
                <a href={`/${locale}/applications`} className="text-sm text-text-muted hover:text-text transition-colors px-3 py-1.5">
                  Applications
                </a>
                <a href={`/${locale}/profile`} className="text-sm text-text-muted hover:text-text transition-colors px-3 py-1.5">
                  Profile
                </a>
                <div className="flex items-center gap-2 ml-2 pl-4 border-l border-border-subtle">
                  <div className="w-8 h-8 rounded-full bg-accent/15 border border-accent/25 flex items-center justify-center">
                    <span className="text-xs font-medium text-accent">{initial}</span>
                  </div>
                  <form action={signOut.bind(null, locale)}>
                    <button type="submit" className="text-xs text-text-dim hover:text-text transition-colors">
                      Sign out
                    </button>
                  </form>
                </div>
              </>
            ) : (
              <>
                <a href={`/${locale}/login`} className="text-sm text-text-muted hover:text-text transition-colors px-3 py-1.5">
                  Sign in
                </a>
                <a href={`/${locale}/signup`} className="text-sm font-medium px-4 py-1.5 rounded-lg bg-accent text-base hover:bg-accent-hover transition-all">
                  Get started
                </a>
              </>
            )}
          </nav>
        )}
      </div>
    </header>
  );
}
