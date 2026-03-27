'use server';

// ============================================================================
// MatchPoint AI — Admin / Recruiter Dashboard Actions
// src/lib/actions/admin.ts
// ============================================================================

import { createClient } from '@supabase/supabase-js';
import type { ApplicationStage, Candidate, Job, Match, Application } from '@/types/database';

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error('Missing Supabase env vars');
  return createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface EliteEntry {
  match: Match;
  candidate: Candidate;
  job: Job;
  application: Application | null;
}

export interface GetEliteCandidatesResult {
  success: boolean;
  entries?: EliteEntry[];
  error?: string;
}

export interface ListJobsForAdminResult {
  success: boolean;
  jobs?: Pick<Job, 'id' | 'title' | 'company'>[];
  error?: string;
}

// ---------------------------------------------------------------------------
// getEliteCandidates — matches ≥ minScore, optionally filtered by jobId
// ---------------------------------------------------------------------------

export async function getEliteCandidates(opts: {
  jobId?: string;
  minScore?: number;
} = {}): Promise<GetEliteCandidatesResult> {
  const { jobId, minScore = 90 } = opts;

  try {
    const supabase = getSupabase();

    // 1. Fetch high-score matches with candidate and job data
    let query = supabase
      .from('matches')
      .select(`
        *,
        candidate:candidates(*),
        job:jobs(*)
      `)
      .gte('overall_score', minScore)
      .is('candidates.deleted_at', null)
      .order('overall_score', { ascending: false })
      .limit(100);

    if (jobId) {
      query = query.eq('job_id', jobId);
    }

    const { data: matchRows, error: matchError } = await query;

    if (matchError) {
      console.error('[getEliteCandidates] matches query', matchError);
      return { success: false, error: matchError.message };
    }

    if (!matchRows || matchRows.length === 0) {
      return { success: true, entries: [] };
    }

    // 2. Fetch corresponding applications (candidate_id × job_id pairs)
    const pairs = matchRows.map((r) => ({
      candidateId: (r.candidate as Candidate).id,
      jobId: (r.job as Job).id,
    }));

    // Fetch all applications for these candidate_ids (service role, no RLS)
    const candidateIds = [...new Set(pairs.map((p) => p.candidateId))];
    const { data: appRows } = await supabase
      .from('applications')
      .select('*')
      .in('candidate_id', candidateIds);

    const appMap = new Map<string, Application>();
    for (const app of appRows ?? []) {
      appMap.set(`${app.candidate_id}::${app.job_id}`, app as Application);
    }

    // 3. Merge
    const entries: EliteEntry[] = matchRows
      .filter((r) => r.candidate && r.job) // skip rows with deleted candidates
      .map((r) => {
        const candidate = r.candidate as Candidate;
        const job = r.job as Job;
        const { candidate: _c, job: _j, ...matchOnly } = r;
        return {
          match: matchOnly as Match,
          candidate,
          job,
          application: appMap.get(`${candidate.id}::${job.id}`) ?? null,
        };
      });

    return { success: true, entries };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return { success: false, error: message };
  }
}

// ---------------------------------------------------------------------------
// listJobsForAdmin — all active jobs for the filter dropdown
// ---------------------------------------------------------------------------

export async function listJobsForAdmin(): Promise<ListJobsForAdminResult> {
  try {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from('jobs')
      .select('id, title, company')
      .eq('status', 'active')
      .is('deleted_at', null)
      .order('title', { ascending: true });

    if (error) {
      console.error('[listJobsForAdmin]', error);
      return { success: false, error: error.message };
    }

    return { success: true, jobs: (data ?? []) as Pick<Job, 'id' | 'title' | 'company'>[] };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return { success: false, error: message };
  }
}
