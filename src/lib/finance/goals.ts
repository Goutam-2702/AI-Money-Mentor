/**
 * Goal-Based Financial Planning Engine
 * Projects whether a user's current savings + SIP can meet each financial goal.
 */

import { sipFutureValue } from './xirr';

export interface Goal {
  title: string;
  targetAmount: number;    // ₹
  targetDate: string;      // ISO date string
  currentSaved: number;    // ₹ already saved for this goal
  monthlyContribution: number;
  priority: 'critical' | 'high' | 'medium' | 'low';
}

export interface GoalPlan {
  title: string;
  priority: string;
  targetAmount: number;
  currentSaved: number;
  projectedCorpus: number;
  shortfall: number;
  surplus: number;
  requiredMonthlySIP: number;
  monthsRemaining: number;
  onTrack: boolean;
  progressPercent: number;
  annualReturnUsed: number;
  suggestion: string;
}

const RETURN_RATES: Record<string, number> = {
  conservative: 0.07,  // FD/Debt fund
  moderate: 0.10,      // Balanced hybrid
  aggressive: 0.13,    // Pure equity
};

/**
 * Plan a single goal against current savings.
 */
export function planGoal(
  goal: Goal,
  riskAppetite: 'conservative' | 'moderate' | 'aggressive' = 'moderate'
): GoalPlan {
  const now = new Date();
  const targetDate = new Date(goal.targetDate);
  const monthsRemaining = Math.max(
    1,
    (targetDate.getFullYear() - now.getFullYear()) * 12 +
      (targetDate.getMonth() - now.getMonth())
  );
  const years = monthsRemaining / 12;
  const annualReturn = RETURN_RATES[riskAppetite];
  const r = annualReturn / 12;

  // FV of existing savings at target date
  const fvCurrentSavings = goal.currentSaved * Math.pow(1 + r, monthsRemaining);

  // FV of monthly contributions (SIP)
  const fvSIP = sipFutureValue(goal.monthlyContribution, annualReturn, years);

  const projectedCorpus = Math.round(fvCurrentSavings + fvSIP);
  const shortfall = Math.max(0, goal.targetAmount - projectedCorpus);
  const surplus = Math.max(0, projectedCorpus - goal.targetAmount);
  const onTrack = shortfall === 0;

  // Required SIP to make up the shortfall
  const requiredMonthlySIP =
    shortfall > 0
      ? Math.round(shortfall / (((Math.pow(1 + r, monthsRemaining) - 1) / r) * (1 + r)))
      : 0;

  const progressPercent = Math.min(
    100,
    Math.round((goal.currentSaved / goal.targetAmount) * 100)
  );

  let suggestion: string;
  if (onTrack) {
    suggestion = `✅ On track! Projected corpus of ₹${projectedCorpus.toLocaleString('en-IN')} exceeds your ₹${goal.targetAmount.toLocaleString('en-IN')} target.`;
  } else if (requiredMonthlySIP < 5000) {
    suggestion = `Increase monthly SIP by just ₹${requiredMonthlySIP.toLocaleString('en-IN')} to achieve ${goal.title} on time.`;
  } else if (monthsRemaining < 12) {
    suggestion = `Goal deadline is within 12 months — shift ${goal.title} funds to liquid/short-term debt funds immediately.`;
  } else {
    suggestion = `Start an additional SIP of ₹${requiredMonthlySIP.toLocaleString('en-IN')}/month in ${riskAppetite === 'conservative' ? 'debt' : 'equity'} funds for ${goal.title}.`;
  }

  return {
    title: goal.title,
    priority: goal.priority,
    targetAmount: goal.targetAmount,
    currentSaved: goal.currentSaved,
    projectedCorpus,
    shortfall,
    surplus,
    requiredMonthlySIP,
    monthsRemaining,
    onTrack,
    progressPercent,
    annualReturnUsed: annualReturn * 100,
    suggestion,
  };
}

/**
 * Plan all goals and return sorted by urgency.
 */
export function planAllGoals(
  goals: Goal[],
  riskAppetite: 'conservative' | 'moderate' | 'aggressive' = 'moderate'
): GoalPlan[] {
  const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };

  return goals
    .map((g) => planGoal(g, riskAppetite))
    .sort((a, b) => {
      // Sort by: not-on-track first, then priority, then months remaining
      if (a.onTrack !== b.onTrack) return a.onTrack ? 1 : -1;
      const pa = priorityOrder[a.priority as keyof typeof priorityOrder] ?? 99;
      const pb = priorityOrder[b.priority as keyof typeof priorityOrder] ?? 99;
      if (pa !== pb) return pa - pb;
      return a.monthsRemaining - b.monthsRemaining;
    });
}

/**
 * Total additional monthly SIP needed across all goals.
 */
export function totalGoalSIPRequired(plans: GoalPlan[]): number {
  return plans.reduce((sum, p) => sum + p.requiredMonthlySIP, 0);
}
