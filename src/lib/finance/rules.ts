/**
 * Rule-Based Financial Recommendation Engine
 * IF-THEN rules for actionable, quantified financial insights.
 * All monetary thresholds are India-specific (₹).
 */

export interface UserProfile {
  age: number;
  annualIncome: number;       // ₹
  monthlyIncome: number;      // ₹
  monthlyExpenses: number;    // ₹
  totalSavings: number;       // ₹ (liquid/emergency)
  totalLoans: number;         // ₹ outstanding principal
  monthlyEMI?: number;        // ₹
  monthlySIP?: number;        // ₹
  hasTermInsurance?: boolean;
  hasHealthInsurance?: boolean;
  has80CInvestments?: boolean;
  taxRegimeRecommendation?: 'old' | 'new';
  taxSavingAmount?: number;   // ₹ annual
  portfolioDiversificationScore?: number; // 0-100
}

export type RecommendationSeverity = 'critical' | 'high' | 'medium' | 'low';
export type RecommendationCategory =
  | 'emergency_fund'
  | 'insurance'
  | 'tax'
  | 'debt'
  | 'investment'
  | 'retirement'
  | 'cashflow';

export interface Recommendation {
  id: string;
  category: RecommendationCategory;
  severity: RecommendationSeverity;
  title: string;
  insight: string;          // 1-sentence WhatsApp-style insight
  detail: string;           // full explanation with ₹ numbers
  action: string;           // exact step to take
  estimatedImpact: string;  // quantified outcome
  safetyScore: number;      // 0-100 (how safe the recommendation is)
  growthScore: number;      // 0-100 (growth potential)
}

export interface RuleEngineOutput {
  recommendations: Recommendation[];
  healthScoreComponents: {
    emergency: number;
    insurance: number;
    debt: number;
    tax: number;
    investments: number;
    retirement: number;
    overall: number;
  };
  shockInsights: string[];
  quickAction: string;      // One-sentence for WhatsApp bubble
}

// ─── SCORING HELPERS ──────────────────────────────────────────────────────────
function clamp(val: number, min = 0, max = 100) {
  return Math.max(min, Math.min(max, val));
}

function fmt(n: number) {
  return `₹${n.toLocaleString('en-IN')}`;
}

