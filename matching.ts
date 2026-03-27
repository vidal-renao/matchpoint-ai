// ============================================================================
// MatchPoint AI — Dimensional Matching Engine (Server Action)
// src/lib/actions/matching.ts
//
// Compares a candidate against all available jobs using Claude AI.
// Scores 4 dimensions: Hard Skills, Experience, Culture, Logistics.
// Persists results in the `matches` table.
// ============================================================================

'use server';

import { createClient } from '@supabase/supabase-js';
import Anthropic from '@anthropic-ai/sdk';
import type { Candidate, Job, Match, MatchRecommendation } from '@/types/database';

// ---------------------------------------------------------------------------
// Clients
// ---------------------------------------------------------------------------

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error('Missing Supabase env vars');
  return createClient(url, key);
}

function getAnthropicClient() {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) throw new Error('Missing ANTHROPIC_API_KEY env var');
  return new Anthropic({ apiKey: key });
}

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface DimensionScore {
  score: number;       // 0–100
  reasoning: string;  // One-sentence explanation
}

export interface MatchAnalysis {
  overall_score: number;
  hard_skills: DimensionScore;
  experience: DimensionScore;
  culture: DimensionScore;
  logistics: DimensionScore;
  ai_verdict: string;        // 2-3 sentence narrative summary
  strengths: string[];       // Top 3 candidate strengths for this role
  gaps: string[];            // Top 3 gaps or concerns
  recommendation: MatchRecommendation;
}

export interface RunMatchingResult {
  success: boolean;
  matchesCreated?: number;
  error?: string;
}

export interface GetMatchesResult {
  success: boolean;
  matches?: MatchWithJob[];
  error?: string;
}

export interface MatchWithJob extends Match {
  job: Job;
}

// ---------------------------------------------------------------------------
// Prompt Builder
// ---------------------------------------------------------------------------

function buildMatchingPrompt(candidate: Candidate, job: Job): string {
  const candidateProfile = JSON.stringify(
    {
      full_name: candidate.full_name,
      skills: candidate.skills,
      years_of_experience: candidate.years_of_experience,
      seniority_level: candidate.seniority_level,
      location: candidate.location,
      structured_data: candidate.cv_structured,
    },
    null,
    2
  );

  const jobProfile = JSON.stringify(
    {
      title: job.title,
      company: job.company,
      location: job.location,
      remote_policy: job.remote_policy,
      required_skills: job.required_skills,
      experience_years_required: job.experience_years,
      salary_range: job.salary_min
        ? `${job.salary_min}–${job.salary_max} ${job.salary_currency ?? 'USD'}`
        : 'Not specified',
      description: job.description,
      company_culture: job.company_culture ?? 'Not specified',
    },
    null,
    2
  );

  return `You are an elite talent-matching AI for MatchPoint. Analyze the fit between this candidate and job.

## CANDIDATE
${candidateProfile}

## JOB
${jobProfile}

## YOUR TASK
Evaluate the match across 4 dimensions. Respond ONLY with valid JSON — no markdown, no backticks.

{
  "overall_score": <integer 0-100>,
  "hard_skills": {
    "score": <integer 0-100>,
    "reasoning": "<one sentence>"
  },
  "experience": {
    "score": <integer 0-100>,
    "reasoning": "<one sentence>"
  },
  "culture": {
    "score": <integer 0-100>,
    "reasoning": "<one sentence>"
  },
  "logistics": {
    "score": <integer 0-100>,
    "reasoning": "<one sentence>"
  },
  "ai_verdict": "<2-3 sentence narrative about overall fit>",
  "strengths": ["<strength 1>", "<strength 2>", "<strength 3>"],
  "gaps": ["<gap 1>", "<gap 2>", "<gap 3>"],
  "recommendation": "<one of: strong_match | good_match | partial_match | poor_match>"
}

Scoring guide:
- hard_skills: Overlap between candidate skills and required job skills.
- experience: Years and seniority alignment.
- culture: Inferred cultural fit based on company description and candidate background.
- logistics: Location, remote policy, salary alignment.
- overall_score: Weighted average (hard_skills 40%, experience 30%, culture 15%, logistics 15%).
- recommendation: strong_match ≥80, good_match ≥65, partial_match ≥45, poor_match <45.`;
}

// ---------------------------------------------------------------------------
// Core: Analyze a single candidate↔job pair
// ---------------------------------------------------------------------------

async function analyzeMatch(
  anthropic: Anthropic,
  candidate: Candidate,
  job: Job
): Promise<MatchAnalysis> {
  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 1024,
    messages: [
      {
        role: 'user',
        content: buildMatchingPrompt(candidate, job),
      },
    ],
  });

  const textBlock = response.content.find((b) => b.type === 'text');
  if (!textBlock || textBlock.type !== 'text') {
    throw new Error('No text response from Claude for match analysis');
  }

  const clean = textBlock.text
    .replace(/```json\s*/g, '')
    .replace(/```\s*/g, '')
    .trim();

  const analysis: MatchAnalysis = JSON.parse(clean);

  // Basic shape validation
  if (
    typeof analysis.overall_score !== 'number' ||
    !analysis.hard_skills ||
    !analysis.experience ||
    !analysis.culture ||
    !analysis.logistics ||
    !analysis.ai_verdict ||
    !Array.isArray(analysis.strengths) ||
    !Array.isArray(analysis.gaps) ||
    !analysis.recommendation
  ) {
    throw new Error('Invalid match analysis shape from Claude');
  }

  return analysis;
}

