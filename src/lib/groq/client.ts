/**
 * TalentRank AI - Groq Cloud API Client
 * High-performance OpenAI-compatible client for Groq's LPU inference.
 * Features: rate limit exponential backoff, concurrency pool, structured JSON mode,
 * and resilient fallbacks.
 */

import { AppSettings, FitCategory, JobDescription, LLMAnalysis, ParsedResumeData } from '../../types';

export const GROQ_ENDPOINT = 'https://api.groq.com/openai/v1/chat/completions';
export const GROQ_MODELS_ENDPOINT = 'https://api.groq.com/openai/v1/models';

export const POPULAR_GROQ_MODELS = [
  { id: 'openai/gpt-oss-120b', name: 'openai/gpt-oss-120b' },
  { id: 'openai/gpt-oss-20b', name: 'openai/gpt-oss-20b' },
  { id: 'qwen/qwen3.8-27b', name: 'qwen/qwen3.8-27b' },
  { id: 'allam-2-7b', name: 'allam-2-7b' },
  { id: 'llama-3.3-70b-versatile', name: 'llama-3.3-70b-versatile (Recommended)' },
  { id: 'llama-3.1-8b-instant', name: 'llama-3.1-8b-instant (Fastest)' },
  { id: 'deepseek-r1-distill-llama-70b', name: 'deepseek-r1-distill-llama-70b' },
  { id: 'mixtral-8x7b-32768', name: 'mixtral-8x7b-32768 (32k context)' },
  { id: 'llama-3.2-11b-vision-preview', name: 'llama-3.2-11b-vision-preview' },
  { id: 'custom', name: 'Custom Model (Enter below)...' }
];

/**
 * Fetch available model IDs directly from the Groq API
 */
export async function fetchGroqModels(apiKey: string): Promise<string[]> {
  if (!apiKey || apiKey.trim().length === 0) return [];
  try {
    const res = await fetch(GROQ_MODELS_ENDPOINT, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey.trim()}`,
        'Content-Type': 'application/json'
      }
    });
    if (res.status === 200) {
      const data = await res.json();
      if (Array.isArray(data.data)) {
        return data.data.map((m: any) => m.id).sort();
      }
    }
    return [];
  } catch (err) {
    console.warn('Failed to fetch models from Groq API:', err);
    return [];
  }
}

/**
 * Test connectivity with Groq API Key
 */
export async function testGroqConnection(apiKey: string): Promise<{ success: boolean; message: string }> {
  if (!apiKey || apiKey.trim().length === 0) {
    return { success: false, message: 'API Key is empty. Please enter your Groq API key.' };
  }

  try {
    const res = await fetch(GROQ_MODELS_ENDPOINT, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey.trim()}`,
        'Content-Type': 'application/json'
      }
    });

    if (res.status === 200) {
      return { success: true, message: 'Connected successfully to Groq! Fast LPU inference active.' };
    } else if (res.status === 401) {
      return { success: false, message: 'Invalid API Key (401 Unauthorized). Check your Groq console key.' };
    } else {
      const errorData = await res.json().catch(() => ({}));
      return {
        success: false,
        message: errorData.error?.message || `Groq API responded with status ${res.status}`
      };
    }
  } catch (err: any) {
    return { success: false, message: `Network error connecting to Groq: ${err?.message || 'Check your connection'}` };
  }
}

/**
 * Call Groq chat completion with exponential backoff on 429
 */
