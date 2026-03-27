-- ============================================================================
-- MatchPoint AI — Phase 4: Applications Pipeline
-- 002_applications.sql
-- Run AFTER 001_initial_schema.sql
-- ============================================================================

create type application_stage as enum (
  'applied',
  'shortlisted',
  'filter_passed',
  'interview_passed',
  'offer_sent',
  'hired',
  'rejected'
);

create table applications (
  id                uuid primary key default uuid_generate_v4(),
  candidate_id      uuid not null references candidates(id) on delete cascade,
  job_id            uuid not null references jobs(id) on delete cascade,
  match_id          uuid references matches(id) on delete set null,
  stage             application_stage not null default 'applied',
  notes             text,
  stage_updated_at  timestamptz not null default now(),
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now(),
  unique (candidate_id, job_id)
);

create index idx_applications_candidate_id on applications (candidate_id);
create index idx_applications_job_id       on applications (job_id);
create index idx_applications_stage        on applications (stage);

create trigger trg_applications_updated_at
  before update on applications
  for each row execute function update_updated_at();

alter table applications enable row level security;

create policy "applications_select_own"
  on applications for select
  using (
    exists (
      select 1 from candidates c
      where c.id = applications.candidate_id
        and (c.user_id = auth.uid() or c.user_id is null)
    )
  );

-- Writes are service-role only (server actions bypass RLS).

-- ============================================================================
-- Notification dedup log (prevents duplicate emails)
-- ============================================================================

create table notification_log (
  id           uuid primary key default uuid_generate_v4(),
  candidate_id uuid not null references candidates(id) on delete cascade,
  match_id     uuid not null references matches(id) on delete cascade,
  event_type   text not null default 'high_score_match',
  sent_at      timestamptz not null default now(),
  unique (candidate_id, match_id, event_type)
);

alter table notification_log enable row level security;
-- Service role only — no browser policies needed.

-- ============================================================================
-- Jobs: add employer_email for notifications
-- ============================================================================

alter table jobs add column if not exists employer_email text;
