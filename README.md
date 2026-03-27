<div align="center">

# MatchPoint AI

### The AI-Native Recruitment Platform

**Upload a CV. Get scored against every open role. Hire only the candidates who genuinely fit.**

[![Next.js](https://img.shields.io/badge/Next.js_16-black?logo=next.js)](https://nextjs.org)
[![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?logo=supabase&logoColor=white)](https://supabase.com)
[![Claude AI](https://img.shields.io/badge/Claude_Sonnet_4.6-D97706?logo=anthropic&logoColor=white)](https://anthropic.com)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white)](https://typescriptlang.org)
[![Vercel](https://img.shields.io/badge/Deployed_on_Vercel-black?logo=vercel)](https://vercel.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

[Live Demo](#) · [Documentation](docs/) · [Report a Bug](https://github.com/vidal-renao/matchpoint-ai/issues) · [Request a Feature](https://github.com/vidal-renao/matchpoint-ai/issues)

</div>

---

## What is MatchPoint AI?

MatchPoint AI is a **B2B SaaS recruitment platform** that replaces the traditional resume-screening bottleneck with a fully automated AI pipeline.

A candidate uploads their CV **once**. Claude Sonnet 4.6 extracts every skill, role, achievement, and nuance in seconds. The engine then scores that candidate against **every open position** across four real dimensions — not keyword matches. Recruiters receive only the candidates who cleared 90%+, pre-ranked, with a full score breakdown and WhatsApp alert.

No more reading 200 CVs manually. No more mismatches. No more ghost candidates.

```
Candidate uploads CV → Claude extracts profile → Engine scores all jobs →
Recruiter gets WhatsApp alert → "Ready to Sign" in one click
```

---

## Key Features

### For Candidates
- **CV upload** — PDF or image; Claude extracts full structured profile in ~8 seconds
- **AI match scores** — see your personal match % next to every job listing, live
- **4-dimension scoring** — Hard Skills · Experience · Culture Fit · Logistics (location, salary, remote)
- **Applications pipeline** — Kanban view of every application's status
- **Profile editor** — edit skills, experience, or let AI enhance your profile from free text
- **Print-to-PDF** — generate a clean CV from your MatchPoint profile in one click
- **Automatic notifications** — email when you hit ≥90% on any role

### For Recruiters / Agencies
- **Recruiter Dashboard** — see only elite candidates (≥90% match), zero noise
- **Job filter** — select any open position and see its ranked candidate list instantly
- **WhatsApp deep link** — contact a candidate directly from the dashboard with a pre-filled message
- **Ready to Sign** — update application stage to `offer_sent` in one click
- **AI verdict + score breakdown** — Hard Skills, Experience, Culture, Logistics bars per candidate
- **Multi-tenant workspaces** — each agency sees only their own jobs and candidates

### For Employers (B2B Portal)
- Self-serve job posting — no engineering needed
- Branded candidate portal — white-label ready
- Pricing tiers — Starter €149/mo · Growth €399/mo · Enterprise custom

### Platform
- **Multi-sector job board** — Technology, Finance, Healthcare, Engineering, Legal, Marketing, Construction, Education, Hospitality, Logistics
- **Real market jobs** — Indeed Switzerland integration (50+ live roles from Microsoft, Apple, Roche, Deutsche Bank, ABB, and more)
- **i18n** — Spanish · English · German
- **SEO-ready** — JSON-LD JobPosting schema, sitemap, robots.txt
- **Google Jobs eligible** — structured data on every job detail page

---

## Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | Next.js 16 App Router (Server Components + Server Actions) |
| **AI Engine** | Anthropic Claude Sonnet 4.6 |
| **Database** | Supabase (PostgreSQL + Row Level Security) |
| **Auth** | Supabase Auth (cookie-based via `@supabase/ssr`) |
| **Storage** | Supabase Storage (CV files) |
| **Email** | Resend SDK |
| **WhatsApp** | Twilio REST API |
| **Styling** | Tailwind CSS v4 (custom design tokens) |
| **Animations** | Framer Motion v12 |
| **Deployment** | Vercel (Edge + Serverless) |
| **Language** | TypeScript (strict) |

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Next.js 16                           │
│                                                             │
│  ┌─────────────┐  ┌──────────────┐  ┌──────────────────┐  │
│  │  Candidate  │  │  Job Board   │  │  Agency Portal   │  │
│  │  Portal     │  │  /jobs       │  │  /agency/*       │  │
│  │  /upload    │  │  /jobs/[id]  │  │  (multi-tenant)  │  │
│  │  /profile   │  │  /employer   │  │                  │  │
│  │  /matches   │  │              │  │                  │  │
│  │  /apps      │  │              │  │                  │  │
│  └──────┬──────┘  └──────┬───────┘  └────────┬─────────┘  │
│         │                │                   │             │
│         └────────────────┴───────────────────┘             │
│                          │                                  │
│              Server Actions ('use server')                  │
│    candidates · matching · jobs · applications · admin     │
└──────────────────────────┬──────────────────────────────────┘
                           │
        ┌──────────────────┼──────────────────┐
        │                  │                  │
   ┌────▼─────┐    ┌───────▼──────┐   ┌──────▼──────┐
   │ Supabase │    │   Anthropic  │   │   Twilio /  │
   │ Postgres │    │  Claude API  │   │   Resend    │
   │ + Auth   │    │  (matching + │   │  (alerts)   │
   │ + Storage│    │   extraction)│   │             │
   └──────────┘    └──────────────┘   └─────────────┘
```

### AI Matching Engine

```
CV File (PDF / image)
        │
        ▼
Claude Sonnet 4.6 — Phase 1: Basic Extraction
  → full_name, email, phone, top_skills, confidence_score
        │
        ▼
Claude Sonnet 4.6 — Phase 2: Deep Structured Extraction
  → experience[], education[], languages[], certifications[], summary
        │
        ▼
For each active job in the database:
  Claude Sonnet 4.6 — 4-Dimension Scoring
  ├── Hard Skills Score    (0–100) — tech match, required tools
  ├── Experience Score     (0–100) — years, seniority, industry
  ├── Culture Fit Score    (0–100) — values, work style, team size
  └── Logistics Score      (0–100) — location, salary, remote policy
         │
         ▼
  overall_score = weighted average of 4 dimensions
  recommendation: strong_match | good_match | partial_match | poor_match
         │
         ▼
  if overall_score ≥ 90:
    ├── Send branded email via Resend
    ├── Send WhatsApp alert to admin via Twilio
    ├── Stamp candidate.tags[] with 'ready_for_hire'
    └── Insert into notification_log (prevents duplicate alerts)
```

---

## Getting Started

### Prerequisites

- Node.js ≥ 18
- A [Supabase](https://supabase.com) project (free tier works)
- An [Anthropic](https://console.anthropic.com) API key
- (Optional) [Resend](https://resend.com) for email notifications
- (Optional) [Twilio](https://twilio.com) for WhatsApp alerts

### 1. Clone and install

```bash
git clone https://github.com/vidal-renao/matchpoint-ai.git
cd matchpoint-ai
npm install
```

### 2. Configure environment

```bash
cp .env.example .env.local
# then fill in your keys
```

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Anthropic Claude
ANTHROPIC_API_KEY=sk-ant-...

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_DEFAULT_LOCALE=es

# Email (optional — high-score match notifications)
RESEND_API_KEY=re_...
RESEND_FROM_EMAIL=noreply@yourdomain.com

# WhatsApp (optional — recruiter alerts via Twilio)
TWILIO_ACCOUNT_SID=AC...
TWILIO_AUTH_TOKEN=...
TWILIO_WHATSAPP_FROM=whatsapp:+14155238886
ADMIN_PHONE_NUMBER=+34600000000

# Admin portal guard (comma-separated emails)
ADMIN_EMAILS=admin@yourdomain.com
NEXT_PUBLIC_ADMIN_EMAILS=admin@yourdomain.com
```

### 3. Database setup

Run the SQL migration files **in order** in your Supabase SQL Editor:

```bash
sql/001_initial_schema.sql    # Core tables, RLS policies, storage bucket
sql/002_applications.sql      # Applications pipeline + notification_log
sql/004_indeed_jobs.sql       # Real Swiss market jobs + apply_url column
sql/005_agencies.sql          # Multi-tenant agency workspaces
```

### 4. Run locally

```bash
npm run dev
# → http://localhost:3000
```

---

## Project Structure

```
matchpoint-ai/
├── src/
│   ├── app/
│   │   ├── [locale]/
│   │   │   ├── page.tsx              # Landing — job board home
│   │   │   ├── (auth)/               # Login · Signup
│   │   │   ├── (candidate)/          # Upload · Profile · Matches · Applications
│   │   │   ├── jobs/                 # Job listing + [id] detail page
│   │   │   ├── employer/             # B2B landing with pricing
│   │   │   ├── agency/               # Agency portal (multi-tenant)
│   │   │   └── admin/                # Recruiter dashboard (email-gated)
│   │   ├── robots.ts
│   │   └── sitemap.ts
│   ├── components/
│   │   ├── layout/Header.tsx
│   │   ├── candidates/               # CvUploadForm, MatchCard, ProfileEditor...
│   │   ├── jobs/                     # JobListRow, JobsList, JobFilters...
│   │   ├── admin/                    # AdminDashboard
│   │   └── agency/                   # Agency portal components
│   ├── lib/
│   │   ├── actions/                  # All Server Actions ('use server')
│   │   │   ├── candidates.ts         # CV upload + extraction pipeline
│   │   │   ├── matching.ts           # Claude scoring engine
│   │   │   ├── jobs.ts               # Job listing queries
│   │   │   ├── applications.ts       # Pipeline actions
│   │   │   ├── admin.ts              # Elite candidate queries
│   │   │   ├── profile.ts            # Profile edit + AI enhance
│   │   │   └── agency.ts             # Multi-tenant agency actions
│   │   ├── constants/jobs.ts         # SECTORS (plain module, no 'use server')
│   │   ├── email/resend.ts           # Resend email service
│   │   ├── notifications/whatsapp.ts # Twilio WhatsApp service
│   │   └── supabase/                 # Browser + Server clients
│   └── types/database.ts             # Single source of truth for all types
├── sql/                              # Ordered migration files
├── docs/                             # Extended documentation
│   ├── ARCHITECTURE.md
│   ├── DEPLOYMENT.md
│   └── API.md
├── .env.example
├── CHANGELOG.md
└── CONTRIBUTING.md
```

---

## Roadmap

### ✅ Phase 1 — AI Matching Core
- [x] CV upload + Claude Sonnet 4.6 extraction (PDF + image)
- [x] 4-dimension AI scoring engine with reasoning
- [x] Match scores visible on every job listing (per-candidate, real-time)
- [x] Applications Kanban pipeline
- [x] Email notifications via Resend at ≥90% match
- [x] WhatsApp recruiter alerts via Twilio at ≥90% match
- [x] Recruiter dashboard — elite candidates only, no noise
- [x] "Ready to Sign" one-click workflow
- [x] Candidate profile editor + AI text enhancement
- [x] Print-to-PDF CV generation

### ✅ Phase 2 — Job Board
- [x] Multi-sector job board (10 sectors, 50+ real Swiss market jobs)
- [x] Per-candidate AI match score on job listing rows
- [x] Sector tab navigation (ictjobs.ch-style)
- [x] SEO: JSON-LD JobPosting, sitemap.ts, robots.ts
- [x] Google Jobs structured data on every detail page
- [x] i18n — Spanish · English · German
- [x] Employer B2B landing page with competitive pricing
- [x] Admin portal with email whitelist guard

### 🔄 Phase 3 — Multi-Tenant Agency SaaS
- [x] Agency database schema + RLS isolation
- [ ] Agency onboarding + workspace creation
- [ ] Self-serve job posting portal
- [ ] Agency dashboard with candidate pipeline view
- [ ] White-label candidate portal per agency

### 📋 Phase 4 — Scale & Integrations
- [ ] Indeed Publisher API — live job sync
- [ ] ATS webhooks (Greenhouse, Lever, Teamtailor)
- [ ] Stripe billing integration
- [ ] Video interview scheduling
- [ ] Mobile app (React Native)
- [ ] Analytics dashboard for agencies

---

## Competitive Positioning

| Platform | AI Matching | Candidate Score Visibility | WhatsApp Alerts | Price |
|---|---|---|---|---|
| **MatchPoint AI** | ✅ Claude Sonnet 4.6 | ✅ Live % on every listing | ✅ Auto at ≥90% | €149/mo |
| Manatal | Partial (keyword) | ❌ | ❌ | $35/user/mo |
| Recruitee | ❌ | ❌ | ❌ | €199/mo |
| Teamtailor | ❌ | ❌ | ❌ | €150/mo |
| Greenhouse | Partial | ❌ | ❌ | >€500/mo |
| Indeed | ❌ | ❌ | ❌ | Pay-per-click |

**Key differentiator:** MatchPoint is the only platform where candidates see their personal AI match score (0–100%) next to every job — creating a feedback loop that improves application quality and reduces recruiter workload by up to 70%.

---

## Legal & Compliance

- **GDPR compliant** — candidate data stored in Supabase (EU region), Row Level Security enabled on all tables, right-to-deletion supported via `deleted_at` soft deletes
- **Data processor model** — when sold to agencies, MatchPoint acts as data processor; the agency is the data controller. A standard DPA template is included in `docs/DPA_TEMPLATE.md`
- **Job data** — real jobs displayed with attribution and direct links to original source (Indeed). No full descriptions scraped without license.
- **No staffing license required** — MatchPoint is a software tool, not a staffing agency. Placement decisions are made by the agency client.

---

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md). All PRs must pass:

```bash
npx tsc --noEmit   # TypeScript — zero errors
npm run build      # Next.js build — must succeed
```

---

## License

MIT — see [LICENSE](LICENSE).

Claude API usage is subject to [Anthropic's usage policies](https://www.anthropic.com/policies/usage).

---

## Author

**Max Vidal** — Full-stack developer building AI-native products.

Built end-to-end with [Claude Code](https://claude.ai/code) — Anthropic's AI software engineering CLI.

---

<div align="center">

*MatchPoint AI — From CV upload to signed offer, fully automated.*

**⭐ Star this repo** if it was useful · **🐛 [Report issues](https://github.com/vidal-renao/matchpoint-ai/issues)**

</div>
