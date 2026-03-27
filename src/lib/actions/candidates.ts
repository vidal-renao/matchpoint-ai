// ============================================================================
// MatchPoint AI — CV Upload & AI Extraction (Server Action)
// src/lib/actions/candidates.ts
//
// Standards applied (ai-bridge skill):
//   ✓ claude-sonnet-4-6 for full extraction (complex reasoning)
//   ✓ Schema Guard: retries once on invalid JSON
//   ✓ Multi-modal: PDF via document block, images via vision
//   ✓ Token-efficient minified JSON prompt
// ============================================================================

'use server';

import { createClient } from '@supabase/supabase-js';
import Anthropic from '@anthropic-ai/sdk';
import type {
  Candidate,
  AiBasicExtraction,
  CvFileType,
  ProcessingStatus,
} from '@/types/database';

// ---------------------------------------------------------------------------
// Clients (lazy initialization)
// ---------------------------------------------------------------------------

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error('Missing Supabase env vars');
  return createClient(url, key);
}

function getAnthropic() {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) throw new Error('Missing ANTHROPIC_API_KEY');
  return new Anthropic({ apiKey: key });
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

const ALLOWED_TYPES = new Map<string, CvFileType>([
  ['application/pdf', 'pdf'],
  ['image/png', 'image'],
  ['image/jpeg', 'image'],
  ['image/webp', 'image'],
]);

// ai-bridge: minified JSON schema, strict contract, visual cues for seniority
const EXTRACTION_PROMPT = `You are an elite HR extraction system. Analyze this CV/resume.
Respond ONLY with valid minified JSON. No markdown. No backticks. Exact schema:
{"full_name":"string","email":"string|null","phone":"string|null","top_skills":["s1","s2","s3"],"raw_confidence":0.0}
Rules: top_skills=exactly 3 most prominent skills ordered by relevance. raw_confidence=0.0(unreadable)→1.0(perfect). Use visual layout cues (bold text, section headers) to infer seniority when text is ambiguous.`;

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface UploadCvResult {
  success: boolean;
  candidateId?: string;
  extraction?: AiBasicExtraction;
  error?: string;
}

// ---------------------------------------------------------------------------
// Schema Guard: parse + retry once on invalid JSON
// ---------------------------------------------------------------------------

async function parseExtractionWithRetry(
  anthropic: Anthropic,
  content: Anthropic.MessageCreateParams['messages'][0]['content'],
  attempt = 1
): Promise<AiBasicExtraction> {
  const res = await anthropic.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 512,
    messages: [{ role: 'user', content }],
  });

  const block = res.content.find((b) => b.type === 'text');
  if (!block || block.type !== 'text') throw new Error('No text from Claude');

  const clean = block.text
    .replace(/```json\s*/g, '')
    .replace(/```\s*/g, '')
    .trim();

  let parsed: AiBasicExtraction;
  try {
    parsed = JSON.parse(clean);
  } catch {
    if (attempt < 2) return parseExtractionWithRetry(anthropic, content, 2);
    throw new Error('Claude returned invalid JSON after retry');
  }

  // Shape validation
  if (
    !parsed.full_name ||
    !Array.isArray(parsed.top_skills) ||
    parsed.top_skills.length !== 3
  ) {
    if (attempt < 2) return parseExtractionWithRetry(anthropic, content, 2);
    throw new Error('Invalid extraction shape after retry');
  }

  return parsed;
}

// ---------------------------------------------------------------------------
// Main Server Action: Upload CV + Extract
// ---------------------------------------------------------------------------

export async function uploadAndExtractCv(formData: FormData): Promise<UploadCvResult> {
  let candidateId: string | undefined;

  try {
    // 1. Validate file
    const file = formData.get('cv') as File | null;
    if (!file || file.size === 0) return { success: false, error: 'No file provided.' };
    if (file.size > MAX_FILE_SIZE) return { success: false, error: 'File too large (max 10 MB).' };

    const fileType = ALLOWED_TYPES.get(file.type);
    if (!fileType) return { success: false, error: `Unsupported type: ${file.type}` };

    // 2. Upload to Supabase Storage
    const supabase = getSupabase();
    const fileBuffer = Buffer.from(await file.arrayBuffer());
    const safeFileName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
    const storagePath = `cvs/${Date.now()}_${safeFileName}`;

    const { error: uploadErr } = await supabase.storage
      .from('matchpoint-cvs')
      .upload(storagePath, fileBuffer, { contentType: file.type, upsert: false });

    if (uploadErr) return { success: false, error: 'Storage upload failed.' };

    // 3. Create candidate record (status: extracting)
    const { data: candidate, error: insertErr } = await supabase
      .from('candidates')
      .insert({
        full_name: 'Processing...',
        cv_file_url: storagePath,
        cv_file_type: fileType,
        processing_status: 'extracting' as ProcessingStatus,
        skills: [],
        cv_structured: {},
        salary_currency: 'USD',
        source: 'upload',
        tags: [],
      })
      .select('id')
      .single();

    if (insertErr || !candidate) return { success: false, error: 'DB insert failed.' };
    candidateId = candidate.id;

    // 4. Call Claude — multi-modal (PDF doc block or image vision)
    const anthropic = getAnthropic();
    const base64 = fileBuffer.toString('base64');

    const msgContent: Anthropic.MessageCreateParams['messages'][0]['content'] =
      fileType === 'pdf'
        ? [
            { type: 'document', source: { type: 'base64', media_type: 'application/pdf', data: base64 } },
            { type: 'text', text: EXTRACTION_PROMPT },
          ]
        : [
            { type: 'image', source: { type: 'base64', media_type: file.type as 'image/png' | 'image/jpeg' | 'image/webp', data: base64 } },
            { type: 'text', text: EXTRACTION_PROMPT },
          ];

    // 5. Parse with Schema Guard (retry once on bad JSON)
    const extraction = await parseExtractionWithRetry(anthropic, msgContent);

    // 6. Update candidate — status → review_needed (triggers matching engine)
    const { error: updateErr } = await supabase
      .from('candidates')
      .update({
        full_name: extraction.full_name,
        email: extraction.email,
        phone: extraction.phone,
        skills: extraction.top_skills,
        processing_status: 'review_needed' as ProcessingStatus,
        failure_reason: null,
      })
      .eq('id', candidateId!);

    if (updateErr) throw new Error('Failed to update candidate with extracted data');

    return { success: true, candidateId, extraction };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('[uploadAndExtractCv]', message);

    if (candidateId) {
      try {
        await getSupabase()
          .from('candidates')
          .update({ processing_status: 'failed' as ProcessingStatus, failure_reason: message })
          .eq('id', candidateId);
      } catch { /* best-effort */ }
    }

    return { success: false, error: message };
  }
}

// ---------------------------------------------------------------------------
// Query helpers
// ---------------------------------------------------------------------------

export async function getCandidateById(id: string): Promise<Candidate | null> {
  const { data, error } = await getSupabase()
    .from('candidates')
    .select('*')
    .eq('id', id)
    .single();

  if (error) { console.error('[getCandidateById]', error); return null; }
  return data as Candidate;
}

export async function listRecentCandidates(limit = 20): Promise<Candidate[]> {
  const { data, error } = await getSupabase()
    .from('candidates')
    .select('*')
    .is('deleted_at', null)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) { console.error('[listRecentCandidates]', error); return []; }
  return (data ?? []) as Candidate[];
}
