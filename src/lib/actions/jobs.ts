'use server';

// ============================================================================
// MatchPoint AI — Jobs Actions
// src/lib/actions/jobs.ts
// Public-readable job listings with sector/search filtering
// ============================================================================

import { createClient } from '@supabase/supabase-js';
import type { Job } from '@/types/database';

export const SECTORS = [
  { key: 'technology',    label: 'Technology',       icon: '💻' },
  { key: 'finance',       label: 'Finance & Banking', icon: '💰' },
  { key: 'healthcare',    label: 'Healthcare',        icon: '🏥' },
  { key: 'marketing',     label: 'Marketing & Sales', icon: '📊' },
  { key: 'engineering',   label: 'Engineering',       icon: '⚙️' },
  { key: 'construction',  label: 'Construction',      icon: '🏗️' },
  { key: 'education',     label: 'Education',         icon: '📚' },
  { key: 'hospitality',   label: 'Hospitality',       icon: '🍽️' },
  { key: 'logistics',     label: 'Logistics',         icon: '🚚' },
  { key: 'legal',         label: 'Legal',             icon: '⚖️' },
] as const;

export type SectorKey = typeof SECTORS[number]['key'];

export interface JobWithSector extends Job {
  sector: string | null;
  applicant_count?: number;
}

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error('Missing Supabase env vars');
  return createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

export interface ListJobsOptions {
  sector?: string;
  search?: string;
  remote?: string;
  limit?: number;
  offset?: number;
}

export interface ListJobsResult {
  jobs: JobWithSector[];
  total: number;
}

export async function listJobs(opts: ListJobsOptions = {}): Promise<ListJobsResult> {
  const { sector, search, remote, limit = 24, offset = 0 } = opts;
  const supabase = getSupabase();

  let query = supabase
    .from('jobs')
    .select('*', { count: 'exact' })
    .eq('status', 'active')
    .is('deleted_at', null);

  if (sector) {
    // sector is stored as a tag in required_skills OR we use company_culture field to tag it
    // We'll filter by a sector tag added to required_skills array
    query = query.contains('required_skills', [sector]);
  }

  if (search) {
    query = query.or(
      `title.ilike.%${search}%,company.ilike.%${search}%,description.ilike.%${search}%`
    );
  }

  if (remote && remote !== 'all') {
    query = query.eq('remote_policy', remote);
  }

  const { data, error, count } = await query
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) {
    console.error('[listJobs]', error);
    return { jobs: [], total: 0 };
  }

  return {
    jobs: (data ?? []) as JobWithSector[],
    total: count ?? 0,
  };
}

export async function getFeaturedJobs(limit = 6): Promise<JobWithSector[]> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('jobs')
    .select('*')
    .eq('status', 'active')
    .is('deleted_at', null)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) { console.error('[getFeaturedJobs]', error); return []; }
  return (data ?? []) as JobWithSector[];
}

export async function getJobById(id: string): Promise<JobWithSector | null> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('jobs')
    .select('*')
    .eq('id', id)
    .eq('status', 'active')
    .single();

  if (error) { console.error('[getJobById]', error); return null; }
  return data as JobWithSector;
}

export async function getJobCountBySector(): Promise<Record<string, number>> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('jobs')
    .select('required_skills')
    .eq('status', 'active')
    .is('deleted_at', null);

  if (error || !data) return {};

  const counts: Record<string, number> = {};
  const sectorKeys = SECTORS.map((s) => s.key);

  for (const row of data) {
    for (const skill of (row.required_skills ?? []) as string[]) {
      if (sectorKeys.includes(skill as SectorKey)) {
        counts[skill] = (counts[skill] ?? 0) + 1;
      }
    }
  }

  return counts;
}
