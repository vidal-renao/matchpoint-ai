// ============================================================================
// MatchPoint AI — Database Types
// src/types/database.ts
//
// Single source of truth for all TypeScript interfaces.
// Mirror of sql/001_initial_schema.sql
// ============================================================================

// ---------------------------------------------------------------------------
// Enums
// ---------------------------------------------------------------------------

export type ProcessingStatus =
  | 'pending'
  | 'extracting'
  | 'extracted'
  | 'review_needed'
  | 'enriching'
  | 'ready'
  | 'failed';

export type CvFileType = 'pdf' | 'image';

export type JobStatus = 'draft' | 'active' | 'closed' | 'archived';

export type RemotePolicy = 'onsite' | 'hybrid' | 'remote' | 'flexible';

export type MatchRecommendation =
  | 'strong_match'
  | 'good_match'
  | 'partial_match'
  | 'poor_match';

// ---------------------------------------------------------------------------
// CV Structured Data (stored as JSONB in candidates.cv_structured)
// ---------------------------------------------------------------------------

export interface CvExperience {
  title: string;
  company: string;
  start_date: string;          // e.g. "Jan 2021"
  end_date?: string | null;    // null = current position
  description?: string;
  highlights?: string[];
}

export interface CvEducation {
  degree: string;
  institution: string;
  year?: string;
}

export interface CvLanguage {
  language: string;
  level: string;               // e.g. "Native", "C1", "Intermediate"
}

export interface CvStructured {
  experience?: CvExperience[];
  education?: CvEducation[];
  languages?: CvLanguage[];
  certifications?: string[];
  summary?: string;
}

// ---------------------------------------------------------------------------
// AI Basic Extraction (result of Phase 2 Claude call)
// ---------------------------------------------------------------------------

export interface AiBasicExtraction {
  full_name: string;
  email: string | null;
  phone: string | null;
  top_skills: [string, string, string];   // Exactly 3
  raw_confidence: number;                 // 0.0 – 1.0
}

// ---------------------------------------------------------------------------
// Candidate
// ---------------------------------------------------------------------------

export interface Candidate {
  id: string;
  user_id: string | null;
  full_name: string;
  email: string | null;
  phone: string | null;
  location: string | null;
  cv_file_url: string;
  cv_file_type: CvFileType;
  cv_structured: CvStructured;
  skills: string[];
  years_of_experience: number | null;
  seniority_level: string | null;
  processing_status: ProcessingStatus;
  failure_reason: string | null;
  source: string;
  tags: string[];
  salary_currency: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

// ---------------------------------------------------------------------------
// Job
// ---------------------------------------------------------------------------

export interface Job {
  id: string;
  title: string;
  company: string;
  location: string | null;
  remote_policy: RemotePolicy;
  description: string;
  required_skills: string[];
  experience_years: number | null;
  company_culture: string | null;
  salary_min: number | null;
  salary_max: number | null;
  salary_currency: string;
  status: JobStatus;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

// ---------------------------------------------------------------------------
// Match
// ---------------------------------------------------------------------------

export interface Match {
  id: string;
  candidate_id: string;
  job_id: string;
  overall_score: number;
  hard_skills_score: number;
  hard_skills_reasoning: string | null;
  experience_score: number;
  experience_reasoning: string | null;
  culture_score: number;
  culture_reasoning: string | null;
  logistics_score: number;
  logistics_reasoning: string | null;
  ai_verdict: string;
  strengths: string[];
  gaps: string[];
  recommendation: MatchRecommendation;
  created_at: string;
  updated_at: string;
}

// Match with the related job record (joined query)
export interface MatchWithJob extends Match {
  job: Job;
}

// ---------------------------------------------------------------------------
// Matching Engine (results from src/lib/actions/matching.ts)
// ---------------------------------------------------------------------------

export interface DimensionScore {
  score: number;
  reasoning: string;
}

export interface MatchAnalysis {
  overall_score: number;
  hard_skills: DimensionScore;
  experience: DimensionScore;
  culture: DimensionScore;
  logistics: DimensionScore;
  ai_verdict: string;
  strengths: string[];
  gaps: string[];
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
