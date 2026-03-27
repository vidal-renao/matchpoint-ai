'use server';

// ============================================================================
// MatchPoint AI — Profile Edit Actions
// src/lib/actions/profile.ts
// ============================================================================

import { createClient } from '@supabase/supabase-js';
import { createClient as createServerClient } from '@/lib/supabase/server';
import Anthropic from '@anthropic-ai/sdk';
import type { Candidate, CvStructured } from '@/types/database';

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error('Missing Supabase env vars');
  return createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

// ---------------------------------------------------------------------------
// Update basic candidate profile fields
// ---------------------------------------------------------------------------

export interface UpdateProfileResult {
  success: boolean;
  error?: string;
}

export interface ProfileUpdatePayload {
  full_name?: string;
  email?: string;
  phone?: string;
  location?: string;
  skills?: string[];
  years_of_experience?: number | null;
  seniority_level?: string | null;
  cv_structured?: CvStructured;
}

export async function updateCandidateProfile(
  updates: ProfileUpdatePayload
): Promise<UpdateProfileResult> {
  try {
    const serverClient = await createServerClient();
    const { data: { user } } = await serverClient.auth.getUser();
    if (!user) return { success: false, error: 'Not authenticated.' };

    const supabase = getSupabase();

    // Resolve candidate
    const { data: candidate } = await supabase
      .from('candidates')
      .select('id')
      .eq('user_id', user.id)
      .is('deleted_at', null)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (!candidate) return { success: false, error: 'Candidate profile not found.' };

    const { error } = await supabase
      .from('candidates')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', candidate.id);

    if (error) {
      console.error('[updateCandidateProfile]', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return { success: false, error: message };
  }
}

// ---------------------------------------------------------------------------
// AI-powered profile enhancement: enrich cv_structured from free-text summary
// ---------------------------------------------------------------------------

export interface EnhanceProfileResult {
  success: boolean;
  cv_structured?: CvStructured;
  error?: string;
}

export async function enhanceProfileWithAI(
  candidateId: string,
  freeText: string
): Promise<EnhanceProfileResult> {
  if (!freeText.trim()) return { success: false, error: 'No text provided.' };

  try {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) throw new Error('Missing ANTHROPIC_API_KEY');

    const anthropic = new Anthropic({ apiKey });

    const prompt = `Extract structured career data from this professional summary.
Respond ONLY with valid minified JSON matching this schema:
{"experience":[{"title":"string","company":"string","start_date":"string","end_date":"string|null","description":"string"}],"education":[{"degree":"string","institution":"string","year":"string"}],"languages":[{"language":"string","level":"string"}],"certifications":["string"],"summary":"string"}
All arrays may be empty []. summary should be 1-2 sentences.

Text:
${freeText.slice(0, 3000)}`;

    const res = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 1024,
      messages: [{ role: 'user', content: prompt }],
    });

    const block = res.content.find((b) => b.type === 'text');
    if (!block || block.type !== 'text') throw new Error('No text from Claude');

    const clean = block.text.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();
    const cv_structured: CvStructured = JSON.parse(clean);

    // Persist
    const supabase = getSupabase();
    await supabase
      .from('candidates')
      .update({ cv_structured, updated_at: new Date().toISOString() })
      .eq('id', candidateId);

    return { success: true, cv_structured };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('[enhanceProfileWithAI]', message);
    return { success: false, error: message };
  }
}
