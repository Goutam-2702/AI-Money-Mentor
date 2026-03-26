import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import dbConnect from '@/lib/db';
import { UserFinance } from '@/models/UserFinance';
import { getStructuredAdvice } from '@/lib/ai';
import { calculateWealthAndRetirement } from '@/lib/finance/fire';
import { compareTaxRegimes, estimateTaxInput } from '@/lib/finance/tax';
import { analyzePortfolio } from '@/lib/finance/portfolio';
import { runRuleEngine } from '@/lib/finance/rules';
import { planAllGoals, totalGoalSIPRequired } from '@/lib/finance/goals';
import { calculateProfileCompleteness } from '@/lib/finance/confidence';
import { FinancialProfileInput, parseOrError } from '@/lib/schemas';
import { logger } from '@/lib/logger';

export async function POST(req: Request) {
  const start = Date.now();
  const reqId = Math.random().toString(36).slice(2, 8);
  const log = logger.child({ requestId: reqId, action: 'analyze' });

  try {
    // ── Parse & Validate ────────────────────────────────────────────────────
    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ success: false, error: 'Invalid JSON body.' }, { status: 400 });
    }

    const parsed = parseOrError(FinancialProfileInput, body);
    if (!parsed.success) return parsed.response;

    const input = parsed.data;
    const { age, income, expenses, savings, loans, investments, goals,
            riskAppetite = 'moderate', fundIds, goalsList, _form16 } = input;

    log.info({ age, income: `₹${income}`, expenses: `₹${expenses}` }, 'Analysis started');

    // ── 1. Profile completeness & confidence baseline ────────────────────────
    const profileCompleteness = calculateProfileCompleteness({
      age, income, expenses, savings, loans,
      riskAppetite,
      hasTermInsurance: input.hasTermInsurance,
      hasHealthInsurance: input.hasHealthInsurance,
      employmentType: input.employmentType,
      city: input.city,
    });

    const dataSource = _form16 ? 'form16' : 'user_input';

    // ── 2. Rule Engine (health scores + recommendations) ────────────────────
    const monthlySIPEstimate = /sip|elss|mutual|equity/i.test(investments)
      ? income * 0.12 : 0;
    const emiEstimate = input.monthlyEMI ?? (loans > 0 ? Math.round(loans * 0.009) : 0);

    const ruleOutput = runRuleEngine({
      age,
      annualIncome: income * 12,
      monthlyIncome: income,
      monthlyExpenses: expenses,
      totalSavings: savings,
      totalLoans: loans,
      monthlyEMI: emiEstimate,
      monthlySIP: monthlySIPEstimate,
      hasTermInsurance: input.hasTermInsurance ?? /term|lic|life.*insurance/i.test(investments),
      hasHealthInsurance: input.hasHealthInsurance ?? /health|mediclaim/i.test(investments),
      has80CInvestments: /80c|elss|ppf|pf|provident/i.test(investments + goals),
      portfolioDiversificationScore: 65,
    });

    // ── 3. Tax Engine ───────────────────────────────────────────────────────
    const taxInput = _form16
      ? {
          annualIncome: _form16.grossSalary ?? income * 12,
          age,
          section80C: Math.min(_form16.section80C ?? 0, 150000),
          section80D: Math.min(_form16.section80D ?? 25000, 100000),
          hra: _form16.hra ?? 0,
          lta: 10000,
          homeLoanInterest: Math.min(_form16.homeLoanInterest ?? 0, 200000),
          nps80CCD: 0,
          standardDeduction: 50000,
        }
      : estimateTaxInput(income * 12, age, expenses, loans);

    const taxComparison = compareTaxRegimes(taxInput);

    // ── 4. Portfolio Analysis ───────────────────────────────────────────────
    const portfolioFundIds = fundIds ?? ['sbi_nifty_50_index', 'parag_parikh_flexi', 'axis_bluechip'];
    const portfolioAnalysis = analyzePortfolio(portfolioFundIds);

    // ── 5. FIRE & Wealth Projections ────────────────────────────────────────
    const investableSurplus = Math.max(0, income - expenses - emiEstimate);
    const optimizedSIP = Math.round(investableSurplus * 0.7 / 1000) * 1000;
    const wealthAndRetirement = calculateWealthAndRetirement(
      age, savings, expenses, monthlySIPEstimate, Math.max(monthlySIPEstimate, optimizedSIP)
    );

    // ── 6. Goal Planning ────────────────────────────────────────────────────
    const goalsToAnalyze = goalsList?.map((g) => ({
      ...g,
      monthlyContribution: Math.round(investableSurplus * 0.3 / Math.max(1, (goalsList?.length ?? 1))),
    })) ?? [];
    const goalPlans = planAllGoals(goalsToAnalyze, riskAppetite);
    const totalGoalSIP = totalGoalSIPRequired(goalPlans);

    // ── 7. Structured AI Advice ─────────────────────────────────────────────
    const savingsRate = income > 0
      ? parseFloat(((income - expenses) / income * 100).toFixed(1)) : 0;
    const emergencyMonths = expenses > 0
      ? parseFloat((savings / expenses).toFixed(1)) : 0;

    const aiMetrics = {
      overallScore: ruleOutput.healthScoreComponents.overall,
      savingsRate,
      emergencyMonths,
      debtToIncomeRatio: income > 0 ? parseFloat((emiEstimate / income * 100).toFixed(1)) : 0,
      taxRegimeRecommendation: taxComparison.recommendation,
      taxSavingAmount: taxComparison.savedAmount,
      shockInsights: ruleOutput.shockInsights,
      goals,
      profileCompleteness,
    };
    const aiAdvice = await getStructuredAdvice(aiMetrics);

    // Merge AI recommendations into rule engine ones (AI may have extra insight)
    const mergedRecs = [
      ...ruleOutput.recommendations,
      // Add AI recs that don't overlap by ID
      ...(aiAdvice.recommendations ?? []).filter(
        (ar) => !ruleOutput.recommendations.find((r) => r.id === ar.id)
      ),
    ].slice(0, 8);

    // ── 8. Compose Response ─────────────────────────────────────────────────
    const responseData = {
      // Multi-dimensional health scores
      score: ruleOutput.healthScoreComponents,

      // Tax analysis
      taxComparison,

      // FIRE & Wealth
      wealth_projection: wealthAndRetirement.wealth_projection,
      retirement_comparison: wealthAndRetirement.retirement_comparison,

      // Goals
      goalPlans,
      totalGoalSIPRequired: totalGoalSIP,

      // Recommendations (merged rule + AI)
      recommendations: mergedRecs,
      shockInsights: ruleOutput.shockInsights,
      quickAction: ruleOutput.quickAction,

      // Portfolio X-Ray
      portfolioAnalysis,

      // AI Advice (structured)
      aiAdvice,

      // Breakdowns
      breakdown: {
        savingsRate,
        emergencyMonths,
        investableSurplus,
        optimizedSIP,
        profileCompleteness,
        dataSource,
      },
    };

    // ── 9. Persist to DB ────────────────────────────────────────────────────
    let savedId: string | null = null;
    try {
      await dbConnect();
      if (mongoose.connection?.readyState === 1) {
        const rec = await UserFinance.create({
          age, income, expenses, savings, investments, loans, goals,
          score: ruleOutput.healthScoreComponents.overall,
          ai_summary: aiAdvice.summary,
          insights: mergedRecs.map((r) => r.insight ?? r.title),
          monthly_plan: mergedRecs.map((r) => r.action ?? ''),
        });
        savedId = rec._id?.toString() ?? null;
      }
    } catch (dbErr) {
      log.warn({ err: dbErr }, 'DB save skipped');
    }

    log.info({ duration: `${Date.now() - start}ms`, score: ruleOutput.healthScoreComponents.overall }, 'Analysis complete');

    return NextResponse.json({ success: true, data: responseData, savedId });

  } catch (error: any) {
    log.error({ err: error.message, stack: error.stack?.slice(0, 500) }, 'Unhandled error in /api/analyze');
    return NextResponse.json(
      { success: false, error: 'Internal server error. Please try again.' },
      { status: 500 }
    );
  }
}
