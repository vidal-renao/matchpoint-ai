-- ============================================================================
-- MatchPoint AI — Migration 005: Multi-tenant Agency Workspaces
-- Run in Supabase SQL Editor AFTER 004_indeed_jobs.sql
-- ============================================================================

-- ── Agencies ──────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS agencies (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name              TEXT NOT NULL,
  slug              TEXT UNIQUE NOT NULL,
  logo_url          TEXT,
  website           TEXT,
  description       TEXT,
  plan              TEXT NOT NULL DEFAULT 'starter',   -- starter | growth | enterprise
  active_jobs_limit INTEGER NOT NULL DEFAULT 10,
  owner_email       TEXT NOT NULL,
  status            TEXT NOT NULL DEFAULT 'active',    -- active | suspended | trial
  trial_ends_at     TIMESTAMPTZ,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── Agency Members (user → agency relationship) ───────────────────────────────
CREATE TABLE IF NOT EXISTS agency_members (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agency_id   UUID NOT NULL REFERENCES agencies(id) ON DELETE CASCADE,
  user_id     UUID NOT NULL,                           -- Supabase auth.users.id
  role        TEXT NOT NULL DEFAULT 'recruiter',       -- owner | recruiter | viewer
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(agency_id, user_id)
);

-- ── Add agency_id to jobs ─────────────────────────────────────────────────────
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS agency_id UUID REFERENCES agencies(id);

-- ── Indexes ───────────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_agency_members_user_id  ON agency_members(user_id);
CREATE INDEX IF NOT EXISTS idx_agency_members_agency   ON agency_members(agency_id);
CREATE INDEX IF NOT EXISTS idx_jobs_agency_id          ON jobs(agency_id);

-- ── RLS ───────────────────────────────────────────────────────────────────────
ALTER TABLE agencies       ENABLE ROW LEVEL SECURITY;
ALTER TABLE agency_members ENABLE ROW LEVEL SECURITY;

-- Agencies: members can read their agency
CREATE POLICY "agency_members_can_read_agency" ON agencies
  FOR SELECT USING (
    id IN (
      SELECT agency_id FROM agency_members WHERE user_id = auth.uid()
    )
  );

-- Agencies: owners can update their agency
CREATE POLICY "agency_owners_can_update" ON agencies
  FOR UPDATE USING (
    id IN (
      SELECT agency_id FROM agency_members
      WHERE user_id = auth.uid() AND role = 'owner'
    )
  );

-- Agency members: members can read members of their agency
CREATE POLICY "agency_members_can_read_members" ON agency_members
  FOR SELECT USING (
    agency_id IN (
      SELECT agency_id FROM agency_members WHERE user_id = auth.uid()
    )
  );

-- Reload schema cache
NOTIFY pgrst, 'reload schema';
