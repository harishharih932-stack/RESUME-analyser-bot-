export type CandidateStatus = 'New' | 'Shortlisted' | 'Rejected' | 'On Hold';
export type FitCategory = 'Excellent' | 'Good' | 'Average' | 'Poor';

export interface ExtractedLink {
  url: string;
  category: 'LinkedIn' | 'GitHub' | 'GitLab' | 'LeetCode' | 'Kaggle' | 'HackerRank' | 'Portfolio/Website' | 'Certificates' | 'Other';
  text?: string;
}

export interface EducationEntry {
  degree: string;
  institute: string;
  year?: string;
  cgpa?: string;
}

export interface ExperienceEntry {
  company: string;
  role: string;
  duration?: string;
  years?: number;
  description?: string;
}

export interface ProjectEntry {
  name: string;
  description?: string;
  techStack?: string[];
  link?: string;
}

export interface ParsedResumeData {
  name: string;
  email: string;
  phone: string;
  location: string;
  summary: string;
  skills: string[];
  education: EducationEntry[];
  experience: ExperienceEntry[];
  totalExperienceYears: number;
  projects: ProjectEntry[];
  certifications: string[];
  achievements: string[];
  languages: string[];
  links: ExtractedLink[];
  rawText: string;
}

export interface LLMAnalysis {
  semantic_match_score: number; // 0-100
  strengths: string[];
  weaknesses: string[];
  red_flags: string[];
  skill_evidence: Array<{ skill: string; evidence: string }>;
  suggested_interview_questions: string[];
  one_line_verdict: string;
  fit_category: FitCategory;
  isDemo?: boolean;
}

export interface ComponentScores {
  tfidfCosineScore: number;     // 0-100
  bm25Score: number;            // 0-100 normalized
  lexicalCombinedScore: number; // 0-100 (combination of tfidf & bm25)
  skillMatchScore: number;      // 0-100
  experienceFitScore: number;   // 0-100
  educationFitScore: number;    // 0-100
  llmSemanticScore: number;     // 0-100
  mlAdjustedScore?: number;     // 0-100 (from logistic regression prediction)
}

export interface SkillMatchDetails {
  matchedRequired: string[];
  missingRequired: string[];
  matchedPreferred: string[];
  missingPreferred: string[];
  extraSkills: string[];
  requiredCoveragePct: number;
  preferredCoveragePct: number;
}

export interface Candidate {
  id: string;
  fileName: string;
  fileSize: number;
  parsedAt: string;
  parsedData: ParsedResumeData;
  scores: ComponentScores;
  finalScore: number; // 0-100 weighted
  rank?: number;
  skillDetails: SkillMatchDetails;
  llmAnalysis?: LLMAnalysis;
  status: CandidateStatus;
  notes: string;
  explanation: string;
  blindName: string; // e.g. "Candidate #1"
}

export interface ScoringWeights {
  lexical: number;    // TF-IDF & BM25 Similarity (e.g. 25%)
  skills: number;     // Skill match (e.g. 30%)
  experience: number; // Experience fit (e.g. 20%)
  education: number;  // Education fit (e.g. 10%)
  llm: number;        // LLM semantic match (e.g. 15%)
}

export interface JobDescription {
  id: string;
  title: string;
  department?: string;
  location?: string;
  rawText: string;
  requiredSkills: string[];
  preferredSkills: string[];
  minExperienceYears: number;
  maxExperienceYears?: number;
  educationLevel: 'High School' | 'Associate' | 'Bachelors' | 'Masters' | 'PhD' | 'Any';
  createdAt: string;
  updatedAt: string;
}

export interface AppSettings {
  groqApiKey: string;
  model: string;
  customModelName: string;
  temperature: number;
  maxTokens: number;
  weights: ScoringWeights;
  blindScreening: boolean;
  theme: 'light' | 'dark' | 'system';
  autoGenerateReport: boolean;
}

export interface LogisticRegressionModelWeights {
  featureNames: string[];
  weights: number[]; // tfidf, bm25, skills, exp, edu, llm
  bias: number;
  accuracy: number;
  loss: number;
  sampleCount: number;
  trained: boolean;
}

export interface PipelineProgress {
  active: boolean;
  stage: 'idle' | 'parsing' | 'nlp_features' | 'ml_scoring' | 'llm_analysis' | 'ranking' | 'completed';
  currentCandidate: string;
  progressPercent: number;
  totalCandidates: number;
  processedCount: number;
  error?: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  content: string;
  timestamp: string;
  candidateReferences?: string[];
  showStatsSnippet?: boolean;
}
