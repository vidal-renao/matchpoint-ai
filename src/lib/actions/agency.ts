'use server';

// ============================================================================
// MatchPoint AI — Agency Workspace Actions (Multi-tenant)
// src/lib/actions/agency.ts
// ============================================================================

import { createClient } from '@supabase/supabase-js';
import { createClient as createServerClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import type { Job, RemotePolicy } from '@/types/database';

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

export interface Agency {
  id: string;
  name: string;
  slug: string;
  logo_url: string | null;
  website: string | null;
  description: string | null;
  plan: string;
  active_jobs_limit: number;
  owner_email: string;
  status: string;
  trial_ends_at: string | null;
  created_at: string;
}

export interface AgencyMember {
  id: string;
  agency_id: string;
  user_id: string;
  role: 'owner' | 'recruiter' | 'viewer';
  created_at: string;
}

export interface AgencyWithRole extends Agency {
  role: 'owner' | 'recruiter' | 'viewer';
}

export interface AgencyStats {
  activeJobs: number;
  totalCandidates: number;
  eliteCandidates: number;
  avgMatchScore: number;
}

export interface PostJobPayload {
  title: string;
  company: string;
  location: string;
  remote_policy: RemotePolicy;
  description: string;
  required_skills: string[];
  experience_years: number | null;
  salary_min: number | null;
  salary_max: number | null;
  salary_currency: string;
  sector: string;
}

// ---------------------------------------------------------------------------
// Get current user's agency
// ---------------------------------------------------------------------------

export async function getAgencyForUser(): Promise<AgencyWithRole | null> {
  try {
    const sessionClient = await createServerClient();
    const { data: { user } } = await sessionClient.auth.getUser();
    if (!user) return null;

    const supabase = getSupabase();
    const { data: member } = await supabase
      .from('agency_members')
      .select('role, agency_id')
      .eq('user_id', user.id)
      .single();

    if (!member) return null;

    const { data: agency } = await supabase
      .from('agencies')
      .select('*')
      .eq('id', member.agency_id)
      .single();

    if (!agency) return null;

    return { ...agency, role: member.role } as AgencyWithRole;
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// Create a new agency workspace
// ---------------------------------------------------------------------------

export interface CreateAgencyResult {
  success: boolean;
  agency?: Agency;
  error?: string;
}

export async function createAgency(formData: FormData): Promise<CreateAgencyResult> {
  try {
    const sessionClient = await createServerClient();
    const { data: { user } } = await sessionClient.auth.getUser();
    if (!user) return { success: false, error: 'Not authenticated.' };

    const name = (formData.get('name') as string)?.trim();
    if (!name || name.length < 2) return { success: false, error: 'Agency name is required.' };

    // Generate slug from name
    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
      .slice(0, 50);

    const supabase = getSupabase();

    // Check slug uniqueness
    const { data: existing } = await supabase
      .from('agencies')
      .select('id')
      .eq('slug', slug)
      .maybeSingle();

    const finalSlug = existing ? `${slug}-${Date.now().toString(36)}` : slug;

    const { data: agency, error: agencyError } = await supabase
      .from('agencies')
      .insert({
        name,
        slug: finalSlug,
        owner_email: user.email ?? '',
        website: (formData.get('website') as string)?.trim() || null,
        description: (formData.get('description') as string)?.trim() || null,
        plan: 'trial',
        active_jobs_limit: 5,
        trial_ends_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      })
      .select()
      .single();

    if (agencyError || !agency) {
      console.error('[createAgency]', agencyError);
      return { success: false, error: agencyError?.message ?? 'Failed to create agency.' };
    }

    // Add user as owner
    await supabase.from('agency_members').insert({
      agency_id: agency.id,
      user_id: user.id,
      role: 'owner',
    });

    return { success: true, agency: agency as Agency };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Unknown error' };
  }
}

// ---------------------------------------------------------------------------
// Post a job for the agency
// ---------------------------------------------------------------------------

export interface PostJobResult {
  success: boolean;
  jobId?: string;
  error?: string;
}

export async function postJobForAgency(
  agencyId: string,
  payload: PostJobPayload
): Promise<PostJobResult> {
  try {
    const sessionClient = await createServerClient();
    const { data: { user } } = await sessionClient.auth.getUser();
    if (!user) return { success: false, error: 'Not authenticated.' };

    const supabase = getSupabase();

    // Verify user is a member of this agency
    const { data: member } = await supabase
      .from('agency_members')
      .select('role')
      .eq('agency_id', agencyId)
      .eq('user_id', user.id)
      .single();

    if (!member) return { success: false, error: 'Not a member of this agency.' };

    // Sector key as first element of required_skills
    const skills = payload.required_skills.filter(Boolean);
    const requiredSkills = [payload.sector, ...skills.filter((s) => s !== payload.sector)];

    const { data: job, error } = await supabase
      .from('jobs')
      .insert({
        title: payload.title,
        company: payload.company,
        location: payload.location,
        remote_policy: payload.remote_policy,
        description: payload.description,
        required_skills: requiredSkills,
        experience_years: payload.experience_years,
        salary_min: payload.salary_min,
        salary_max: payload.salary_max,
        salary_currency: payload.salary_currency || 'EUR',
        employer_email: user.email,
        agency_id: agencyId,
        source: 'agency',
        status: 'active',
      })
      .select('id')
      .single();

    if (error || !job) {
      console.error('[postJobForAgency]', error);
      return { success: false, error: error?.message ?? 'Failed to post job.' };
    }

    return { success: true, jobId: job.id };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Unknown error' };
  }
}

// ---------------------------------------------------------------------------
// Get agency's jobs
// ---------------------------------------------------------------------------

export async function getAgencyJobs(agencyId: string): Promise<Job[]> {
  try {
    const supabase = getSupabase();
    const { data } = await supabase
      .from('jobs')
      .select('*')
      .eq('agency_id', agencyId)
      .is('deleted_at', null)
      .order('created_at', { ascending: false });

    return (data ?? []) as Job[];
  } catch {
    return [];
  }
}

// ---------------------------------------------------------------------------
// Get agency candidate matches (≥ minScore)
// ---------------------------------------------------------------------------

export interface AgencyCandidate {
  matchId: string;
  overallScore: number;
  hardSkillsScore: number;
  experienceScore: number;
  cultureScore: number;
  logisticsScore: number;
  aiVerdict: string;
  candidateId: string;
  candidateName: string;
  candidateEmail: string | null;
  candidatePhone: string | null;
  candidateLocation: string | null;
  candidateSkills: string[];
  candidateTags: string[];
  jobId: string;
  jobTitle: string;
  applicationId: string | null;
  applicationStage: string | null;
}

export interface GetAgencyCandidatesResult {
  success: boolean;
  candidates?: AgencyCandidate[];
  error?: string;
}

export async function getAgencyCandidates(
  agencyId: string,
  opts: { jobId?: string; minScore?: number } = {}
): Promise<GetAgencyCandidatesResult> {
  const { jobId, minScore = 75 } = opts;

  try {
    const supabase = getSupabase();

    // Get agency's job IDs
    let jobQuery = supabase.from('jobs').select('id').eq('agency_id', agencyId).is('deleted_at', null);
    if (jobId) jobQuery = jobQuery.eq('id', jobId);
    const { data: agencyJobs } = await jobQuery;
    const jobIds = (agencyJobs ?? []).map((j: { id: string }) => j.id);
    if (jobIds.length === 0) return { success: true, candidates: [] };

    // Get matches for those jobs
    const { data: matchRows, error } = await supabase
      .from('matches')
      .select(`
        id, overall_score, hard_skills_score, experience_score,
        culture_score, logistics_score, ai_verdict, job_id,
        candidate:candidates(id, full_name, email, phone, location, skills, tags)
      `)
      .in('job_id', jobIds)
      .gte('overall_score', minScore)
      .order('overall_score', { ascending: false })
      .limit(200);

    if (error) return { success: false, error: error.message };

    // Get jobs for labels
    const { data: jobRows } = await supabase
      .from('jobs')
      .select('id, title')
      .in('id', jobIds);
    const jobMap = new Map((jobRows ?? []).map((j: { id: string; title: string }) => [j.id, j.title]));

    // Get applications
    const candidateIds = (matchRows ?? [])
      .map((r) => (r.candidate as unknown as { id: string } | null)?.id)
      .filter(Boolean) as string[];

    const { data: appRows } = await supabase
      .from('applications')
      .select('id, candidate_id, job_id, stage')
      .in('candidate_id', candidateIds)
      .in('job_id', jobIds);

    const appMap = new Map(
      (appRows ?? []).map((a) => [`${a.candidate_id}::${a.job_id}`, a])
    );

    const candidates: AgencyCandidate[] = (matchRows ?? [])
      .filter((r) => r.candidate)
      .map((r) => {
        const c = r.candidate as unknown as {
          id: string; full_name: string; email: string | null;
          phone: string | null; location: string | null;
          skills: string[]; tags: string[];
        };
        const app = appMap.get(`${c.id}::${r.job_id}`);
        return {
          matchId: r.id,
          overallScore: r.overall_score,
          hardSkillsScore: r.hard_skills_score,
          experienceScore: r.experience_score,
          cultureScore: r.culture_score,
          logisticsScore: r.logistics_score,
          aiVerdict: r.ai_verdict,
          candidateId: c.id,
          candidateName: c.full_name,
          candidateEmail: c.email,
          candidatePhone: c.phone,
          candidateLocation: c.location,
          candidateSkills: c.skills ?? [],
          candidateTags: c.tags ?? [],
          jobId: r.job_id,
          jobTitle: jobMap.get(r.job_id) ?? 'Unknown position',
          applicationId: app?.id ?? null,
          applicationStage: app?.stage ?? null,
        };
      });

    return { success: true, candidates };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Unknown error' };
  }
}

// ---------------------------------------------------------------------------
// Get agency stats
// ---------------------------------------------------------------------------

export async function getAgencyStats(agencyId: string): Promise<AgencyStats> {
  try {
    const supabase = getSupabase();

    const { data: jobs } = await supabase
      .from('jobs')
      .select('id')
      .eq('agency_id', agencyId)
      .eq('status', 'active')
      .is('deleted_at', null);

    const jobIds = (jobs ?? []).map((j: { id: string }) => j.id);
    if (jobIds.length === 0) return { activeJobs: 0, totalCandidates: 0, eliteCandidates: 0, avgMatchScore: 0 };

    const { data: matches } = await supabase
      .from('matches')
      .select('overall_score')
      .in('job_id', jobIds);

    const scores = (matches ?? []).map((m) => m.overall_score as number);
    const elite = scores.filter((s) => s >= 90).length;
    const avg = scores.length ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;

    const uniqueCandidates = new Set(
      (matches ?? []).map((m) => m.overall_score) // placeholder — would need candidate_id in select
    ).size;

    return {
      activeJobs: jobIds.length,
      totalCandidates: scores.length,
      eliteCandidates: elite,
      avgMatchScore: avg,
    };
  } catch {
    return { activeJobs: 0, totalCandidates: 0, eliteCandidates: 0, avgMatchScore: 0 };
  }
}

// ---------------------------------------------------------------------------
// Require agency membership (use in server components)
// ---------------------------------------------------------------------------

export async function requireAgency(locale: string): Promise<AgencyWithRole> {
  const agency = await getAgencyForUser();
  if (!agency) {
    redirect(`/${locale}/agency/register`);
  }
  return agency;
}
