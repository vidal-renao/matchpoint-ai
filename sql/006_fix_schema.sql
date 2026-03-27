-- ============================================================================
-- MatchPoint AI — Migration 006: Schema fixes & enhancements
-- Run in Supabase SQL Editor AFTER 005_agencies.sql
-- ============================================================================

-- ── Fix: Add match_id to applications if it doesn't exist ─────────────────────
ALTER TABLE applications ADD COLUMN IF NOT EXISTS match_id UUID REFERENCES matches(id) ON DELETE SET NULL;

-- ── Fix: Add salary_period to jobs ────────────────────────────────────────────
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS salary_period TEXT NOT NULL DEFAULT 'annual';
-- Values: hourly | daily | weekly | monthly | annual

-- ── Fix: Add agency_id index if not present (idempotent) ─────────────────────
CREATE INDEX IF NOT EXISTS idx_applications_match_id ON applications(match_id);

-- ── Reload PostgREST schema cache ─────────────────────────────────────────────
NOTIFY pgrst, 'reload schema';
