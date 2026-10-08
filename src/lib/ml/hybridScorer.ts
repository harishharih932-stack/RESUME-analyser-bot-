/**
 * TalentRank AI - Hybrid Scoring Engine & Explainability Generator
 * Combines Lexical (TF-IDF & BM25), Skill Match, Experience Fit, Education Fit, and LLM Semantic Match.
 */

import { Candidate, ComponentScores, JobDescription, ScoringWeights } from '../../types';

/**
 * Compute the weighted final hybrid score
 */
export function calculateHybridScore(
  scores: ComponentScores,
  weights: ScoringWeights
): number {
  const totalWeight =
    (weights.lexical || 0) +
    (weights.skills || 0) +
    (weights.experience || 0) +
    (weights.education || 0) +
    (weights.llm || 0);

  if (totalWeight <= 0) return 50;

  // Lexical score is an ensemble of TF-IDF Cosine Similarity and Okapi BM25
  const lexicalVal = scores.lexicalCombinedScore ?? (0.5 * scores.tfidfCosineScore + 0.5 * scores.bm25Score);
  const skillVal = scores.skillMatchScore;
  const expVal = scores.experienceFitScore;
  const eduVal = scores.educationFitScore;
  const llmVal = scores.llmSemanticScore;

  const weightedSum =
    lexicalVal * weights.lexical +
    skillVal * weights.skills +
    expVal * weights.experience +
    eduVal * weights.education +
    llmVal * weights.llm;

  const finalScore = weightedSum / totalWeight;
  return Math.min(100, Math.max(0, Math.round(finalScore * 10) / 10));
}

/**
 * Generate human-readable, plain English explanation for why a candidate scored as they did
 */
export function generateScoreExplanation(
  candidateName: string,
  scores: ComponentScores,
  finalScore: number,
  jd: JobDescription,
  matchedSkillsCount: number,
  requiredSkillsTotal: number,
  totalExpYears: number,
  educationSummary: string
): string {
  const points: string[] = [];

  // Skill alignment
  if (requiredSkillsTotal > 0) {
    const skillRatio = matchedSkillsCount / requiredSkillsTotal;
    if (skillRatio >= 0.8) {
      points.push(`Covers ${matchedSkillsCount} of ${requiredSkillsTotal} required skills (${Math.round(skillRatio * 100)}%), demonstrating strong technical alignment.`);
    } else if (skillRatio >= 0.5) {
      points.push(`Covers ${matchedSkillsCount} of ${requiredSkillsTotal} required skills, demonstrating solid fundamentals with a few niche skill gaps.`);
    } else {
      points.push(`Covers only ${matchedSkillsCount} of ${requiredSkillsTotal} required skills, indicating significant domain skill gaps.`);
    }
  }

  // Experience fit
  if (jd.minExperienceYears > 0) {
    if (totalExpYears >= jd.minExperienceYears) {
      points.push(`Has ${totalExpYears} yrs of experience meeting the required ${jd.minExperienceYears} yrs.`);
    } else {
      points.push(`Has ${totalExpYears} yrs of experience, which is below the ${jd.minExperienceYears} yrs requirement.`);
    }
  }

  // Education fit
  if (scores.educationFitScore >= 90) {
    points.push(`Education (${educationSummary || 'Degree'}) satisfies or exceeds academic prerequisites.`);
  } else if (scores.educationFitScore < 70) {
    points.push(`Academic credentials (${educationSummary || 'Degree'}) are slightly below the preferred level.`);
  }

  // Lexical & Semantic NLP
  if (scores.tfidfCosineScore >= 60 || scores.bm25Score >= 60) {
    points.push(`High lexical keyword & terminology overlap with the job description.`);
  }

  if (scores.llmSemanticScore >= 80) {
    points.push(`LLM semantic qualitative analysis identified strong project leadership and deep conceptual grasp.`);
  } else if (scores.llmSemanticScore <= 50) {
    points.push(`LLM semantic evaluation noted lack of deep production experience.`);
  }

  const category = finalScore >= 80 ? 'top-tier fit' : finalScore >= 65 ? 'solid competitive fit' : finalScore >= 50 ? 'moderate fit' : 'low-match candidate';

  return `${candidateName} is rated as a ${category} with an overall score of ${finalScore}/100. ${points.join(' ')}`;
}
