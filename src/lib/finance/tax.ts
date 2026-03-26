/**
 * India Tax Engine (FY 2024-25)
 * Implements exact Old and New Tax Regime slabs per the Finance Act 2023.
 * Source: Income Tax Act 1961 + Finance Act 2024 (Budget 2024)
 */

export interface TaxInput {
  annualIncome: number;         // Gross annual salary (₹)
  age: number;
  // Old Regime Deductions
  section80C: number;           // PF + ELSS + LIC + PPF + Home loan principal (max ₹1.5L)
  section80D: number;           // Medical insurance premium (max ₹25k self, ₹50k parents 60+)
  hra: number;                  // HRA exemption actually received
  lta: number;                  // LTA exemption
  homeLoanInterest: number;     // Section 24(b) — max ₹2L for self-occupied
  nps80CCD: number;             // 80CCD(1B) NPS contribution — max ₹50k
  standardDeduction: number;    // Fixed: ₹50,000 for salaried (old), ₹75,000 (new from FY25)
}

export interface TaxResult {
  regime: 'old' | 'new';
  grossIncome: number;
  totalDeductions: number;
  taxableIncome: number;
  baseTax: number;
  surcharge: number;
  educationCess: number;       // 4% on (tax + surcharge)
  totalTax: number;
  effectiveRate: number;       // %
  inHandMonthly: number;
}

export interface TaxComparisonResult {
  old: TaxResult;
  new: TaxResult;
  recommendation: 'old' | 'new';
  savedAmount: number;          // Positive = new regime saves, negative = old regime saves
  savedMonthly: number;
  reasoning: string;
  deductionsUtilized: {
    section80C: number;
    section80D: number;
    hra: number;
    lta: number;
    homeLoanInterest: number;
    nps80CCD: number;
    standardDeduction: number;
    total: number;
  };
}

// ─── OLD REGIME SLABS (FY 24-25) ──────────────────────────────────────────────
function oldRegimeTax(taxableIncome: number, age: number): number {
  let tax = 0;

  // Senior citizens (60–80): basic exemption ₹3L
  // Super seniors (80+): basic exemption ₹5L
  const exemptionLimit = age >= 80 ? 500000 : age >= 60 ? 300000 : 250000;

  if (taxableIncome <= exemptionLimit) return 0;

  const slabs =
    age >= 80
      ? [
          { upto: 500000, rate: 0 },
          { upto: 1000000, rate: 0.2 },
          { upto: Infinity, rate: 0.3 },
        ]
      : age >= 60
      ? [
          { upto: 300000, rate: 0 },
          { upto: 500000, rate: 0.05 },
          { upto: 1000000, rate: 0.2 },
          { upto: Infinity, rate: 0.3 },
        ]
      : [
          { upto: 250000, rate: 0 },
          { upto: 500000, rate: 0.05 },
          { upto: 1000000, rate: 0.2 },
          { upto: Infinity, rate: 0.3 },
        ];

  let prev = 0;
  for (const slab of slabs) {
    const upper = Math.min(taxableIncome, slab.upto);
    if (upper > prev) {
      tax += (upper - prev) * slab.rate;
      prev = upper;
    }
    if (taxableIncome <= slab.upto) break;
  }

  // Rebate u/s 87A: if taxable income ≤ ₹5L, rebate of tax (max ₹12,500)
  if (taxableIncome <= 500000) {
    tax = Math.max(0, tax - 12500);
  }

  return Math.round(tax);
}

// ─── NEW REGIME SLABS (FY 24-25, Budget 2024) ─────────────────────────────────
// Basic exemption ₹3L. Rebate 87A for income ≤ ₹7L → effectively zero tax.
function newRegimeTax(taxableIncome: number): number {
  const slabs = [
    { upto: 300000, rate: 0 },
    { upto: 600000, rate: 0.05 },
    { upto: 900000, rate: 0.1 },
    { upto: 1200000, rate: 0.15 },
    { upto: 1500000, rate: 0.2 },
    { upto: Infinity, rate: 0.3 },
  ];

  let tax = 0;
  let prev = 0;
  for (const slab of slabs) {
    const upper = Math.min(taxableIncome, slab.upto);
    if (upper > prev) {
      tax += (upper - prev) * slab.rate;
      prev = upper;
    }
    if (taxableIncome <= slab.upto) break;
  }

  // Rebate 87A: if taxable income ≤ ₹7L, full rebate (max ₹25,000)
  if (taxableIncome <= 700000) {
    tax = Math.max(0, tax - 25000);
  }

  return Math.round(tax);
}

function surchargeRate(taxableIncome: number): number {
  if (taxableIncome > 50000000) return 0.37; // ₹5Cr+
  if (taxableIncome > 20000000) return 0.25; // ₹2Cr+
  if (taxableIncome > 10000000) return 0.15; // ₹1Cr+
  if (taxableIncome > 5000000) return 0.1;   // ₹50L+
  return 0;
}

