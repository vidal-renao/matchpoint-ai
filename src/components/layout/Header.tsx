'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/browser';
import { signOut } from '@/lib/actions/auth';
import type { User } from '@supabase/supabase-js';

interface HeaderProps {
  locale: string;
  /** Optional: show agency sub-navigation */
  section?: 'agency' | 'candidate' | 'admin';
}

const LOCALES = [
  { code: 'es', label: 'ES', flag: '🇪🇸' },
  { code: 'en', label: 'EN', flag: '🇬🇧' },
  { code: 'de', label: 'DE', flag: '🇩🇪' },
  { code: 'it', label: 'IT', flag: '🇮🇹' },
];

export function Header({ locale, section }: HeaderProps) {
  const [user, setUser]       = useState<User | null>(null);
  const [mounted, setMounted] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

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

  const adminEmails = (process.env.NEXT_PUBLIC_ADMIN_EMAILS ?? '')
    .split(',').map((e) => e.trim().toLowerCase()).filter(Boolean);
  const isAdmin = !!user?.email && adminEmails.includes(user.email.toLowerCase());

  // Swap locale in current URL
  const switchLocalePath = (newLocale: string) => {
    if (typeof window === 'undefined') return `/${newLocale}`;
    const current = window.location.pathname;
    const parts = current.split('/');
    if (LOCALES.some((l) => l.code === parts[1])) {
      parts[1] = newLocale;
      return parts.join('/') + window.location.search;
    }
    return `/${newLocale}${current}`;
  };

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-border-subtle bg-base/90 backdrop-blur-xl">
        <div className="max-w-[1300px] mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">

          {/* Logo */}
          <a href={`/${locale}`} className="flex items-center gap-2.5 group shrink-0">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-accent to-accent-hover flex items-center justify-center">
              <svg width="14" height="14" viewBox="0 0 28 28" fill="none">
                <path d="M14 2L26 8v12l-12 6L2 20V8l12-6z" stroke="#050505" strokeWidth="2" fill="none" />
                <circle cx="14" cy="14" r="4" fill="#050505" opacity="0.8" />
              </svg>
            </div>
            <span className="font-display text-[15px] text-text group-hover:text-accent transition-colors hidden sm:inline">
              MatchPoint AI
            </span>
          </a>

          {/* Centre nav links — desktop */}
          <nav className="hidden md:flex items-center gap-1">
            <a href={`/${locale}/jobs`}
              className="text-sm text-text-muted hover:text-text transition-colors px-3 py-1.5 rounded-lg hover:bg-surface-raised">
              Jobs
            </a>
            {user && (
              <>
                <a href={`/${locale}/matches`}
                  className="text-sm text-text-muted hover:text-text transition-colors px-3 py-1.5 rounded-lg hover:bg-surface-raised">
                  My Matches
                </a>
                <a href={`/${locale}/applications`}
                  className="text-sm text-text-muted hover:text-text transition-colors px-3 py-1.5 rounded-lg hover:bg-surface-raised">
                  Applications
                </a>
                <a href={`/${locale}/agency`}
                  className="text-sm text-text-muted hover:text-text transition-colors px-3 py-1.5 rounded-lg hover:bg-surface-raised">
                  Agency
                </a>
              </>
            )}
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-2">

            {/* Language switcher */}
            {mounted && (
              <div className="relative group">
                <button className="flex items-center gap-1 text-xs text-text-dim hover:text-text px-2 py-1.5 rounded-lg hover:bg-surface-raised transition-colors border border-transparent hover:border-border-subtle">
                  {LOCALES.find((l) => l.code === locale)?.flag ?? '🌐'}
                  <span className="hidden sm:inline font-medium">{locale.toUpperCase()}</span>
                  <svg width="10" height="10" viewBox="0 0 10 10" fill="currentColor" className="opacity-50">
                    <path d="M2 3.5l3 3 3-3" stroke="currentColor" strokeWidth="1.2" fill="none" strokeLinecap="round" />
                  </svg>
                </button>
                <div className="absolute right-0 top-full mt-1 w-32 py-1 bg-surface border border-border rounded-xl shadow-xl opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-opacity z-50">
                  {LOCALES.map((l) => (
                    <a
                      key={l.code}
                      href={switchLocalePath(l.code)}
                      className={`flex items-center gap-2 px-3 py-2 text-sm hover:bg-surface-raised transition-colors ${
                        l.code === locale ? 'text-accent font-medium' : 'text-text-muted'
                      }`}
                    >
                      <span>{l.flag}</span>
                      <span>{l.label}</span>
                    </a>
                  ))}
                </div>
              </div>
            )}

            {mounted && (
              <>
                {user ? (
                  <div className="flex items-center gap-2">
                    {isAdmin && (
                      <a
                        href={`/${locale}/admin`}
                        className="hidden sm:flex text-xs font-semibold px-3 py-1.5 rounded-lg bg-accent/15 text-accent border border-accent/30 hover:bg-accent/25 transition-all"
                      >
                        Panel Jefe
                      </a>
                    )}
                    {/* Avatar + dropdown */}
                    <div className="relative group">
                      <button className="flex items-center gap-2 pl-3 border-l border-border-subtle">
                        <div className="w-8 h-8 rounded-full bg-accent/15 border border-accent/25 flex items-center justify-center">
                          <span className="text-xs font-semibold text-accent">{initial}</span>
                        </div>
                        <svg width="10" height="10" viewBox="0 0 10 10" fill="currentColor" className="text-text-dim opacity-60 hidden sm:block">
                          <path d="M2 3.5l3 3 3-3" stroke="currentColor" strokeWidth="1.2" fill="none" strokeLinecap="round" />
                        </svg>
                      </button>
                      {/* Dropdown menu */}
                      <div className="absolute right-0 top-full mt-2 w-52 py-1 bg-surface border border-border rounded-xl shadow-xl opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-opacity z-50">
                        <div className="px-3 py-2 border-b border-border-subtle">
                          <p className="text-xs text-text-dim truncate">{user.email}</p>
                        </div>
                        <a href={`/${locale}/profile`} className="flex items-center gap-2 px-3 py-2 text-sm text-text-muted hover:text-text hover:bg-surface-raised transition-colors">
                          <span>👤</span> Profile
                        </a>
                        <a href={`/${locale}/profile/settings`} className="flex items-center gap-2 px-3 py-2 text-sm text-text-muted hover:text-text hover:bg-surface-raised transition-colors">
                          <span>⚙️</span> Settings
                        </a>
                        <a href={`/${locale}/matches`} className="flex items-center gap-2 px-3 py-2 text-sm text-text-muted hover:text-text hover:bg-surface-raised transition-colors md:hidden">
                          <span>✨</span> My Matches
                        </a>
                        <a href={`/${locale}/applications`} className="flex items-center gap-2 px-3 py-2 text-sm text-text-muted hover:text-text hover:bg-surface-raised transition-colors md:hidden">
                          <span>📋</span> Applications
                        </a>
                        <a href={`/${locale}/agency`} className="flex items-center gap-2 px-3 py-2 text-sm text-text-muted hover:text-text hover:bg-surface-raised transition-colors md:hidden">
                          <span>🏢</span> Agency Portal
                        </a>
                        {isAdmin && (
                          <a href={`/${locale}/admin`} className="flex items-center gap-2 px-3 py-2 text-sm text-accent hover:bg-surface-raised transition-colors md:hidden">
                            <span>⚡</span> Panel Jefe
                          </a>
                        )}
                        <div className="border-t border-border-subtle mt-1 pt-1">
                          <form action={signOut.bind(null, locale)}>
                            <button type="submit" className="w-full flex items-center gap-2 px-3 py-2 text-sm text-text-dim hover:text-error hover:bg-surface-raised transition-colors text-left">
                              <span>↩</span> Sign out
                            </button>
                          </form>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <a href={`/${locale}/login`}
                      className="text-sm text-text-muted hover:text-text transition-colors px-3 py-1.5">
                      Sign in
                    </a>
                    <a href={`/${locale}/signup`}
                      className="text-sm font-medium px-4 py-1.5 rounded-lg bg-accent text-base-dark hover:bg-accent-hover transition-all">
                      Get started
                    </a>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Agency sub-navigation */}
        {section === 'agency' && (
          <div className="border-t border-border-subtle bg-base/95">
            <div className="max-w-[1300px] mx-auto px-6 flex items-center gap-0 h-10 overflow-x-auto">
              {[
                { href: `/${locale}/agency`,          label: 'Dashboard',  icon: '📊' },
                { href: `/${locale}/agency/jobs/new`, label: 'Post Job',   icon: '✚' },
                { href: `/${locale}/jobs`,            label: 'Job Board',  icon: '🔍' },
              ].map((item) => (
                <a key={item.href} href={item.href}
                  className="shrink-0 flex items-center gap-1.5 px-3 h-full text-xs text-text-dim hover:text-accent transition-colors border-b-2 border-transparent hover:border-accent">
                  <span>{item.icon}</span>
                  <span>{item.label}</span>
                </a>
              ))}
            </div>
          </div>
        )}
      </header>

      {/* Mobile menu overlay */}
      {menuOpen && (
        <div className="fixed inset-0 z-40 bg-black/60 md:hidden" onClick={() => setMenuOpen(false)} />
      )}
    </>
  );
}
