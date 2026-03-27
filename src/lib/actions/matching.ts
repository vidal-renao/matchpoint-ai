// ============================================================================
// MatchPoint AI — Dimensional Matching Engine (Server Action)
// src/lib/actions/matching.ts
//
// Standards applied:
//   ✓ claude-sonnet-4-6 for complex multi-dimensional reasoning (ai-bridge)
//   ✓ Schema Guard: retry once on invalid JSON
//   ✓ Weighted scoring: Hard Skills 40%, Experience 30%, Culture 15%, Logistics 15%
//   ✓ Upsert-safe: one record per candidate↔job pair (data-architecture)
//   ✓ Fire-and-forget trigger: doesn't block the UI (ui-ux-pro-max)
// ============================================================================

'use server';

import { createClient } from '@supabase/supabase-js';
import Anthropic from '@anthropic-ai/sdk';
import { sendHighScoreMatchEmail } from '@/lib/email/resend';
import { sendAdminWhatsAppAlert } from '@/lib/notifications/whatsapp';
import type {
  Candidate,
  Job,
  MatchWithJob,
  MatchAnalysis,
  RunMatchingResult,
  GetMatchesResult,
} from '@/types/database';

// ---------------------------------------------------------------------------
// Clients
// ---------------------------------------------------------------------------

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error('Missing Supabase env vars');
  return createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

function getAnthropic() {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) throw new Error('Missing ANTHROPIC_API_KEY');
  return new Anthropic({ apiKey: key });
}

// ---------------------------------------------------------------------------
// Prompt (ai-bridge: minified schema, visual cues, token-efficient)
// ---------------------------------------------------------------------------

function buildPrompt(candidate: Candidate, job: Job): string {
  const c = JSON.stringify({
    skills: candidate.skills,
    years_of_experience: candidate.years_of_experience,
    seniority_level: candidate.seniority_level,
    location: candidate.location,
    experience: candidate.cv_structured?.experience?.slice(0, 3),
  });

  const j = JSON.stringify({
    title: job.title,
    company: job.company,
    location: job.location,
    remote_policy: job.remote_policy,
    required_skills: job.required_skills,
    experience_years: job.experience_years,
    salary: job.salary_min ? `${job.salary_min}-${job.salary_max} ${job.salary_currency}` : null,
    culture: job.company_culture,
    description: job.description.slice(0, 600),
  });

  return `Elite talent-matching analysis. Respond ONLY with minified JSON. No markdown.
CANDIDATE:${c}
JOB:${j}
Schema:{"overall_score":0,"hard_skills":{"score":0,"reasoning":""},"experience":{"score":0,"reasoning":""},"culture":{"score":0,"reasoning":""},"logistics":{"score":0,"reasoning":""},"ai_verdict":"","strengths":["","",""],"gaps":["","",""],"recommendation":""}
Weights: hard_skills=40%, experience=30%, culture=15%, logistics=15%.
recommendation: strong_match≥80, good_match≥65, partial_match≥45, poor_match<45.`;
}

// ---------------------------------------------------------------------------
// Schema Guard: parse + retry once
// ---------------------------------------------------------------------------

async function analyzeMatch(
  anthropic: Anthropic,
  candidate: Candidate,
  job: Job,
  attempt = 1
): Promise<MatchAnalysis> {
  const res = await anthropic.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 800,
    messages: [{ role: 'user', content: buildPrompt(candidate, job) }],
  });

  const block = res.content.find((b) => b.type === 'text');
  if (!block || block.type !== 'text') throw new Error('No text from Claude');

  let parsed: MatchAnalysis;
  try {
    parsed = JSON.parse(
      block.text.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim()
    );
  } catch {
    if (attempt < 2) return analyzeMatch(anthropic, candidate, job, 2);
    throw new Error('Invalid JSON from Claude after retry');
  }

  // Shape validation
  if (
    typeof parsed.overall_score !== 'number' ||
    !parsed.hard_skills || !parsed.experience ||
    !parsed.culture || !parsed.logistics ||
    !parsed.ai_verdict || !parsed.recommendation
  ) {
    if (attempt < 2) return analyzeMatch(anthropic, candidate, job, 2);
    throw new Error('Invalid match shape after retry');
  }

  return parsed;
}

// ---------------------------------------------------------------------------
// Server Action: Run matching for a candidate against all active jobs
// ---------------------------------------------------------------------------

