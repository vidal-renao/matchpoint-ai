import { SECTORS } from '@/lib/constants/jobs';

interface FooterProps {
  locale: string;
}

const SOCIAL_LINKS = [
  {
    label: 'LinkedIn',
    href: 'https://linkedin.com/company/matchpoint-ai',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
      </svg>
    ),
  },
  {
    label: 'Twitter / X',
    href: 'https://twitter.com/matchpointai',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    ),
  },
  {
    label: 'GitHub',
    href: 'https://github.com/vidal-renao/matchpoint-ai',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
      </svg>
    ),
  },
  {
    label: 'WhatsApp',
    href: 'https://wa.me/message/matchpointai',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
      </svg>
    ),
  },
];

export function Footer({ locale }: FooterProps) {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-border-subtle bg-base/80 mt-20">
      <div className="max-w-[1300px] mx-auto px-6 py-14">

        {/* Top row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">

          {/* Brand */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-2.5 mb-3">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-accent to-accent-hover flex items-center justify-center shrink-0">
                <svg width="14" height="14" viewBox="0 0 28 28" fill="none">
                  <path d="M14 2L26 8v12l-12 6L2 20V8l12-6z" stroke="#050505" strokeWidth="2" fill="none" />
                  <circle cx="14" cy="14" r="4" fill="#050505" opacity="0.8" />
                </svg>
              </div>
              <span className="font-display text-[15px] text-text">MatchPoint AI</span>
            </div>
            <p className="text-xs text-text-dim leading-relaxed mb-4">
              AI-powered talent matching for the modern job market. Connect candidates and companies through intelligent compatibility scoring.
            </p>
            {/* Social icons */}
            <div className="flex items-center gap-2">
              {SOCIAL_LINKS.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={s.label}
                  className="w-8 h-8 flex items-center justify-center rounded-lg border border-border-subtle text-text-dim hover:text-accent hover:border-accent/30 transition-colors"
                >
                  {s.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Candidates */}
          <div>
            <p className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-3">Candidates</p>
            <ul className="flex flex-col gap-2">
              {[
                { label: 'Upload CV', href: `/${locale}/upload` },
                { label: 'My Matches', href: `/${locale}/matches` },
                { label: 'Browse Jobs', href: `/${locale}/jobs` },
                { label: 'My Applications', href: `/${locale}/applications` },
                { label: 'My Profile', href: `/${locale}/profile` },
              ].map((l) => (
                <li key={l.href}>
                  <a href={l.href} className="text-sm text-text-dim hover:text-text-muted transition-colors">{l.label}</a>
                </li>
              ))}
            </ul>
          </div>

          {/* Sectors */}
          <div>
            <p className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-3">Job Sectors</p>
            <ul className="flex flex-col gap-2">
              {SECTORS.slice(0, 7).map((s) => (
                <li key={s.key}>
                  <a href={`/${locale}/jobs?sector=${s.key}`}
                    className="text-sm text-text-dim hover:text-text-muted transition-colors">
                    {s.icon} {s.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Company + Contact */}
          <div>
            <p className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-3">Company</p>
            <ul className="flex flex-col gap-2 mb-6">
              {[
                { label: 'Agency Portal', href: `/${locale}/agency` },
                { label: 'For Employers', href: `/${locale}/employer` },
                { label: 'Pricing', href: `/${locale}/#pricing` },
                { label: 'Privacy Policy', href: `/${locale}/privacy` },
                { label: 'Terms of Service', href: `/${locale}/terms` },
              ].map((l) => (
                <li key={l.label}>
                  <a href={l.href} className="text-sm text-text-dim hover:text-text-muted transition-colors">{l.label}</a>
                </li>
              ))}
            </ul>

            {/* Contact */}
            <p className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-3">Contact</p>
            <ul className="flex flex-col gap-2">
              <li>
                <a href="mailto:hello@matchpoint.ai" className="text-sm text-text-dim hover:text-accent transition-colors flex items-center gap-1.5">
                  ✉ hello@matchpoint.ai
                </a>
              </li>
              <li>
                <a href="https://wa.me/message/matchpointai" target="_blank" rel="noopener noreferrer"
                  className="text-sm text-text-dim hover:text-accent transition-colors flex items-center gap-1.5">
                  💬 WhatsApp support
                </a>
              </li>
              <li>
                <a href="https://linkedin.com/company/matchpoint-ai" target="_blank" rel="noopener noreferrer"
                  className="text-sm text-text-dim hover:text-accent transition-colors flex items-center gap-1.5">
                  💼 LinkedIn
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Location strip */}
        <div className="border-t border-border-subtle pt-6 flex flex-col sm:flex-row items-start sm:items-center gap-4 justify-between">
          <div className="flex items-center gap-2 text-xs text-text-dim">
            <span>📍</span>
            <span>Switzerland · Spain · Europe · Remote</span>
          </div>
          <div className="flex flex-wrap items-center gap-4 text-xs text-text-dim">
            <span>© {year} MatchPoint AI</span>
            <span>·</span>
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-success inline-block" />
              GDPR Compliant
            </span>
            <span>·</span>
            <span>Powered by Claude AI</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
