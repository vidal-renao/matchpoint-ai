// ============================================================================
// MatchPoint AI — CV Upload & AI Extraction (Server Action)
// src/lib/actions/candidates.ts
//
// Next.js Server Action that:
//   1. Receives a PDF or image file
//   2. Uploads it to Supabase Storage
//   3. Calls Claude API to extract basic data (Name, Email, Top 3 Skills)
//   4. Creates a candidate record with processing_status = 'extracted'
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
// Clients (initialized lazily)
// ---------------------------------------------------------------------------

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY; // Service role for server-side ops
  if (!url || !key) {
    throw new Error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY env vars');
  }
  // NOTE: For full type-safety, run `supabase gen types typescript` and pass
  // the generated Database type here: createClient<Database>(url, key)
  return createClient(url, key);
}

function getAnthropicClient() {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) {
    throw new Error('Missing ANTHROPIC_API_KEY env var');
  }
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

const EXTRACTION_PROMPT = `You are an expert HR data extraction system. Analyze the provided CV/resume and extract the following information.

Respond ONLY with a valid JSON object — no markdown, no backticks, no preamble. Use this exact schema:

{
  "full_name": "string — the candidate's full name",
  "email": "string | null — their email address if visible",
  "phone": "string | null — their phone number if visible",
  "top_skills": ["skill1", "skill2", "skill3"] — the 3 most prominent technical or professional skills,
  "raw_confidence": 0.0 to 1.0 — your confidence in the accuracy of this extraction
}

Rules:
- "top_skills" must contain EXACTLY 3 items, ordered by relevance.
- If a field is not found in the document, use null (except top_skills — always provide 3).
- For skills, prefer specific technologies (e.g. "React" not "frontend") when possible.
- raw_confidence should reflect how readable and clear the CV is (1.0 = crystal clear, 0.5 = partially readable, <0.3 = very poor quality).`;

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
// Main Server Action
// ---------------------------------------------------------------------------

export async function uploadAndExtractCv(formData: FormData): Promise<UploadCvResult> {
  let candidateId: string | undefined;

  try {
    // --------------------------------------------------
    // 1. Validate the file
    // --------------------------------------------------
    const file = formData.get('cv') as File | null;
    if (!file || file.size === 0) {
      return { success: false, error: 'No file provided.' };
    }

    if (file.size > MAX_FILE_SIZE) {
      return { success: false, error: `File too large. Maximum size is ${MAX_FILE_SIZE / 1024 / 1024}MB.` };
    }

    const fileType = ALLOWED_TYPES.get(file.type);
    if (!fileType) {
      return {
        success: false,
        error: `Unsupported file type: ${file.type}. Accepted: PDF, PNG, JPEG, WebP.`,
      };
    }

    // --------------------------------------------------
    // 2. Upload to Supabase Storage
    // --------------------------------------------------
    const supabase = getSupabase();
    const fileBuffer = Buffer.from(await file.arrayBuffer());
    const timestamp = Date.now();
    const safeFileName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
    const storagePath = `cvs/${timestamp}_${safeFileName}`;

    const { error: uploadError } = await supabase.storage
      .from('matchpoint-cvs')
      .upload(storagePath, fileBuffer, {
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) {
      console.error('Storage upload failed:', uploadError);
      return { success: false, error: 'Failed to upload file to storage.' };
    }

    // --------------------------------------------------
    // 3. Create candidate record (status: extracting)
    // --------------------------------------------------
    const { data: candidate, error: insertError } = await supabase
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

    if (insertError || !candidate) {
      console.error('DB insert failed:', insertError);
      return { success: false, error: 'Failed to create candidate record.' };
    }

    candidateId = candidate.id;

    // --------------------------------------------------
    // 4. Call Claude API to extract basic data
    // --------------------------------------------------
    const anthropic = getAnthropicClient();
    const base64Content = fileBuffer.toString('base64');

    const messageContent: Anthropic.MessageCreateParams['messages'][0]['content'] =
      fileType === 'pdf'
        ? [
            {
              type: 'document',
              source: {
                type: 'base64',
                media_type: 'application/pdf',
                data: base64Content,
              },
            },
            { type: 'text', text: EXTRACTION_PROMPT },
          ]
        : [
            {
              type: 'image',
              source: {
                type: 'base64',
                media_type: file.type as 'image/png' | 'image/jpeg' | 'image/webp',
                data: base64Content,
              },
            },
            { type: 'text', text: EXTRACTION_PROMPT },
          ];

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      messages: [{ role: 'user', content: messageContent }],
    });

    // --------------------------------------------------
    // 5. Parse AI response
    // --------------------------------------------------
    const textBlock = response.content.find((block) => block.type === 'text');
    if (!textBlock || textBlock.type !== 'text') {
      throw new Error('No text response from Claude API');
    }

    // Clean potential markdown fences
    const cleanJson = textBlock.text
      .replace(/```json\s*/g, '')
      .replace(/```\s*/g, '')
      .trim();

    const extraction: AiBasicExtraction = JSON.parse(cleanJson);

    // Validate the extraction shape
    if (
      !extraction.full_name ||
      !Array.isArray(extraction.top_skills) ||
      extraction.top_skills.length !== 3
    ) {
      throw new Error('AI extraction returned invalid data shape');
    }

    // --------------------------------------------------
    // 6. Update candidate with extracted data
    // --------------------------------------------------
    const { error: updateError } = await supabase
      .from('candidates')
      .update({
        full_name: extraction.full_name,
        email: extraction.email,
        phone: extraction.phone,
        skills: extraction.top_skills,
        processing_status: 'extracted' as ProcessingStatus,
        failure_reason: null,
      })
      .eq('id', candidateId!);

    if (updateError) {
      console.error('DB update failed:', updateError);
      throw new Error('Failed to update candidate with extracted data');
    }

    return {
      success: true,
      candidateId,
      extraction,
    };
  } catch (error) {
    // --------------------------------------------------
    // Error handling: mark candidate as failed
    // --------------------------------------------------
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error during CV processing';

    console.error('CV processing error:', errorMessage);

    if (candidateId) {
      try {
        const supabase = getSupabase();
        await supabase
          .from('candidates')
          .update({
            processing_status: 'failed' as ProcessingStatus,
            failure_reason: errorMessage,
          })
          .eq('id', candidateId);
      } catch (dbError) {
        console.error('Failed to update candidate failure status:', dbError);
      }
    }

    return { success: false, error: errorMessage };
  }
}

// ---------------------------------------------------------------------------
// Helper: Get candidate by ID (for polling status)
// ---------------------------------------------------------------------------

export async function getCandidateById(id: string): Promise<Candidate | null> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('candidates')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Failed to fetch candidate:', error);
    return null;
  }

  return data as Candidate;
}

// ---------------------------------------------------------------------------
// Helper: List recent candidates
// ---------------------------------------------------------------------------

export async function listRecentCandidates(limit = 20): Promise<Candidate[]> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('candidates')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Failed to list candidates:', error);
    return [];
  }

  return (data ?? []) as Candidate[];
}