function buildResult(
  regime: 'old' | 'new',
  grossIncome: number,
  totalDeductions: number,
  age: number
): TaxResult {
  const taxableIncome = Math.max(0, grossIncome - totalDeductions);
  const baseTax =
    regime === 'old'
      ? oldRegimeTax(taxableIncome, age)
      : newRegimeTax(taxableIncome);

  const sr = surchargeRate(taxableIncome);
  const surcharge = Math.round(baseTax * sr);
  const educationCess = Math.round((baseTax + surcharge) * 0.04);
  const totalTax = baseTax + surcharge + educationCess;

  return {
    regime,
    grossIncome,
    totalDeductions,
    taxableIncome,
    baseTax,
    surcharge,
    educationCess,
    totalTax,
    effectiveRate: grossIncome > 0 ? parseFloat(((totalTax / grossIncome) * 100).toFixed(2)) : 0,
    inHandMonthly: Math.round((grossIncome - totalTax) / 12),
  };
}

export function compareTaxRegimes(input: TaxInput): TaxComparisonResult {
  // ── OLD REGIME ───────────────────────────────────────────────────
  const ded80C = Math.min(input.section80C, 150000);
  const ded80D = Math.min(input.section80D, input.age >= 60 ? 100000 : 50000); // self+parents
  const dedHRA = Math.min(input.hra, input.annualIncome * 0.5);  // rough cap
  const dedLTA = Math.min(input.lta, 30000);
  const dedHomeLoan = Math.min(input.homeLoanInterest, 200000);
  const dedNPS = Math.min(input.nps80CCD, 50000);
  const stdDedOld = 50000;

  const oldTotalDeductions =
    ded80C + ded80D + dedHRA + dedLTA + dedHomeLoan + dedNPS + stdDedOld;

  const oldResult = buildResult('old', input.annualIncome, oldTotalDeductions, input.age);

  // ── NEW REGIME ───────────────────────────────────────────────────
  // Only standard deduction of ₹75,000 allowed from FY 2024-25
  const newTotalDeductions = 75000;
  const newResult = buildResult('new', input.annualIncome, newTotalDeductions, input.age);

  // ── COMPARISON ───────────────────────────────────────────────────
  const savedAmount = oldResult.totalTax - newResult.totalTax; // +ve means new saves money
  const recommendation: 'old' | 'new' = savedAmount >= 0 ? 'new' : 'old';

  let reasoning: string;
  if (recommendation === 'new') {
    reasoning = `New Tax Regime saves you ₹${savedAmount.toLocaleString('en-IN')} (₹${Math.round(savedAmount/12).toLocaleString('en-IN')}/month). Your deductions of ₹${oldTotalDeductions.toLocaleString('en-IN')} are insufficient to overcome the lower slab rates in the New Regime.`;
  } else {
    const savingsInOld = Math.abs(savedAmount);
    reasoning = `Old Tax Regime saves you ₹${savingsInOld.toLocaleString('en-IN')} (₹${Math.round(savingsInOld/12).toLocaleString('en-IN')}/month). Your deductions of ₹${oldTotalDeductions.toLocaleString('en-IN')} (80C + HRA + Home Loan) make the Old Regime significantly more beneficial.`;
  }

  return {
    old: oldResult,
    new: newResult,
    recommendation,
    savedAmount: Math.abs(savedAmount),
    savedMonthly: Math.round(Math.abs(savedAmount) / 12),
    reasoning,
    deductionsUtilized: {
      section80C: ded80C,
      section80D: ded80D,
      hra: dedHRA,
      lta: dedLTA,
      homeLoanInterest: dedHomeLoan,
      nps80CCD: dedNPS,
      standardDeduction: stdDedOld,
      total: oldTotalDeductions,
    },
  };
}

/**
 * Estimates tax input from basic profile data (when Form 16 is not available).
 * Uses heuristics to estimate common deductions.
 */
export function estimateTaxInput(
  annualIncome: number,
  age: number,
  monthlyExpenses: number,
  loans: number
): TaxInput {
  // Heuristic: assume salaried employee with basic deductions
  const estimatedRent = monthlyExpenses * 0.3 * 12; // ~30% on rent
  const estimatedPF = Math.min(annualIncome * 0.12, 150000); // 12% PF up to ₹1.5L
  const estimatedLIC = 10000;
  const estimatedELSS = 25000;
  const section80C = Math.min(estimatedPF + estimatedLIC + estimatedELSS, 150000);

  const homeLoanInterest = loans > 0 ? Math.min(loans * 0.08, 200000) : 0; // ~8% interest

  return {
    annualIncome,
    age,
    section80C,
    section80D: 25000,
    hra: Math.min(estimatedRent, annualIncome * 0.4),
    lta: 10000,
    homeLoanInterest,
    nps80CCD: 0,
    standardDeduction: 50000,
  };
}
