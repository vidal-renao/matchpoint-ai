# MatchPoint AI — The Dimensional Matching Engine

> AI-powered talent matching that goes beyond keywords. MatchPoint analyzes candidates across four weighted dimensions to surface the roles where they will genuinely thrive.

---

## The Problem

Traditional recruiting is slow, biased, and shallow. Keyword-matching ATS systems miss the candidate who has the right experience but uses different terminology. Recruiters spend hours on CVs that could be evaluated in seconds. Culture fit and logistics—the reasons most hires fail—are ignored entirely.

## The Solution

MatchPoint AI uses **Claude Sonnet 4.6** to perform a multi-dimensional evaluation of every candidate against every active role. Not a similarity score. Not a keyword count. A structured reasoning engine that weighs what actually predicts job success.

---

## The Luxury Stack

| Layer | Technology | Why |
|---|---|---|
| **Framework** | Next.js 16 (Turbopack) | App Router, Server Actions, zero-config bundling at full speed |
| **Styling** | Tailwind v4 — Luxury-Editorial Design | `@theme` CSS variables, glassmorphism, no config file |
| **Database** | Supabase — Postgres + pgvector + Storage | RLS policies, vector embeddings, CV file storage in one platform |
| **AI Engine** | Anthropic Claude Sonnet 4.6 | Multi-modal CV parsing (PDF + image) and dimensional job matching |
| **Animations** | Framer Motion v12 | `AnimatePresence`, staggered reveals, zero-jank polling via `startTransition` |
| **Language** | TypeScript 5 — strict mode | Single source of truth types in `src/types/database.ts` |

---

## Key Features

### Dimensional Matching Engine

The core insight: no single score captures fit. MatchPoint evaluates each candidate–role pair across four independent dimensions, each weighted by its empirical predictive value:

```
Overall Score = (Hard Skills × 40%) + (Experience × 30%) + (Culture × 15%) + (Logistics × 15%)
```

| Dimension | Weight | What it measures |
|---|---|---|
| **Hard Skills** | 40% | Overlap between candidate's skill set and required technologies |
| **Experience** | 30% | Seniority level, years, and relevance of past roles |
| **Culture** | 15% | Alignment between candidate's work style and company values |
| **Logistics** | 15% | Location, remote policy, and compensation expectations |

Each dimension produces a 0–100 score and a human-readable reasoning string. Claude outputs a final `ai_verdict`, an array of `strengths`, an array of `gaps`, and a `recommendation` label:

- `strong_match` — score ≥ 80
- `good_match` — score ≥ 65
- `partial_match` — score ≥ 45
- `poor_match` — score < 45

### CV Processing Pipeline

```
Upload → Storage (Supabase) → Claude multi-modal extraction → review_needed
    → Dimensional matching (20 jobs × Claude) → ready
```

Status transitions are real-time via a `startTransition` polling loop (2.5s interval, zero UI jank). The matching pipeline is fire-and-forget — the candidate sees their profile instantly while matching runs in the background.

### Schema Guard

Every Claude API call is wrapped in a retry-once pattern. If the response fails JSON parsing or shape validation, the prompt is resubmitted automatically. This prevents transient model errors from failing the pipeline.

### UI/UX — Luxury-Editorial Design System

The interface is built around a dark Luxury-Editorial palette:

- **Background**: `#050505` — near-black base
- **Accent**: `#f59e0b` — amber, used for interactive elements and glow effects
- **Typography**: Instrument Serif (display) + DM Sans (body) + Geist Mono (numbers)
- **Glassmorphism**: `.glass` utility — `backdrop-filter: blur(24px)` with `color-mix` opacity
- **Ambient glow**: Fixed radial gradient emanating from the accent color

All state transitions are animated with Framer Motion — `AnimatePresence mode="wait"` for phase changes, staggered `motion.div` arrays for card reveals, SVG arc animations for match scores.

---

## Architecture

### Security via Server Actions

API keys never leave the server. All Claude and Supabase Service Role calls happen inside `'use server'` functions in `src/lib/actions/`. The client receives only serialized results — no credentials, no raw API responses.

```
Browser → Server Action (candidates.ts / matching.ts)
              ↓
         Supabase Service Role  +  Anthropic API
              ↓
         Serialized result → Client component
```

### Project Structure

```
matchpoint-ai/
├── sql/
│   └── 001_initial_schema.sql      # Postgres schema with RLS, pgvector, indexes
├── src/
│   ├── types/
│   │   └── database.ts             # Single source of truth for all TypeScript types
│   ├── lib/
│   │   ├── actions/
│   │   │   ├── candidates.ts       # CV upload, Claude extraction, status management
│   │   │   └── matching.ts         # Dimensional matching engine, fire-and-forget trigger
│   │   ├── i18n/
│   │   │   └── index.ts            # Lightweight i18n hook (ES / EN / DE)
│   │   └── utils.ts                # cn() — clsx + tailwind-merge
│   ├── components/candidates/
│   │   ├── CvUploadForm.tsx        # Drag-and-drop upload with phase transitions
│   │   ├── AnalysisStatusWrapper.tsx # Animated processing steps
│   │   ├── ProfileClient.tsx       # Real-time status polling
│   │   ├── MatchCard.tsx           # SVG arc score + dimension bars
│   │   └── MatchesClient.tsx       # Filter tabs + staggered card grid
│   ├── app/
│   │   ├── globals.css             # Tailwind v4 @theme design tokens
│   │   └── [locale]/               # i18n routing (es / en / de)
│   └── messages/                   # ES / EN / DE translation files
```

---

## Installation & Setup

### 1. Clone and install

```bash
git clone https://github.com/vidal-renao/matchpoint-ai.git
cd matchpoint-ai
npm install
```

### 2. Configure environment variables

Create `.env.local` at the project root:

```bash
# Supabase — Settings → API in your project dashboard
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...

# Anthropic — console.anthropic.com → API Keys
ANTHROPIC_API_KEY=sk-ant-api03-...
```

### 3. Run the database schema

Execute `sql/001_initial_schema.sql` in your Supabase SQL editor. This creates:

- `candidates`, `jobs`, `matches` tables with full RLS policies
- `pgvector` extension and IVFFlat indexes for semantic search
- GIN indexes on `skills[]` and `required_skills[]` arrays
- Auto-update trigger for `updated_at` on all tables

### 4. Create the storage bucket

In Supabase Dashboard → Storage → New bucket:

- **Name**: `matchpoint-cvs`
- **Public**: No (private)

### 5. Start the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) — the app redirects to `/es` by default.

---

## i18n

The app ships with full translations in Spanish, English, and German. The locale is resolved from the URL (`/es`, `/en`, `/de`). Switch by navigating to the locale prefix directly.

---

## License

MIT
