import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import dbConnect from '@/lib/db';
import { UserFinance } from '@/models/UserFinance';
import { getFinancialSummary } from '@/lib/ai';
import { calculateWealthAndRetirement } from '@/lib/finance/fire';
import { compareTaxRegimes, estimateTaxInput } from '@/lib/finance/tax';
import { analyzePortfolio } from '@/lib/finance/portfolio';
import { runRuleEngine } from '@/lib/finance/rules';
import { validateFinancialProfile, sanitizeInput } from '@/lib/validation';

// Rate limiting (simple in-memory, per-deployment)
const ipRequestMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT = 10;
const RATE_WINDOW_MS = 60 * 1000; // 1 minute

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = ipRequestMap.get(ip);
  if (!entry || entry.resetAt < now) {
    ipRequestMap.set(ip, { count: 1, resetAt: now + RATE_WINDOW_MS });
    return true;
  }
  if (entry.count >= RATE_LIMIT) return false;
  entry.count++;
  return true;
}

export async function POST(req: Request) {
  try {
    // ── Rate limiting ────────────────────────────────────────────────────────
    const forwarded = req.headers.get('x-forwarded-for');
    const ip = forwarded ? forwarded.split(',')[0].trim() : 'unknown';
    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        { success: false, error: 'Too many requests. Please wait 1 minute.' },
        { status: 429 }
      );
    }

    // ── Parse & Validate Input ───────────────────────────────────────────────
    let body: Record<string, any>;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        { success: false, error: 'Invalid JSON body.' },
        { status: 400 }
      );
    }

    const validation = validateFinancialProfile(body);
    if (!validation.valid) {
      return NextResponse.json(
        { success: false, error: 'Validation failed.', fieldErrors: validation.errors },
        { status: 422 }
      );
    }

    const { age, income, expenses, savings, loans, investments, goals } =
      sanitizeInput(body);

    // ── 1. Rule Engine + Comprehensive Health Scoring ────────────────────────
    // Derive quick estimates from text for rule engine
    const hasSIPKeywords = /sip|mutual|equity|elss|index/i.test(investments);
    const hasFDKeywords = /fd|fixed deposit|ppf|nps|gold/i.test(investments);
    const monthlySIPEstimate = hasSIPKeywords ? income * 0.1 : 0;

    const ruleOutput = runRuleEngine({
      age,
      annualIncome: income * 12,
      monthlyIncome: income,
      monthlyExpenses: expenses,
      totalSavings: savings,
      totalLoans: loans,
      monthlyEMI: loans > 0 ? Math.round(loans * 0.009) : 0, // ~0.9% of outstanding/month estimate
      monthlySIP: monthlySIPEstimate,
      hasTermInsurance: /term|life insurance|lic/i.test(investments),
      hasHealthInsurance: /health|mediclaim/i.test(investments),
      has80CInvestments: /80c|elss|ppf|nps|pf|provident/i.test(investments + goals),
      portfolioDiversificationScore: 65, // Default until portfolio IDs provided
    });

    // ── 2. Indian Tax Regime Comparison Engine ───────────────────────────────
    const taxInput = estimateTaxInput(income * 12, age, expenses, loans);
    const taxComparison = compareTaxRegimes(taxInput);

    // Update rule engine's tax recommendation with real calculated figure
    const taxSavingAmount = taxComparison.savedAmount;
    const taxRec = ruleOutput.recommendations.find(r => r.id === 'tax_regime_switch');
    if (!taxRec && taxSavingAmount > 10000) {
      ruleOutput.recommendations.push({
        id: 'tax_regime_switch',
        category: 'tax',
        severity: taxSavingAmount > 50000 ? 'high' : 'medium',
        title: `Switch to ${taxComparison.recommendation === 'new' ? 'New' : 'Old'} Tax Regime`,
        insight: `You can save ₹${taxSavingAmount.toLocaleString('en-IN')} (₹${taxComparison.savedMonthly.toLocaleString('en-IN')}/month) by switching to the ${taxComparison.recommendation} regime.`,
        detail: taxComparison.reasoning,
        action: `Submit Form 12BB declaring your regime preference to your employer before April 1.`,
        estimatedImpact: `In-hand salary increases by ₹${taxComparison.savedMonthly.toLocaleString('en-IN')}/month.`,
        safetyScore: 90,
        growthScore: 40,
      });
    }

    // ── 3. FIRE & Wealth Projection Engine ───────────────────────────────────
    const currentSIP = monthlySIPEstimate;
    const investableSurplus = Math.max(0, income - expenses);
    const optimizedSIP = Math.round(investableSurplus * 0.7 / 1000) * 1000;

    const wealthAndRetirement = calculateWealthAndRetirement(
      age,
      savings,
      expenses,
      currentSIP,
      Math.max(currentSIP, optimizedSIP)
    );

    // ── 4. Portfolio X-Ray ────────────────────────────────────────────────────
    // Parse fund IDs from request body (optional param from future portfolio input)
    const fundIds: string[] = (body.fundIds as string[]) || [
      'sbi_nifty_50_index',
      'parag_parikh_flexi',
      'axis_bluechip',
    ];
    const portfolioAnalysis = analyzePortfolio(fundIds);

    // ── 5. AI Summary (no calculations, just commentary) ─────────────────────
    const aiPayload = {
      overallScore: ruleOutput.healthScoreComponents.overall,
      savingsRate: income > 0 ? (((income - expenses) / income) * 100).toFixed(1) : 0,
      emergencyMonths: expenses > 0 ? (savings / expenses).toFixed(1) : 0,
      topThreats: ruleOutput.shockInsights.slice(0, 2),
      taxRegimeRecommendation: taxComparison.recommendation,
      taxSavingAmount,
      goals,
    };
    const aiSummary = await getFinancialSummary(aiPayload);

    // ── 6. Compose Final Response ─────────────────────────────────────────────
    const responseData = {
      // Health Scores (multi-dimensional)
      score: ruleOutput.healthScoreComponents,

      // Tax Analysis
      taxComparison,

      // FIRE & Wealth Projections
      wealth_projection: wealthAndRetirement.wealth_projection,
      retirement_comparison: wealthAndRetirement.retirement_comparison,

      // Recommendations (rule-based, sorted by severity)
      recommendations: ruleOutput.recommendations,
      shockInsights: ruleOutput.shockInsights,
      quickAction: ruleOutput.quickAction,

      // Portfolio X-Ray
      portfolioAnalysis,

      // AI Mentor Summary
      aiSummary,

      // Raw breakdowns for UI
      breakdown: {
        savingsRate: income > 0 ? parseFloat(((income - expenses) / income * 100).toFixed(1)) : 0,
        emergencyMonths: expenses > 0 ? parseFloat((savings / expenses).toFixed(1)) : 0,
        investableSurplus,
        optimizedSIP,
      },
    };

    // ── 7. Persist to DB (non-blocking) ──────────────────────────────────────
    let savedId: string | null = null;
    try {
      await dbConnect();
      if (mongoose.connection?.readyState === 1) {
        const record = await UserFinance.create({
          age, income, expenses, savings, investments, loans, goals,
          score: ruleOutput.healthScoreComponents.overall,
          ai_summary: aiSummary ?? '',
          insights: ruleOutput.recommendations.map(r => r.insight),
          monthly_plan: ruleOutput.recommendations.map(r => r.action),
        });
        savedId = record._id?.toString() ?? null;
      }
    } catch (dbErr) {
      console.warn('[DB] Continuing without save:', (dbErr as Error).message);
    }

    return NextResponse.json({ success: true, data: responseData, savedId });

  } catch (error: any) {
    console.error('[/api/analyze] Unhandled error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error. Please try again.' },
      { status: 500 }
    );
  }
}
