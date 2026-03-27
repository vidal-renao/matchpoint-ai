# Contributing to MatchPoint AI

Thank you for your interest in contributing. This document explains how to set up the project and submit changes.

---

## Development Setup

```bash
git clone https://github.com/vidal-renao/matchpoint-ai.git
cd matchpoint-ai
npm install
cp .env.example .env.local
# fill in .env.local with your keys
npm run dev
```

See [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) for full environment setup.

---

## Branch Naming

```
feature/your-feature-name
fix/bug-description
docs/what-you-documented
```

---

## Commit Style

Use conventional commits:

```
feat: add agency job posting portal
fix: resolve PGRST204 on applications table
docs: update API reference for matching actions
refactor: extract SECTORS constant to plain module
```

---

## Before Opening a PR

Both of these must pass with **zero errors**:

```bash
npx tsc --noEmit    # TypeScript strict check
npm run build       # Full Next.js production build
```

---

## Key Rules

1. **No `export const` from `'use server'` files** — only `async function` exports. Types (`export type`) are fine.
2. **No secrets in client code** — anything accessed in `'use client'` components must use `NEXT_PUBLIC_` prefix.
3. **All DB queries in Server Actions** — never call Supabase directly from Client Components.
4. **Service role key server-only** — `SUPABASE_SERVICE_ROLE_KEY` must never reach the browser.
5. **TypeScript strict** — no `any`, no `@ts-ignore` unless absolutely necessary and commented.

---

## Issue Templates

- 🐛 **Bug report** — use the bug report template
- 💡 **Feature request** — use the feature request template
- 🔒 **Security vulnerability** — email directly, do not open a public issue

---

## Code Style

- Prettier config in `package.json` (run `npm run format` if configured)
- Tailwind classes: prefer semantic custom tokens (`text-accent`, `bg-surface`) over raw colors
- Server Actions file names: `src/lib/actions/*.ts`
- Component file names: PascalCase (`JobListRow.tsx`)