export async function runMatchingForCandidate(
  candidateId: string
): Promise<RunMatchingResult> {
  const supabase = getSupabase();
  const anthropic = getAnthropic();

  try {
    // Fetch candidate
    const { data: candidate, error: cErr } = await supabase
      .from('candidates')
      .select('*')
      .eq('id', candidateId)
      .single();

    if (cErr || !candidate) return { success: false, error: 'Candidate not found' };

    // Fetch active jobs (top 20 by recency)
    const { data: jobs, error: jErr } = await supabase
      .from('jobs')
      .select('*')
      .eq('status', 'active')
      .is('deleted_at', null)
      .order('created_at', { ascending: false })
      .limit(20);

    if (jErr || !jobs?.length) return { success: false, error: 'No active jobs found' };

    // Mark candidate as enriching
    await supabase
      .from('candidates')
      .update({ processing_status: 'enriching' })
      .eq('id', candidateId);

    let matchesCreated = 0;

    // Process sequentially (rate-limit safe)
    for (const job of jobs as Job[]) {
      try {
        const analysis = await analyzeMatch(anthropic, candidate as Candidate, job);

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

        if (!upsertErr) {
          matchesCreated++;

          // Fire email notification when score ≥ 90 (deduped via notification_log)
          if (analysis.overall_score >= 90 && (candidate as Candidate).email) {
            const { data: matchRow } = await supabase
              .from('matches')
              .select('id')
              .eq('candidate_id', candidateId)
              .eq('job_id', job.id)
              .single();

            if (matchRow?.id) {
              const { error: logErr } = await supabase
                .from('notification_log')
                .insert({
                  candidate_id: candidateId,
                  match_id: matchRow.id,
                  event_type: 'high_score_match',
                });

              // Only send if insert succeeded (unique constraint prevents duplicates)
              if (!logErr) {
                const c = candidate as Candidate;

                // 1. Email to candidate
                if (c.email) {
                  sendHighScoreMatchEmail({
                    to: c.email,
                    candidateName: c.full_name,
                    jobTitle: job.title,
                    company: job.company,
                    overallScore: analysis.overall_score,
                  }).catch((err) => console.warn('[email] send failed:', err));
                }

                // 2. WhatsApp alert to admin
                sendAdminWhatsAppAlert({
                  candidateName: c.full_name,
                  candidateEmail: c.email,
                  jobTitle: job.title,
                  company: job.company,
                  overallScore: analysis.overall_score,
                  hardSkillsScore: analysis.hard_skills.score,
                  experienceScore: analysis.experience.score,
                  cultureScore: analysis.culture.score,
                  logisticsScore: analysis.logistics.score,
                  recommendation: analysis.recommendation,
                }).catch((err) => console.warn('[whatsapp] send failed:', err));

                // 3. Mark candidate as ready_for_hire via tags (no extra column needed)
                supabase
                  .from('candidates')
                  .update({
                    tags: [...new Set([...(c.tags ?? []), 'ready_for_hire'])],
                  })
                  .eq('id', candidateId)
                  .then(({ error: tagErr }) => {
                    if (tagErr) console.warn('[ready_for_hire] tag failed:', tagErr.message);
                  });
              }
            }
          }
        } else {
          console.warn(`[matching] upsert failed for job ${job.id}:`, upsertErr.message);
        }
      } catch (jobErr) {
        console.warn(`[matching] job ${job.id} failed:`, jobErr);
      }
    }

    // Mark candidate as ready
    await supabase
      .from('candidates')
      .update({ processing_status: 'ready' })
      .eq('id', candidateId);

    return { success: true, matchesCreated };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown matching error';
    console.error('[runMatchingForCandidate]', message);

    try {
      await getSupabase()
        .from('candidates')
        .update({ processing_status: 'failed', failure_reason: message })
        .eq('id', candidateId);
    } catch { /* best-effort */ }

    return { success: false, error: message };
  }
}

// ---------------------------------------------------------------------------
// Trigger: Fire-and-forget when status transitions to 'review_needed'
// Call this from the upload action or a Supabase webhook.
// ---------------------------------------------------------------------------

export async function triggerMatchingIfReady(
  candidateId: string,
  newStatus: string
): Promise<void> {
  if (newStatus !== 'review_needed') return;
  // Non-blocking: UI doesn't wait for the matching pipeline (ui-ux-pro-max: zero jank)
  runMatchingForCandidate(candidateId).catch((err) =>
    console.error(`[triggerMatching] ${candidateId}:`, err)
  );
}

// ---------------------------------------------------------------------------
// Query: Get matches for a candidate (sorted by score desc)
// ---------------------------------------------------------------------------

export async function getMatchesForCandidate(
  candidateId: string
): Promise<GetMatchesResult> {
  const { data, error } = await getSupabase()
    .from('matches')
    .select('*, job:jobs(*)')
    .eq('candidate_id', candidateId)
    .order('overall_score', { ascending: false });

  if (error) {
    console.error('[getMatchesForCandidate]', error);
    return { success: false, error: error.message };
  }

  return { success: true, matches: (data ?? []) as MatchWithJob[] };
}

