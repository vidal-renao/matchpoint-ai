# Server Actions Reference

All data mutations in MatchPoint AI use Next.js Server Actions (`'use server'`).
They run on the server, are type-safe, and require no API route boilerplate.

---

## Candidates

### `uploadAndExtractCv(formData: FormData)`
**File:** `src/lib/actions/candidates.ts`

Uploads a CV file to Supabase Storage and runs the two-phase Claude extraction pipeline.

```ts
const result = await uploadAndExtractCv(formData);
// result.success — boolean
// result.candidateId — string (UUID)
// result.candidate — Candidate object
// result.error — string | undefined
```

### `getCandidateByUserId(userId: string)`
Returns the most recent active candidate for a given auth user.

### `getCandidateById(id: string)`
Returns a candidate by ID (public — used for profile preview links).

---

## Matching

### `runMatchingForCandidate(candidateId: string)`
**File:** `src/lib/actions/matching.ts`

Scores the candidate against all active jobs. Fires email + WhatsApp for scores ≥90%.

```ts
const result = await runMatchingForCandidate(candidateId);
// result.success — boolean
// result.matchesCreated — number
// result.error — string | undefined
```

### `getMatchesForCandidate(candidateId: string)`
Returns all matches for a candidate, joined with job data, ordered by score descending.

---

## Jobs

### `listJobs(opts: ListJobsOptions)`
**File:** `src/lib/actions/jobs.ts`

```ts
interface ListJobsOptions {
  sector?: string;    // sector key e.g. 'technology'
  search?: string;    // free text search on title/company/description
  remote?: string;    // 'remote' | 'hybrid' | 'onsite' | 'flexible'
  limit?: number;     // default 20
  offset?: number;    // default 0
}

const { jobs, total } = await listJobs({ sector: 'finance', limit: 20 });
```

### `getFeaturedJobs(limit?: number)`
Returns the most recent active jobs (default: 8). Used on the landing page.

### `getJobById(id: string)`
Returns a single job by ID or `null` if not found / not active.

### `getJobCountBySector()`
Returns `Record<string, number>` — job count per sector key.

---

## Applications

### `applyToJob(candidateId, jobId, matchId?)`
**File:** `src/lib/actions/applications.ts`

Creates an application (idempotent — returns existing if already applied).

```ts
const result = await applyToJob(candidateId, jobId, matchId);
// result.success — boolean
// result.applicationId — string
```

### `getApplicationsForUser()`
Returns all applications for the currently authenticated user, joined with job data.

### `updateApplicationStage(applicationId, stage, notes?)`
Moves an application to a new pipeline stage.

```ts
type ApplicationStage =
  | 'applied' | 'shortlisted' | 'filter_passed'
  | 'interview_passed' | 'offer_sent' | 'hired' | 'rejected';
```

---

## Admin

### `getEliteCandidates(opts?)`
**File:** `src/lib/actions/admin.ts`

Returns matches ≥ minScore (default 90) with full candidate + job + application data.

```ts
const { entries } = await getEliteCandidates({ jobId: '...', minScore: 90 });
// entries[].match — Match object with all 4 scores
// entries[].candidate — Candidate with skills, phone, tags
// entries[].job — Job with title, company
// entries[].application — Application | null (current pipeline stage)
```

### `listJobsForAdmin()`
Returns `{ id, title, company }[]` for all active jobs — used in the filter dropdown.

---

## Profile

### `updateCandidateProfile(updates: ProfileUpdatePayload)`
**File:** `src/lib/actions/profile.ts`

Updates candidate fields: `full_name`, `email`, `phone`, `location`, `skills`, `years_of_experience`, `seniority_level`.

### `enhanceProfileWithAI(candidateId, freeText)`
Sends free text to Claude Sonnet 4.6 and extracts a structured `cv_structured` object (experience, education, languages, certifications, summary).

---

## Agency (Phase 3)

### `createAgency(data)`
**File:** `src/lib/actions/agency.ts`

Creates a new agency workspace and adds the current user as owner.

### `getAgencyForUser()`
Returns the agency workspace for the currently authenticated user.

### `postJobForAgency(agencyId, jobData)`
Creates a new job scoped to the agency.

### `getAgencyCandidates(agencyId, opts?)`
Returns all matches ≥ 70% for jobs belonging to the agency.
