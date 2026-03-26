/**
 * Confidence Scoring System
 * Each recommendation is scored for how reliable/trustworthy it is.
 */

export interface ConfidenceInput {
  recommendationId: string;
  category: string;
  profileCompleteness: number; // 0-100: % of important fields filled
  isRuleBased: boolean;        // true = pure math, false = LLM estimate
  isMarketDependent: boolean;  // true = equity returns, false = tax/fixed
  dataSource: 'form16' | 'user_input' | 'estimated';
}

/**
 * Calculate confidence score (0-100) for a single recommendation.
 * Higher = more trustworthy.
 */
export function calculateConfidence(input: ConfidenceInput): number {
  let score = 0;

  // 1. Profile completeness (max 35 pts)
  score += Math.round(input.profileCompleteness * 0.35);

  // 2. Calculation type (max 35 pts)
  // Rule-based math (tax calculations, emergency fund) is highly reliable
  score += input.isRuleBased ? 35 : 20;

  // 3. Market dependency penalty (up to -20 pts)
  score -= input.isMarketDependent ? 20 : 0;

  // 4. Data source quality (max 20 pts)
  const sourceBonus = {
    form16: 20,        // Most accurate — government document
    user_input: 10,    // Self-reported, may have errors
    estimated: 5,      // Heuristic, least reliable
  };
  score += sourceBonus[input.dataSource];

  return Math.max(10, Math.min(100, Math.round(score)));
}

/**
 * Calculate profile completeness as a percentage.
 */
export function calculateProfileCompleteness(profile: Record<string, any>): number {
  const importantFields = [
    'age', 'income', 'expenses', 'savings', 'loans',
    'riskAppetite', 'hasTermInsurance', 'hasHealthInsurance',
    'employmentType', 'city',
  ];

  const filled = importantFields.filter(
    (f) => profile[f] !== undefined && profile[f] !== null && profile[f] !== ''
  ).length;

  return Math.round((filled / importantFields.length) * 100);
}

/**
 * Generate a human-readable confidence label.
 */
export function confidenceLabel(score: number): {
  label: string;
  color: string;
  description: string;
} {
  if (score >= 85) {
    return {
      label: 'High Confidence',
      color: 'text-emerald-600',
      description: 'Based on verified data and deterministic calculations',
    };
  }
  if (score >= 65) {
    return {
      label: 'Moderate Confidence',
      color: 'text-amber-600',
      description: 'Based on your inputs — providing complete profile improves accuracy',
    };
  }
  return {
    label: 'Indicative',
    color: 'text-slate-500',
    description: 'Estimate based on industry averages — fill more profile details for precision',
  };
}
