'use client';

import { useEffect, useState, useRef } from 'react';
import { createClient } from '@/lib/supabase/browser';
import { signOut } from '@/lib/actions/auth';
import { useTranslations } from '@/lib/i18n';
import type { User } from '@supabase/supabase-js';
import type { Locale } from '@/lib/i18n';

interface HeaderProps {
  locale: string;
  section?: 'agency' | 'candidate' | 'admin';
}

const LOCALES = [
  { code: 'es', label: 'Español', flag: '🇪🇸' },
  { code: 'en', label: 'English', flag: '🇬🇧' },
  { code: 'de', label: 'Deutsch', flag: '🇩🇪' },
  { code: 'it', label: 'Italiano', flag: '🇮🇹' },
];

function useClickOutside(ref: React.RefObject<HTMLElement | null>, onClose: () => void) {
  useEffect(() => {
    function handle(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    }
    document.addEventListener('mousedown', handle);
    return () => document.removeEventListener('mousedown', handle);
  }, [ref, onClose]);
}

export function Header({ locale, section }: HeaderProps) {
  const [user, setUser]           = useState<User | null>(null);
  const [mounted, setMounted]     = useState(false);
  const [isAgency, setIsAgency]   = useState(false);
  const [userOpen, setUserOpen]   = useState(false);
  const [langOpen, setLangOpen]   = useState(false);

  const userRef = useRef<HTMLDivElement>(null);
  const langRef = useRef<HTMLDivElement>(null);

  useClickOutside(userRef, () => setUserOpen(false));
  useClickOutside(langRef, () => setLangOpen(false));

  useEffect(() => {
    setMounted(true);
    const supabase = createClient();

    supabase.auth.getUser().then(async ({ data }) => {
      const u = data.user;
      setUser(u);
      if (u) {
        // Check agency membership
        const { data: member } = await supabase
          .from('agency_members')
          .select('id')
          .eq('user_id', u.id)
          .limit(1)
          .maybeSingle();
        setIsAgency(!!member);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user ?? null);
      if (!session?.user) setIsAgency(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const initial = user?.email?.[0].toUpperCase() ?? '?';

  const adminEmails = (process.env.NEXT_PUBLIC_ADMIN_EMAILS ?? '')
    .split(',').map((e) => e.trim().toLowerCase()).filter(Boolean);
  const isAdmin = !!user?.email && adminEmails.includes(user.email.toLowerCase());

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

  const t = useTranslations(locale as Locale);
  const navLinkCls = 'text-sm text-text-muted hover:text-text transition-colors px-3 py-1.5 rounded-lg hover:bg-surface-raised';
  const dropItemCls = 'flex items-center gap-2.5 px-3 py-2 text-sm text-text-muted hover:text-text hover:bg-surface-raised transition-colors rounded-lg mx-1';

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-border-subtle bg-base/90 backdrop-blur-xl">
        <div className="max-w-[1300px] mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">

          {/* Logo */}
          <a href={`/${locale}`} className="flex items-center gap-2.5 shrink-0 group">
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

          {/* Centre nav — desktop */}
          {mounted && (
            <nav className="hidden md:flex items-center gap-1">
              <a href={`/${locale}/jobs`} className={navLinkCls}>{t('nav.jobs')}</a>
              {user && (
                <>
                  <a href={`/${locale}/matches`} className={navLinkCls}>{t('nav.myMatches')}</a>
                  <a href={`/${locale}/applications`} className={navLinkCls}>{t('nav.applications')}</a>
                  {isAgency ? (
                    <a href={`/${locale}/agency`}
                      className="text-sm font-medium px-3 py-1.5 rounded-lg bg-accent/10 text-accent border border-accent/20 hover:bg-accent/20 transition-all">
                      🏢 {t('nav.agencyPortal')}
                    </a>
                  ) : (
                    <a href={`/${locale}/agency/register`}
                      className="text-sm text-text-dim hover:text-text-muted transition-colors px-3 py-1.5 rounded-lg hover:bg-surface-raised border border-dashed border-border-subtle">
                      {t('nav.forAgencies')}
                    </a>
                  )}
                </>
              )}
            </nav>
          )}

          {/* Right */}
          <div className="flex items-center gap-1.5">

            {/* Language switcher */}
            {mounted && (
              <div className="relative" ref={langRef}>
                <button
                  onClick={() => { setLangOpen((v) => !v); setUserOpen(false); }}
                  className="flex items-center gap-1 text-xs text-text-dim hover:text-text px-2 py-1.5 rounded-lg hover:bg-surface-raised transition-colors border border-transparent hover:border-border-subtle"
                >
                  <span>{LOCALES.find((l) => l.code === locale)?.flag ?? '🌐'}</span>
                  <span className="hidden sm:inline font-medium">{locale.toUpperCase()}</span>
                  <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.5" className="opacity-50" strokeLinecap="round">
                    <path d="M2 3.5l3 3 3-3" />
                  </svg>
                </button>
                {langOpen && (
                  <div className="absolute right-0 top-full mt-1 w-36 py-1 bg-surface border border-border rounded-xl shadow-2xl z-[60]">
                    {LOCALES.map((l) => (
                      <a key={l.code} href={switchLocalePath(l.code)}
                        onClick={() => setLangOpen(false)}
                        className={`flex items-center gap-2.5 px-3 py-2 text-sm hover:bg-surface-raised transition-colors rounded-lg mx-1 ${
                          l.code === locale ? 'text-accent font-medium' : 'text-text-muted'
                        }`}
                      >
                        <span>{l.flag}</span>
                        <span>{l.label}</span>
                        {l.code === locale && <span className="ml-auto text-accent text-xs">✓</span>}
                      </a>
                    ))}
                  </div>
                )}
              </div>
            )}

            {mounted && (
              <>
                {user ? (
                  <div className="flex items-center gap-1.5">
                    {isAdmin && (
                      <a href={`/${locale}/admin`}
                        className="hidden sm:flex text-xs font-semibold px-3 py-1.5 rounded-lg bg-accent/15 text-accent border border-accent/30 hover:bg-accent/25 transition-all">
                        ⚡ Panel Jefe
                      </a>
                    )}

                    {/* Avatar — click to open */}
                    <div className="relative" ref={userRef}>
                      <button
                        onClick={() => { setUserOpen((v) => !v); setLangOpen(false); }}
                        className="flex items-center gap-2 pl-3 border-l border-border-subtle ml-1"
                        aria-label="User menu"
                      >
                        <div className="w-8 h-8 rounded-full bg-accent/15 border border-accent/25 flex items-center justify-center">
                          <span className="text-xs font-semibold text-accent">{initial}</span>
                        </div>
                        <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-text-dim opacity-60 hidden sm:block" strokeLinecap="round">
                          <path d="M2 3.5l3 3 3-3" />
                        </svg>
                      </button>

                      {userOpen && (
                        <div className="absolute right-0 top-full mt-2 w-56 py-1.5 bg-surface border border-border rounded-xl shadow-2xl z-[60]">
                          {/* Email header */}
                          <div className="px-3 py-2 mb-1 border-b border-border-subtle">
                            <p className="text-[11px] text-text-dim truncate">{user.email}</p>
                            {isAgency && (
                              <span className="text-[10px] px-1.5 py-0.5 rounded bg-accent/10 text-accent border border-accent/20 inline-block mt-0.5">
                                {t('nav.agencyMember')}
                              </span>
                            )}
                          </div>

                          <a href={`/${locale}/profile`} className={dropItemCls} onClick={() => setUserOpen(false)}>
                            <span>👤</span> {t('nav.profile')}
                          </a>
                          <a href={`/${locale}/profile/settings`} className={dropItemCls} onClick={() => setUserOpen(false)}>
                            <span>⚙️</span> {t('nav.settings')}
                          </a>
                          <a href={`/${locale}/matches`} className={`${dropItemCls} md:hidden`} onClick={() => setUserOpen(false)}>
                            <span>✨</span> {t('nav.myMatches')}
                          </a>
                          <a href={`/${locale}/applications`} className={`${dropItemCls} md:hidden`} onClick={() => setUserOpen(false)}>
                            <span>📋</span> {t('nav.applications')}
                          </a>

                          <div className="border-t border-border-subtle my-1" />

                          {/* Agency section */}
                          {isAgency ? (
                            <a href={`/${locale}/agency`} className={dropItemCls} onClick={() => setUserOpen(false)}>
                              <span>🏢</span>
                              <span>{t('nav.agencyPortal')}</span>
                              <span className="ml-auto text-[10px] px-1.5 py-0.5 rounded bg-accent/10 text-accent">Pro</span>
                            </a>
                          ) : (
                            <a href={`/${locale}/agency/register`} className={`${dropItemCls} opacity-70`} onClick={() => setUserOpen(false)}>
                              <span>🏢</span>
                              <div className="flex flex-col">
                                <span>{t('nav.agencyPortal')}</span>
                                <span className="text-[10px] text-text-dim">{t('nav.agencyOnly')}</span>
                              </div>
                            </a>
                          )}

                          {isAdmin && (
                            <a href={`/${locale}/admin`} className="flex items-center gap-2.5 px-3 py-2 text-sm text-accent hover:bg-surface-raised transition-colors rounded-lg mx-1" onClick={() => setUserOpen(false)}>
                              <span>⚡</span> Panel Jefe
                            </a>
                          )}

                          <div className="border-t border-border-subtle mt-1 pt-1">
                            <form action={signOut.bind(null, locale)}>
                              <button type="submit" className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-text-dim hover:text-error hover:bg-surface-raised transition-colors rounded-lg mx-1 text-left">
                                <span>↩</span> {t('nav.signOut')}
                              </button>
                            </form>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <a href={`/${locale}/login`} className="text-sm text-text-muted hover:text-text transition-colors px-3 py-1.5">
                      {t('nav.signIn')}
                    </a>
                    <a href={`/${locale}/signup`}
                      className="text-sm font-medium px-4 py-1.5 rounded-lg bg-accent text-base-dark hover:bg-accent-hover transition-all">
                      {t('nav.getStarted')}
                    </a>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Agency sub-nav */}
        {section === 'agency' && (
          <div className="border-t border-border-subtle bg-base/95">
            <div className="max-w-[1300px] mx-auto px-6 flex items-center h-10 overflow-x-auto gap-1">
              {[
                { href: `/${locale}/agency`,          label: t('nav.dashboard'), icon: '📊' },
                { href: `/${locale}/agency/jobs/new`, label: t('nav.postJob'),   icon: '✚' },
                { href: `/${locale}/jobs`,            label: t('nav.jobBoard'),  icon: '🔍' },
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
    </>
  );
}
