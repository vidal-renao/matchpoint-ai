# MatchPoint AI — Architecture

## Overview

MatchPoint AI is built on the **Next.js 16 App Router** with a clear separation between server-rendered data fetching (Server Components), server-side mutations (Server Actions), and client-side interactivity (Client Components with `'use client'`).

All AI logic runs server-side. The browser never touches API keys.

---

## Data Flow

### 1. CV Upload & Extraction

```
User selects file (browser)
    → CvUploadForm (Client Component)
    → FormData POST via useTransition
    → uploadAndExtractCv() Server Action
        → Supabase Storage: upload file
        → Claude API: Phase 1 — basic extraction (name, email, skills)
        → Claude API: Phase 2 — deep extraction (experience[], education[], languages[])
        → Supabase: insert/update candidates row
        → Return candidate.id to client
    → Client redirects to /matches
```

### 2. Matching Engine

```
runMatchingForCandidate(candidateId) [Server Action]
    → Fetch candidate from Supabase (service role, bypasses RLS)
    → Fetch all active jobs
    → For each job (parallel):
        → Build prompt with candidate profile + job requirements
        → Claude API: score 4 dimensions (hard_skills, experience, culture, logistics)
        → Parse JSON response → overall_score = weighted mean
        → Upsert into matches table
        → If overall_score ≥ 90 AND not yet notified:
            → INSERT notification_log (unique constraint prevents duplication)
            → sendHighScoreMatchEmail() via Resend
            → sendAdminWhatsAppAlert() via Twilio
            → UPDATE candidates.tags[] += 'ready_for_hire'
```

### 3. Job Listing with Live Match Scores

```
/[locale]/jobs page (Server Component)
    → createServerClient() → getUser()
    → If user: fetch candidate.id from candidates table
    → If candidate: fetch all matches for candidate → build matchMap{jobId: score}
    → listJobs(filters) → paginated job rows
    → Render JobsList with matchMap prop
    → Each JobListRow receives matchScore prop → renders badge
```

---

## Database Schema

```sql
-- Core tables
candidates          -- CV data, extracted profile, tags
jobs               -- Job postings (internal + Indeed sourced)
matches            -- AI scores per candidate×job pair
applications       -- Candidate applications with pipeline stage
notification_log   -- Deduplication log for email/WhatsApp alerts

-- Phase 3 (multi-tenant)
agencies           -- Agency workspaces
agency_members     -- User → Agency membership with role
```

### Row Level Security

All tables have RLS enabled. Key policies:

| Table | Policy |
|---|---|
| `candidates` | Users can read/update their own rows (`user_id = auth.uid()`) |
| `jobs` | Public read for active jobs; service role for writes |
| `matches` | Users can read matches for their own candidate |
| `applications` | Users can read/create their own applications |
| `agencies` | Agency members can read their agency's data |

Service role key (used in Server Actions) bypasses RLS — never expose it to the browser.

---

## Module Boundaries

### `'use server'` files — Server Actions only
- Must only export `async function` — no plain values (constants, objects)
- Types (`export type`, `export interface`) are OK — stripped at compile time
- Plain constants like `SECTORS` must live in a separate plain module (`lib/constants/`)

### `'use client'` files
- Forms, interactive components, hooks
- Never import from `'use server'` files at runtime

### Plain modules (no directive)
- `lib/constants/jobs.ts` — safe to import from both server and client

---

## Key Design Decisions

### Why Server Actions instead of API Routes?
- Zero boilerplate — no `fetch('/api/...')`, no serialization
- Type-safe end-to-end — the action return type is the component's data type
- Streaming and revalidation support built-in

### Why service role key in Server Actions?
- Candidate data queries need to cross RLS boundaries (e.g., admin seeing all candidates)
- Service role is only used server-side, never sent to the browser
- Each sensitive action validates the caller's session before proceeding

### Why `notification_log` with unique constraint?
- Claude matching can run multiple times (e.g., after profile update)
- Without deduplication, a candidate would receive multiple emails/WhatsApps for the same match
- `UNIQUE(candidate_id, match_id, event_type)` makes notification idempotent

### Why store sector key as `required_skills[0]`?
- Avoids adding a `sector` column and migration
- PostgREST `.contains(['technology'])` checks if the array contains the value regardless of position
- Simple, works with existing array filtering

---

## Environment Variables Reference

| Variable | Required | Description |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | ✅ | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ✅ | Public anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | ✅ | Service role (server-only) |
| `ANTHROPIC_API_KEY` | ✅ | Claude API key |
| `NEXT_PUBLIC_APP_URL` | ✅ | Base URL for redirects |
| `RESEND_API_KEY` | Optional | Email notifications |
| `RESEND_FROM_EMAIL` | Optional | Sender address |
| `TWILIO_ACCOUNT_SID` | Optional | WhatsApp alerts |
| `TWILIO_AUTH_TOKEN` | Optional | WhatsApp alerts |
| `TWILIO_WHATSAPP_FROM` | Optional | `whatsapp:+14155238886` |
| `ADMIN_PHONE_NUMBER` | Optional | Recruiter's WhatsApp number |
| `ADMIN_EMAILS` | Optional | Comma-separated admin emails (server guard) |
| `NEXT_PUBLIC_ADMIN_EMAILS` | Optional | Same, for client Header button |
