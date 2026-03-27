'use server';

// ============================================================================
// MatchPoint AI — Applications Pipeline Actions
// src/lib/actions/applications.ts
// ============================================================================

import { createClient } from '@supabase/supabase-js';
import { createClient as createServerClient } from '@/lib/supabase/server';
import type { ApplicationStage, ApplicationWithJob } from '@/types/database';

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error('Missing Supabase env vars');
  return createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

// ---------------------------------------------------------------------------
// Apply to a job (idempotent — skips if already applied)
// ---------------------------------------------------------------------------

export interface ApplyResult {
  success: boolean;
  applicationId?: string;
  error?: string;
}

export async function applyToJob(
  candidateId: string,
  jobId: string,
  matchId?: string
): Promise<ApplyResult> {
  try {
    const supabase = getSupabase();

    // Check for existing application
    const { data: existing } = await supabase
      .from('applications')
      .select('id')
      .eq('candidate_id', candidateId)
      .eq('job_id', jobId)
      .single();

    if (existing) return { success: true, applicationId: existing.id };

    const { data, error } = await supabase
      .from('applications')
      .insert({
        candidate_id: candidateId,
        job_id: jobId,
        match_id: matchId ?? null,
        stage: 'applied' as ApplicationStage,
      })
      .select('id')
      .single();

    if (error || !data) {
      console.error('[applyToJob]', error);
      return { success: false, error: error?.message ?? 'Failed to create application.' };
    }

    return { success: true, applicationId: data.id };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return { success: false, error: message };
  }
}

// ---------------------------------------------------------------------------
// Get all applications for the currently authenticated user
// ---------------------------------------------------------------------------

export interface GetApplicationsResult {
  success: boolean;
  applications?: ApplicationWithJob[];
  error?: string;
}

export async function getApplicationsForUser(): Promise<GetApplicationsResult> {
  try {
    // Resolve user from session
    const serverClient = await createServerClient();
    const { data: { user } } = await serverClient.auth.getUser();
    if (!user) return { success: false, error: 'Not authenticated.' };

    const supabase = getSupabase();

    // Get candidate by user_id
    const { data: candidate } = await supabase
      .from('candidates')
      .select('id')
      .eq('user_id', user.id)
      .is('deleted_at', null)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (!candidate) return { success: true, applications: [] };

    const { data, error } = await supabase
      .from('applications')
      .select(`
        *,
        job:jobs(*)
      `)
      .eq('candidate_id', candidate.id)
      .order('updated_at', { ascending: false });

    if (error) {
      console.error('[getApplicationsForUser]', error);
      return { success: false, error: error.message };
    }

    return { success: true, applications: (data ?? []) as ApplicationWithJob[] };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return { success: false, error: message };
  }
}

// ---------------------------------------------------------------------------
// Update application stage (employer action)
// ---------------------------------------------------------------------------

export interface UpdateStageResult {
  success: boolean;
  error?: string;
}

export async function updateApplicationStage(
  applicationId: string,
  stage: ApplicationStage,
  notes?: string
): Promise<UpdateStageResult> {
  try {
    const supabase = getSupabase();
    const { error } = await supabase
      .from('applications')
      .update({
        stage,
        notes: notes ?? null,
        stage_updated_at: new Date().toISOString(),
      })
      .eq('id', applicationId);

    if (error) {
      console.error('[updateApplicationStage]', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return { success: false, error: message };
  }
}