export async function callGroqChat(
  messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }>,
  settings: AppSettings,
  jsonMode: boolean = false,
  maxRetries: number = 3
): Promise<string> {
  const model = settings.model === 'custom' ? (settings.customModelName || 'llama-3.3-70b-versatile') : settings.model;
  let delay = 1500;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const body: any = {
        model,
        messages,
        temperature: settings.temperature,
        max_tokens: settings.maxTokens
      };

      if (jsonMode) {
        body.response_format = { type: 'json_object' };
      }

      const res = await fetch(GROQ_ENDPOINT, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${settings.groqApiKey.trim()}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
      });

      if (res.status === 200) {
        const data = await res.json();
        return data.choices?.[0]?.message?.content || '';
      }

      if (res.status === 429 && attempt < maxRetries) {
        // Rate limit reached: wait with exponential backoff + jitter
        await new Promise(r => setTimeout(r, delay + Math.random() * 500));
        delay *= 2;
        continue;
      }

      const errJson = await res.json().catch(() => ({}));
      throw new Error(errJson.error?.message || `Groq API error: status ${res.status}`);
    } catch (err: any) {
      if (attempt === maxRetries) {
        throw err;
      }
      await new Promise(r => setTimeout(r, delay));
      delay *= 1.8;
    }
  }

  throw new Error('Groq request timed out or exceeded retry limit');
}

/**
 * Clean and parse JSON response from LLM
 */
