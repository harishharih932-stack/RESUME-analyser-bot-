/**
 * TalentRank AI - Experience & Education Scoring
 * Calibrated heuristics for experience fit and educational credentials.
 */

import { EducationEntry } from '../../types';

export const EDUCATION_LEVEL_RANKS: Record<string, number> = {
  'PhD': 5,
  'Doctorate': 5,
  'Masters': 4,
  'Master': 4,
  'MS': 4,
  'M.S.': 4,
  'M.Tech': 4,
  'MBA': 4,
  'Bachelors': 3,
  'Bachelor': 3,
  'BS': 3,
  'B.S.': 3,
  'B.Tech': 3,
  'BE': 3,
  'B.E.': 3,
  'Associate': 2,
  'Diploma': 2,
  'High School': 1,
  'Any': 0
};

/**
 * Infer highest education degree level from education entries or raw text
 */
export function inferEducationLevel(education: EducationEntry[], rawText: string): { level: string; rank: number } {
  let highestRank = 1;
  let highestLevel = 'High School';

  const checkText = (text: string) => {
    const t = text.toLowerCase();
    if (/\b(ph\.?d|doctorate|doctor of philosophy)\b/i.test(t)) {
      return { level: 'PhD', rank: 5 };
    }
    if (/\b(master|m\.?s\.?|m\.?tech|m\.?e\.?|mba|postgrad)\b/i.test(t)) {
      return { level: 'Masters', rank: 4 };
    }
    if (/\b(bachelor|b\.?s\.?|b\.?tech|b\.?e\.?|undergraduate)\b/i.test(t)) {
      return { level: 'Bachelors', rank: 3 };
    }
    if (/\b(associate|diploma)\b/i.test(t)) {
      return { level: 'Associate', rank: 2 };
    }
    return null;
  };

  // 1. Check structured education array
  for (const entry of education) {
    const res = checkText(`${entry.degree} ${entry.institute}`);
    if (res && res.rank > highestRank) {
      highestRank = res.rank;
      highestLevel = res.level;
    }
  }

  // 2. Check raw text if not yet Masters/PhD
  if (highestRank < 4 && rawText) {
    const res = checkText(rawText);
    if (res && res.rank > highestRank) {
      highestRank = res.rank;
      highestLevel = res.level;
    }
  }

  return { level: highestLevel, rank: highestRank };
}

/**
 * Score education level fit against JD requirement (0 to 100)
 */
export function scoreEducationFit(
  candidateLevel: { level: string; rank: number },
  requiredLevelStr: string
): number {
  const reqRank = EDUCATION_LEVEL_RANKS[requiredLevelStr] || 3; // default Bachelors

  if (reqRank === 0) return 100; // Any education accepted

  const diff = candidateLevel.rank - reqRank;

  if (diff >= 1) {
    // Exceeds requirement (e.g., Masters for Bachelors job)
    return 100;
  } else if (diff === 0) {
    // Exact requirement match
    return 95;
  } else if (diff === -1) {
    // One level below (e.g., Bachelors for Masters required)
    return 75;
  } else if (diff === -2) {
    // Two levels below (e.g., Associate for Masters required)
    return 55;
  } else {
    return 40;
  }
}

/**
 * Score candidate experience years against JD required min/max years (0 to 100)
 */
export function scoreExperienceFit(
  candidateYears: number,
  minRequiredYears: number,
  maxRequiredYears?: number
): number {
  if (minRequiredYears <= 0) return 95;

  const cand = Math.max(0, candidateYears);

  if (cand >= minRequiredYears) {
    // Meets or exceeds minimum requirement
    if (maxRequiredYears && maxRequiredYears > minRequiredYears) {
      if (cand <= maxRequiredYears) {
        // Ideal window
        return 100;
      } else {
        // Slight taper if over-qualified (e.g. 15 yrs for 2-4 yr junior role)
        const overage = cand - maxRequiredYears;
        const penalty = Math.min(15, overage * 2.5);
        return Math.max(85, Math.round(100 - penalty));
      }
    } else {
      // Exceeds min with no upper cap
      return Math.min(100, Math.round(90 + Math.min(10, (cand - minRequiredYears) * 2)));
    }
  } else {
    // Below minimum required experience
    const ratio = cand / minRequiredYears; // 0 to 1
    // Progressive curve: 3 yrs for 4 yrs req = 0.75 ratio -> 70% fit
    const score = Math.round(ratio * 80);
    return Math.max(20, score);
  }
}