// ─── RULE ENGINE ─────────────────────────────────────────────────────────────
export function runRuleEngine(profile: UserProfile): RuleEngineOutput {
  const recommendations: Recommendation[] = [];
  const shockInsights: string[] = [];

  const {
    age,
    annualIncome,
    monthlyIncome,
    monthlyExpenses,
    totalSavings,
    totalLoans,
    monthlyEMI = 0,
    monthlySIP = 0,
    hasTermInsurance = false,
    hasHealthInsurance = false,
    has80CInvestments = false,
    taxRegimeRecommendation,
    taxSavingAmount = 0,
    portfolioDiversificationScore = 70,
  } = profile;

  const investableSurplus = monthlyIncome - monthlyExpenses - monthlyEMI;
  const savingsRate = monthlyIncome > 0 ? ((monthlyIncome - monthlyExpenses) / monthlyIncome) * 100 : 0;
  const emergencyTarget = monthlyExpenses * 6;
  const emergencyMonths = monthlyExpenses > 0 ? totalSavings / monthlyExpenses : 0;
  const debtToIncomeRatio = monthlyIncome > 0 ? monthlyEMI / monthlyIncome : 0;

  // ─── SCORING ───────────────────────────────────────────────────────────────
  const emergencyScore = clamp(
    emergencyMonths >= 6 ? 100 :
    emergencyMonths >= 3 ? 60 :
    emergencyMonths >= 1 ? 30 : 10
  );

  const insuranceScore = clamp(
    (hasTermInsurance ? 50 : 0) + (hasHealthInsurance ? 50 : 0)
  );

  const debtScore = clamp(
    debtToIncomeRatio === 0 ? 100 :
    debtToIncomeRatio <= 0.2 ? 85 :
    debtToIncomeRatio <= 0.35 ? 60 :
    debtToIncomeRatio <= 0.5 ? 35 : 10
  );

  const taxScore = clamp(
    taxRegimeRecommendation && taxSavingAmount === 0 ? 80 : // Already optimal
    taxSavingAmount > 0 ? Math.max(20, 80 - Math.round(taxSavingAmount / 1000)) : // Penalty based on missed saving
    60
  );

  const investmentScore = clamp(
    savingsRate >= 30 ? 100 :
    savingsRate >= 20 ? 75 :
    savingsRate >= 10 ? 50 :
    savingsRate >= 5 ? 25 : 10
  );

  const retirementScore = clamp(
    age < 30 && monthlySIP > 0 ? 80 :
    age < 40 && monthlySIP > monthlyIncome * 0.15 ? 75 :
    age >= 40 && age < 50 && monthlySIP > monthlyIncome * 0.2 ? 70 :
    age >= 50 ? 60 : 30
  );

  const overall = clamp(
    Math.round(
      emergencyScore * 0.2 +
      insuranceScore * 0.15 +
      debtScore * 0.2 +
      taxScore * 0.15 +
      investmentScore * 0.2 +
      retirementScore * 0.1
    )
  );

  // ─── RULE 1: Emergency Fund ────────────────────────────────────────────────
  if (emergencyMonths < 6) {
    const shortfall = Math.round(emergencyTarget - totalSavings);
    const monthsToGoal =
      investableSurplus > 0 ? Math.ceil(shortfall / investableSurplus) : 99;

    const rule: Recommendation = {
      id: 'emergency_fund_build',
      category: 'emergency_fund',
      severity: emergencyMonths < 1 ? 'critical' : emergencyMonths < 3 ? 'high' : 'medium',
      title: 'Build Emergency Fund to 6 Months',
      insight: `You need ${fmt(shortfall)} more to reach your 6-month emergency buffer of ${fmt(emergencyTarget)}.`,
      detail: `Your emergency fund covers ${emergencyMonths.toFixed(1)} months of expenses. The 6-month target (${fmt(emergencyTarget)}) provides protection against job loss, medical emergencies, and market downturns. You have ${fmt(totalSavings)} saved.`,
      action: `Redirect ${fmt(Math.min(investableSurplus * 0.5, shortfall))} this month into a liquid mutual fund (e.g., SBI Liquid Fund) or a high-interest savings account (7%+ p.a.).`,
      estimatedImpact: monthsToGoal < 99
        ? `Emergency fund fully funded in ~${monthsToGoal} months.`
        : 'Increase monthly surplus to accelerate this goal.',
      safetyScore: 100,
      growthScore: 20,
    };
    recommendations.push(rule);

    if (emergencyMonths < 1) {
      shockInsights.push(
        `CRITICAL: You have less than 1 month of emergency cover. A single unexpected expense could force you into high-interest debt.`
      );
    }
  }

  // ─── RULE 2: Term Insurance ────────────────────────────────────────────────
  if (!hasTermInsurance && annualIncome > 300000) {
    const coverRecommended = annualIncome * 15;
    const estimatedPremium = Math.round(coverRecommended * 0.0004); // ~0.04% of cover for 30-yr-old
    recommendations.push({
      id: 'term_insurance',
      category: 'insurance',
      severity: 'critical',
      title: 'Get ₹1Cr+ Term Life Cover Immediately',
      insight: `You have no term insurance — your family has zero financial protection against an income shock.`,
      detail: `For your income of ${fmt(annualIncome)}/year, you need a cover of ${fmt(coverRecommended)} (15x annual income rule). Without this, your dependents are at severe financial risk.`,
      action: `Buy a pure term plan (₹${Math.round(coverRecommended / 10000000)}Cr cover, 30-year term) on PolicyBazaar or directly from LIC/HDFC Life. Estimated annual premium: ~${fmt(estimatedPremium)}.`,
      estimatedImpact: `Family protected with ${fmt(coverRecommended)} cover for ~${fmt(estimatedPremium)}/year.`,
      safetyScore: 100,
      growthScore: 0,
    });
    shockInsights.push(`You have no term insurance. A premature death would leave your dependents with ZERO income replacement.`);
  }

  // ─── RULE 3: Health Insurance ─────────────────────────────────────────────
  if (!hasHealthInsurance) {
    recommendations.push({
      id: 'health_insurance',
      category: 'insurance',
      severity: 'high',
      title: 'Get Health Insurance (₹10L+ Cover)',
      insight: `No health insurance detected. A single hospitalisation can wipe out years of savings.`,
      detail: `Medical inflation in India runs at 14%+ p.a. A ₹5L cover bought today will effectively cover only ₹1.2L of real costs in 10 years.`,
      action: `Buy a ₹10L family floater plan (e.g., Niva Bupa or ICICI Lombard). Annual premium ~₹12,000–18,000 for a family of 3.`,
      estimatedImpact: `Savings protected from medical catastrophe risk. Also qualifies for 80D deduction (saves ~₹7,500 in tax).`,
      safetyScore: 100,
      growthScore: 0,
    });
  }

  // ─── RULE 4: Tax Regime Switch ─────────────────────────────────────────────
  if (taxSavingAmount > 10000) {
    recommendations.push({
      id: 'tax_regime_switch',
      category: 'tax',
      severity: taxSavingAmount > 50000 ? 'high' : 'medium',
      title: `Switch to ${taxRegimeRecommendation === 'new' ? 'New' : 'Old'} Tax Regime`,
      insight: `You can save ${fmt(taxSavingAmount)} this year (${fmt(Math.round(taxSavingAmount / 12))}/month) by switching to the ${taxRegimeRecommendation === 'new' ? 'New' : 'Old'} Tax Regime.`,
      detail: `Current tax regime is not optimal for your income and deduction profile. Switching to the ${taxRegimeRecommendation} regime will reduce your annual tax liability by ${fmt(taxSavingAmount)}.`,
      action: `Submit a declaration to your employer to switch regime for next FY. File ITR under the ${taxRegimeRecommendation} regime this June.`,
      estimatedImpact: `Net take-home increases by ${fmt(Math.round(taxSavingAmount / 12))}/month.`,
      safetyScore: 90,
      growthScore: 40,
    });
  }

  // ─── RULE 5: 80C Maximization ─────────────────────────────────────────────
  if (!has80CInvestments && annualIncome > 500000) {
    const taxBenefit = Math.round(150000 * 0.3); // 30% slab saving
    recommendations.push({
      id: 'section_80c',
      category: 'tax',
      severity: 'high',
      title: 'Maximize Section 80C (Save ₹46,800 in Tax)',
      insight: `You are not using Section 80C. You are leaving ${fmt(taxBenefit)} of tax savings on the table.`,
      detail: `Section 80C allows deduction up to ₹1.5L/year. At 30% tax slab, this saves ₹46,800 in tax (including 4% cess). ELSS funds give both 80C deduction and ~15% CAGR growth potential.`,
      action: `Start ELSS SIP of ₹12,500/month in Axis ELSS or Mirae ELSS. This will fill your ₹1.5L 80C limit by March.`,
      estimatedImpact: `Annual tax saving: ${fmt(taxBenefit)}. Additionally, ELSS compounds at ~12-15% CAGR vs. PPF's 7.1%.`,
      safetyScore: 70,
      growthScore: 75,
    });
  }

  // ─── RULE 6: High Debt Load ────────────────────────────────────────────────
  if (debtToIncomeRatio > 0.4) {
    const annualInterestCost = Math.round(totalLoans * 0.12); // Assume avg 12% rate
    recommendations.push({
      id: 'high_debt_reduction',
      category: 'debt',
      severity: 'critical',
      title: 'Debt EMI Exceeds Safe Threshold (40% of income)',
      insight: `Your EMIs consume ${(debtToIncomeRatio * 100).toFixed(0)}% of income — above the 40% danger threshold.`,
      detail: `High debt ratios compress your investable surplus and expose you to financial stress if income drops. You are paying ~${fmt(annualInterestCost)} in interest per year.`,
      action: `List all loans by interest rate. Pre-pay the highest interest rate loan (likely personal loan or credit card) first. Even ${fmt(5000)}/month extra reduces ${fmt(5000 * 12 / 0.14)}-worth of debt faster.`,
      estimatedImpact: `Reducing EMI burden by 10% frees ${fmt(Math.round(monthlyIncome * 0.1))}/month for investment.`,
      safetyScore: 95,
      growthScore: 50,
    });
    shockInsights.push(
      `Your debt-to-income ratio is ${(debtToIncomeRatio * 100).toFixed(0)}%. At this level, any income disruption could lead to EMI defaults.`
    );
  }

  // ─── RULE 7: Under-Investing ───────────────────────────────────────────────
  const recommendedSIP = Math.round(investableSurplus * 0.7 / 1000) * 1000;
  if (investableSurplus > 5000 && monthlySIP < recommendedSIP) {
    const sipGap = recommendedSIP - monthlySIP;
    const wealthIn20Y = Math.round(sipGap * 12 * ((Math.pow(1.12, 20) - 1) / 0.12));
    recommendations.push({
      id: 'increase_sip',
      category: 'investment',
      severity: monthlySIP === 0 ? 'high' : 'medium',
      title: `${monthlySIP === 0 ? 'Start' : 'Increase'} Monthly SIP by ${fmt(sipGap)}`,
      insight: `Investing ${fmt(sipGap)} more per month creates ${fmt(wealthIn20Y)} in wealth over 20 years at 12% CAGR.`,
      detail: `You have an investable surplus of ${fmt(investableSurplus)}/month after expenses but only invest ${fmt(monthlySIP)} in SIPs. Capital compounding requires consistency — the earlier you start, the more powerful.`,
      action: `Set up a ${fmt(recommendedSIP)} SIP in Parag Parikh Flexi Cap + Nifty 50 Index split (60/40) starting next month.`,
      estimatedImpact: `${fmt(wealthIn20Y)} additional corpus in 20 years.`,
      safetyScore: 65,
      growthScore: 90,
    });
  }

  // ─── RULE 8: FIRE Age Feasibility ─────────────────────────────────────────
  if (age < 45 && savingsRate < 20) {
    shockInsights.push(
      `With a ${savingsRate.toFixed(0)}% savings rate, your FIRE target is unrealistic. You need at least 35–40% savings rate to retire before 50.`
    );
  }

  // ─── RULE 9: Portfolio Diversification ────────────────────────────────────
  if (portfolioDiversificationScore < 60) {
    recommendations.push({
      id: 'diversify_portfolio',
      category: 'investment',
      severity: 'medium',
      title: 'Your Portfolio Has Dangerous Concentration Risk',
      insight: `Portfolio diversification score is ${portfolioDiversificationScore}/100 — high overlap detected across your mutual funds.`,
      detail: `Multiple funds in your portfolio invest in the same top-20 stocks. This means you are paying multiple expense ratios for the same market exposure, defeating the purpose of diversification.`,
      action: `Consolidate to 2-3 non-overlapping funds: 1 Index Fund (Nifty 50) + 1 Flexi Cap + 1 International Fund.`,
      estimatedImpact: `Reduce expense ratio drag by ~1%/year, compounding to ${fmt(100000 * Math.pow(1.01, 20) - 100000)} in savings over 20 years on ₹1L invested.`,
      safetyScore: 75,
      growthScore: 70,
    });
  }

  // ─── QUICK ACTION (WhatsApp bubble) ───────────────────────────────────────
  const topRec = recommendations.sort((a, b) => {
    const order = { critical: 0, high: 1, medium: 2, low: 3 };
    return order[a.severity] - order[b.severity];
  })[0];

  const quickAction = topRec ? topRec.insight : `Your finances look healthy! Consider maximizing your NPS Tier-II for additional ${fmt(50000)} 80CCD deduction.`;

  return {
    recommendations,
    healthScoreComponents: {
      emergency: emergencyScore,
      insurance: insuranceScore,
      debt: debtScore,
      tax: taxScore,
      investments: investmentScore,
      retirement: retirementScore,
      overall,
    },
    shockInsights,
    quickAction,
  };
}