export function safelyParseJSON<T>(text: string, fallback: T): T {
  try {
    // Strip markdown code fences if present
    const cleaned = text
      .replace(/^```json\s*/i, '')
      .replace(/^```\s*/i, '')
      .replace(/\s*```$/i, '')
      .trim();

    return JSON.parse(cleaned) as T;
  } catch (e) {
    // Try to extract between first { and last }
    const firstBrace = text.indexOf('{');
    const lastBrace = text.lastIndexOf('}');
    if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
      try {
        const substr = text.substring(firstBrace, lastBrace + 1);
        return JSON.parse(substr) as T;
      } catch (e2) {
        // ignore
      }
    }
    console.warn('Failed to parse JSON from LLM:', text);
    return fallback;
  }
}

/**
 * Analyze candidate resume against Job Description via Groq
 */
export async function analyzeResumeWithGroq(
  resume: ParsedResumeData,
  jd: JobDescription,
  settings: AppSettings
): Promise<LLMAnalysis> {
  const prompt = `You are a Principal Technical Recruiter and Engineering Leader.
Evaluate this candidate's resume strictly against the provided Job Description.

JOB DESCRIPTION:
Title: ${jd.title}
Required Experience: ${jd.minExperienceYears}+ years
Required Skills: ${jd.requiredSkills.join(', ')}
Preferred Skills: ${jd.preferredSkills.join(', ')}
Education Prerequisite: ${jd.educationLevel}
Full Description:
${jd.rawText.slice(0, 2000)}

CANDIDATE RESUME:
Name: ${resume.name}
Total Experience: ~${resume.totalExperienceYears} years
Identified Skills: ${resume.skills.join(', ')}
Education: ${resume.education.map(e => `${e.degree} from ${e.institute} (${e.year || ''})`).join('; ')}
Work History: ${resume.experience.map(e => `${e.role} at ${e.company} (${e.duration || ''}): ${e.description || ''}`).join('; ')}
Summary: ${resume.summary}
Raw Excerpt:
${resume.rawText.slice(0, 3000)}

Respond with STRICT VALID JSON with these keys:
{
  "semantic_match_score": <number 0 to 100 representing overall quality & qualitative fit>,
  "strengths": [<3 to 5 concrete bullet strings detailing strong project or domain evidence>],
  "weaknesses": [<2 to 4 honest bullet strings detailing skill gaps, tenure concerns, or missing prerequisites>],
  "red_flags": [<0 to 2 potential concerns such as resume padding, lack of quantifiable impact, or frequent job changes>],
  "skill_evidence": [
    {"skill": "<skill_name>", "evidence": "<where and how they used it>"}
  ],
  "suggested_interview_questions": [<3 to 4 challenging technical interview questions tailored specifically to their resume claims>],
  "one_line_verdict": "<concise summary of candidate suitability in 1 sentence>",
  "fit_category": "<one of: Excellent, Good, Average, Poor>"
}`;

  const messages: Array<{ role: 'system' | 'user'; content: string }> = [
    {
      role: 'system',
      content: 'You are an objective, highly calibrated AI talent screening engine. You output valid JSON only.'
    },
    { role: 'user', content: prompt }
  ];

  const rawJson = await callGroqChat(messages, settings, true);

  const fallback: LLMAnalysis = {
    semantic_match_score: 70,
    strengths: ['Relevant software engineering experience', 'Familiar with core tech stack'],
    weaknesses: ['May require ramp up on secondary libraries'],
    red_flags: [],
    skill_evidence: resume.skills.slice(0, 4).map(s => ({ skill: s, evidence: 'Mentioned in projects and experience' })),
    suggested_interview_questions: ['Describe a high-scale architecture problem you solved.'],
    one_line_verdict: 'Shows practical fundamentals matching the core role expectations.',
    fit_category: 'Good'
  };

  const parsed = safelyParseJSON<LLMAnalysis>(rawJson, fallback);

  // Normalize fit category
  const validCategories: FitCategory[] = ['Excellent', 'Good', 'Average', 'Poor'];
  const fitCat = validCategories.includes(parsed.fit_category) ? parsed.fit_category : 'Good';

  return {
    semantic_match_score: Math.min(100, Math.max(0, Math.round(parsed.semantic_match_score || 70))),
    strengths: Array.isArray(parsed.strengths) ? parsed.strengths.slice(0, 6) : fallback.strengths,
    weaknesses: Array.isArray(parsed.weaknesses) ? parsed.weaknesses.slice(0, 5) : fallback.weaknesses,
    red_flags: Array.isArray(parsed.red_flags) ? parsed.red_flags.slice(0, 4) : [],
    skill_evidence: Array.isArray(parsed.skill_evidence) ? parsed.skill_evidence.slice(0, 8) : fallback.skill_evidence,
    suggested_interview_questions: Array.isArray(parsed.suggested_interview_questions) ? parsed.suggested_interview_questions.slice(0, 5) : fallback.suggested_interview_questions,
    one_line_verdict: parsed.one_line_verdict || fallback.one_line_verdict,
    fit_category: fitCat
  };
}

/**
 * Auto-extract structured requirements from freeform Job Description text
 */
export async function extractRequirementsFromJDText(
  jdText: string,
  settings: AppSettings
): Promise<Partial<JobDescription>> {
  const prompt = `Extract structured job requirements from the following Job Description text.
Return ONLY valid JSON matching this structure:
{
  "title": "<inferred job title, e.g. Senior Machine Learning Engineer>",
  "requiredSkills": ["<skill 1>", "<skill 2>", ...],
  "preferredSkills": ["<skill 1>", "<skill 2>", ...],
  "minExperienceYears": <number, minimum years of experience, default 3>,
  "educationLevel": "<one of: High School, Associate, Bachelors, Masters, PhD, Any>",
  "location": "<location string, e.g. San Francisco, CA (Hybrid) or Remote>"
}

JOB DESCRIPTION TEXT:
${jdText.slice(0, 4000)}`;

  const messages: Array<{ role: 'system' | 'user'; content: string }> = [
    { role: 'system', content: 'You are a talent intelligence engine. Output valid JSON only.' },
    { role: 'user', content: prompt }
  ];

  const rawJson = await callGroqChat(messages, settings, true);

  const fallback: Partial<JobDescription> = {
    title: 'Software Engineer',
    requiredSkills: ['Python', 'Docker', 'SQL'],
    preferredSkills: ['Kubernetes', 'Cloud'],
    minExperienceYears: 3,
    educationLevel: 'Bachelors',
    location: 'Remote'
  };

  return safelyParseJSON<Partial<JobDescription>>(rawJson, fallback);
}

/**
 * Process array of items with concurrency limit
 */
export async function mapConcurrent<T, R>(
  items: T[],
  limit: number,
  fn: (item: T, index: number) => Promise<R>
): Promise<R[]> {
  const results: R[] = new Array(items.length);
  let currentIndex = 0;

  async function worker() {
    while (currentIndex < items.length) {
      const idx = currentIndex++;
      results[idx] = await fn(items[idx], idx);
    }
  }

  const workers = Array.from({ length: Math.min(limit, items.length) }, () => worker());
  await Promise.all(workers);
  return results;
}
