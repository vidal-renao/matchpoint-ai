# Changelog

All notable changes to MatchPoint AI are documented here.
Format follows [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

---

## [Unreleased] — Phase 3: Multi-Tenant Agency SaaS

### Added
- `sql/005_agencies.sql` — agency workspaces with RLS isolation
- `src/lib/actions/agency.ts` — createAgency, postJob, getAgencyCandidates
- `/[locale]/agency/` — self-serve agency portal (dashboard, post job, candidates, settings)
- Agency onboarding flow `/agency/register`

---

## [2.0.0] — 2026-03-27 — Phase 2: Job Board + Real Market Data

### Added
- Multi-sector job board with 10 sectors and real Swiss market jobs from Indeed
- `JobListRow` component — ictjobs.ch-style list view replacing card grid
- `JobsList` component — clean bordered list container
- Per-candidate AI match score badge on every job row (server-side, real-time)
- Sector tab bar (fixed at top of jobs page) — one-click sector filtering
- `sql/004_indeed_jobs.sql` — 50 real jobs: Microsoft, Apple, Anthropic, Roche, Deutsche Bank, Mandarin Oriental, ABB, Morgan Stanley, DHL, and more
- `apply_url` and `source` columns on `jobs` table (Indeed jobs link to original posting)
- `src/lib/constants/jobs.ts` — SECTORS moved out of 'use server' file (Vercel build fix)
- Recruiter Dashboard (`/admin`) with email whitelist guard (`ADMIN_EMAILS` env var)
- "Panel Jefe" button in Header (visible only for admin email)
- Agency portal foundation (database schema)

### Fixed
- Vercel build failure: `SECTORS` constant exported from `'use server'` file
- `JobApplyButton` dead-code state: `isLoggedIn` now tracked separately from `candidateId`
- `sql/002_applications.sql` PGRST204 error: `match_id` column not found

### Changed
- Landing page: sector navigation strip with live job counts, featured jobs as list
- Jobs listing page: list view, sector tabs, match score CTA for non-logged users
- Header: "Panel Jefe" link added for admin users

---

## [1.0.0] — 2026-03-20 — Phase 1: AI Matching Core

### Added
- CV upload (PDF + image) with two-phase Claude Sonnet 4.6 extraction
- 4-dimension AI matching engine: Hard Skills · Experience · Culture · Logistics
- Match scores with full reasoning, strengths, gaps, and verdict
- Applications pipeline — Kanban with stage tracking
- Email notifications via Resend at ≥90% match score
- WhatsApp recruiter alerts via Twilio at ≥90% match score
- `ready_for_hire` tag stamped on candidate at ≥90% (no extra migration)
- `notification_log` table with unique constraint (deduplication)
- Candidate profile editor with inline field editing
- AI profile enhancement from free text via Claude
- Print-to-PDF CV from MatchPoint profile
- Session-based profile and matches pages (no `?id=` required)
- Auth: Supabase cookie-based (login, signup, signout)
- Middleware: protected routes `/upload`, `/profile`, `/matches`, `/applications`, `/admin`
- i18n: Spanish (default), English, German
- SEO: `sitemap.ts`, `robots.ts`, JSON-LD JobPosting schema on job detail pages
- Employer B2B landing page with pricing tiers (€199/€599/Enterprise)
- `sql/001_initial_schema.sql` — candidates, jobs, matches tables + RLS
- `sql/002_applications.sql` — applications, notification_log tables
- `sql/003_seed_jobs.sql` — 30 seeded jobs across 10 sectors
