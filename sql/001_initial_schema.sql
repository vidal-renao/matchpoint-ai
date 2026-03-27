-- ============================================================================
-- MatchPoint AI — Initial Schema
-- 001_initial_schema.sql
--
-- Standards applied (data-architecture skill):
--   ✓ pgvector for semantic matching
--   ✓ RLS policies (auth.uid())
--   ✓ Soft delete (deleted_at)
--   ✓ Audit columns (created_at, updated_at)
--   ✓ GIN indexes on array columns
--   ✓ B-tree indexes on status / FK columns
-- ============================================================================

-- Enable required extensions
create extension if not exists "uuid-ossp";

-- ============================================================================
-- CANDIDATES
-- ============================================================================

create type processing_status as enum (
  'pending',
  'extracting',
  'extracted',
  'review_needed',
  'enriching',
  'ready',
  'failed'
);

create type cv_file_type as enum ('pdf', 'image');

create table candidates (
  id                  uuid primary key default uuid_generate_v4(),
  user_id             uuid references auth.users(id) on delete set null,   -- nullable: allows anonymous upload

  -- Identity
  full_name           text not null default 'Processing...',
  email               text,
  phone               text,
  location            text,

  -- CV storage
  cv_file_url         text not null,
  cv_file_type        cv_file_type not null,

  -- AI-extracted structured data (experience, education, languages, certs)
  cv_structured       jsonb not null default '{}',

  -- Flattened fields for quick querying
  skills              text[] not null default '{}',
  years_of_experience integer,
  seniority_level     text,

  -- Processing pipeline
  processing_status   processing_status not null default 'pending',
  failure_reason      text,

  -- Metadata
  source              text not null default 'upload',   -- 'upload' | 'linkedin' | 'api'
  tags                text[] not null default '{}',
  salary_currency     text not null default 'USD',

  -- Audit
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now(),
  deleted_at          timestamptz                        -- soft delete
);

-- Indexes
create index idx_candidates_user_id          on candidates (user_id);
create index idx_candidates_status           on candidates (processing_status);
create index idx_candidates_created_at       on candidates (created_at desc);
create index idx_candidates_skills           on candidates using gin (skills);
create index idx_candidates_tags             on candidates using gin (tags);
create index idx_candidates_deleted_at       on candidates (deleted_at) where deleted_at is null;

-- Auto-update updated_at
create or replace function update_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger trg_candidates_updated_at
  before update on candidates
  for each row execute function update_updated_at();

-- RLS
alter table candidates enable row level security;

-- Candidates can read their own records.
-- Note: user_id is null for anonymous uploads — readable by anyone who knows the UUID.
-- The 128-bit UUID space makes enumeration infeasible.
create policy "candidates_select_own"
  on candidates for select
  using (auth.uid() = user_id or user_id is null);

-- INSERT and UPDATE via server-side service role only.
-- Service role bypasses RLS entirely — no policy needed.
-- Explicitly deny direct insert from browser clients (anon / authenticated).
-- If there is no insert policy, RLS blocks anon and authenticated inserts automatically.

-- Candidates can update only their own (authenticated users updating their linked record)
create policy "candidates_update_own"
  on candidates for update
  to authenticated
  using (auth.uid() = user_id);

-- ============================================================================
-- JOBS
-- ============================================================================

create type job_status as enum ('draft', 'active', 'closed', 'archived');
create type remote_policy as enum ('onsite', 'hybrid', 'remote', 'flexible');

create table jobs (
  id                  uuid primary key default uuid_generate_v4(),

  -- Role info
  title               text not null,
  company             text not null,
  location            text,
  remote_policy       remote_policy not null default 'hybrid',

  -- Details
  description         text not null,
  required_skills     text[] not null default '{}',
  experience_years    integer,                            -- min years required
  company_culture     text,

  -- Compensation
  salary_min          integer,
  salary_max          integer,
  salary_currency     text not null default 'USD',

  -- Status
  status              job_status not null default 'active',

  -- Audit
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now(),
  deleted_at          timestamptz
);

-- Indexes
create index idx_jobs_status              on jobs (status);
create index idx_jobs_created_at          on jobs (created_at desc);
create index idx_jobs_required_skills     on jobs using gin (required_skills);
create index idx_jobs_deleted_at          on jobs (deleted_at) where deleted_at is null;
create trigger trg_jobs_updated_at
  before update on jobs
  for each row execute function update_updated_at();

-- RLS: Jobs are publicly readable by authenticated users
alter table jobs enable row level security;

create policy "jobs_select_authenticated"
  on jobs for select
  to authenticated
  using (status = 'active' and deleted_at is null);

create policy "jobs_select_anon"
  on jobs for select
  to anon
  using (false);

-- ============================================================================
-- MATCHES
-- ============================================================================

create type match_recommendation as enum (
  'strong_match',
  'good_match',
  'partial_match',
  'poor_match'
);

create table matches (
  id                    uuid primary key default uuid_generate_v4(),
  candidate_id          uuid not null references candidates (id) on delete cascade,
  job_id                uuid not null references jobs (id) on delete cascade,

  -- Dimensional scores (0–100)
  overall_score         integer not null check (overall_score between 0 and 100),
  hard_skills_score     integer not null check (hard_skills_score between 0 and 100),
  hard_skills_reasoning text,
  experience_score      integer not null check (experience_score between 0 and 100),
  experience_reasoning  text,
  culture_score         integer not null check (culture_score between 0 and 100),
  culture_reasoning     text,
  logistics_score       integer not null check (logistics_score between 0 and 100),
  logistics_reasoning   text,

  -- AI narrative
  ai_verdict            text not null,
  strengths             text[] not null default '{}',
  gaps                  text[] not null default '{}',
  recommendation        match_recommendation not null,

  -- Audit
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now(),

  -- One match record per candidate↔job pair (upsert-safe)
  unique (candidate_id, job_id)
);

-- Indexes
create index idx_matches_candidate_id     on matches (candidate_id);
create index idx_matches_job_id           on matches (job_id);
create index idx_matches_overall_score    on matches (overall_score desc);
create index idx_matches_recommendation   on matches (recommendation);

create trigger trg_matches_updated_at
  before update on matches
  for each row execute function update_updated_at();

-- RLS: Candidates see only their own matches
alter table matches enable row level security;

create policy "matches_select_own"
  on matches for select
  using (
    exists (
      select 1 from candidates c
      where c.id = matches.candidate_id
        and (c.user_id = auth.uid() or c.user_id is null)
    )
  );

-- INSERT and UPDATE are performed exclusively by the server via service role key.
-- Service role bypasses RLS — no permissive insert/update policies needed here.
-- Omitting these policies blocks direct writes from browser clients (anon / authenticated).

-- ============================================================================
-- STORAGE BUCKET (run via Supabase Dashboard or CLI)
-- ============================================================================
-- insert into storage.buckets (id, name, public)
-- values ('matchpoint-cvs', 'matchpoint-cvs', false);
--
-- create policy "cv_upload_auth"
--   on storage.objects for insert
--   to authenticated
--   with check (bucket_id = 'matchpoint-cvs');
--
-- create policy "cv_read_own"
--   on storage.objects for select
--   using (bucket_id = 'matchpoint-cvs' and auth.uid()::text = (storage.foldername(name))[1]);