// ---------------------------------------------------------------------------
// Server Action: Run matching for a candidate
// ---------------------------------------------------------------------------

export async function runMatchingForCandidate(
  candidateId: string
): Promise<RunMatchingResult> {
  const supabase = getSupabase();
  const anthropic = getAnthropicClient();

  try {
    // 1. Fetch candidate
    const { data: candidate, error: candidateErr } = await supabase
      .from('candidates')
      .select('*')
      .eq('id', candidateId)
      .single();

    if (candidateErr || !candidate) {
      return { success: false, error: 'Candidate not found' };
    }

    // 2. Fetch available jobs (active, not already matched at strong level)
    const { data: jobs, error: jobsErr } = await supabase
      .from('jobs')
      .select('*')
      .eq('status', 'active')
      .limit(20); // Process top 20 jobs per run

    if (jobsErr || !jobs || jobs.length === 0) {
      return { success: false, error: 'No active jobs available for matching' };
    }

    // 3. Update candidate status to 'enriching'
    await supabase
      .from('candidates')
      .update({ processing_status: 'enriching' })
      .eq('id', candidateId);

    // 4. Analyze matches in sequence (rate-limit safe)
    let matchesCreated = 0;
    const errors: string[] = [];

    for (const job of jobs as Job[]) {
      try {
        const analysis = await analyzeMatch(anthropic, candidate as Candidate, job);

        // Upsert match record
        const { error: upsertErr } = await supabase
          .from('matches')
          .upsert(
            {
              candidate_id: candidateId,
              job_id: job.id,
              overall_score: analysis.overall_score,
              hard_skills_score: analysis.hard_skills.score,
              hard_skills_reasoning: analysis.hard_skills.reasoning,
              experience_score: analysis.experience.score,
              experience_reasoning: analysis.experience.reasoning,
              culture_score: analysis.culture.score,
              culture_reasoning: analysis.culture.reasoning,
              logistics_score: analysis.logistics.score,
              logistics_reasoning: analysis.logistics.reasoning,
              ai_verdict: analysis.ai_verdict,
              strengths: analysis.strengths,
              gaps: analysis.gaps,
              recommendation: analysis.recommendation,
              updated_at: new Date().toISOString(),
            },
            { onConflict: 'candidate_id,job_id' }
          );

        if (upsertErr) {
          errors.push(`Job ${job.id}: ${upsertErr.message}`);
        } else {
          matchesCreated++;
        }
      } catch (jobError) {
        errors.push(
          `Job ${job.id}: ${jobError instanceof Error ? jobError.message : 'Unknown error'}`
        );
      }
    }

    // 5. Update candidate status to 'ready'
    await supabase
      .from('candidates')
      .update({ processing_status: 'ready' })
      .eq('id', candidateId);

    if (errors.length > 0) {
      console.warn('Some matches failed:', errors);
    }

    return { success: true, matchesCreated };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown matching error';
    console.error('Matching engine error:', message);

    // Mark candidate as failed if we have a global error
    await supabase
      .from('candidates')
      .update({ processing_status: 'failed', failure_reason: message })
      .eq('id', candidateId)
      .catch(() => {}); // Best-effort

    return { success: false, error: message };
  }
}

// ---------------------------------------------------------------------------
// Trigger: Called automatically when candidate reaches 'review_needed'
// Call this after status transitions in your webhook or polling logic.
// ---------------------------------------------------------------------------

export async function triggerMatchingIfReady(
  candidateId: string,
  newStatus: string
): Promise<void> {
  if (newStatus !== 'review_needed') return;

  // Fire-and-forget: do not await — UI shouldn't block on this
  runMatchingForCandidate(candidateId).catch((err) => {
    console.error(`Auto-trigger matching failed for ${candidateId}:`, err);
  });
}

// ---------------------------------------------------------------------------
// Query: Get matches for a candidate (sorted by score desc)
// ---------------------------------------------------------------------------

export async function getMatchesForCandidate(
  candidateId: string
): Promise<GetMatchesResult> {
  const supabase = getSupabase();

  const { data, error } = await supabase
    .from('matches')
    .select(`
      *,
      job:jobs (*)
    `)
    .eq('candidate_id', candidateId)
    .order('overall_score', { ascending: false });

  if (error) {
    console.error('Failed to fetch matches:', error);
    return { success: false, error: error.message };
  }

  return {
    success: true,
    matches: (data ?? []) as MatchWithJob[],
  };
}
