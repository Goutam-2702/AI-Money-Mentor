import Anthropic from '@anthropic-ai/sdk';
import OpenAI from 'openai';
import { withCache, TTL } from './cache';
import { logger } from './logger';

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY ?? 'dummy' });
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY ?? 'dummy' });

const useAnthropic = !!process.env.ANTHROPIC_API_KEY;
const useOpenAI = !!process.env.OPENAI_API_KEY;

// ── System Prompt ─────────────────────────────────────────────────────────────
const SYSTEM_PROMPT = `You are a SEBI-registered senior financial advisor (IA Registration No. INA000000000) specializing in Indian personal finance for FY 2025-26.

STRICT RULES:
1. All advice must cite specific Indian regulations: Income Tax Act sections, SEBI circulars, AMFI guidelines, or Finance Act provisions.
2. Never guarantee specific investment returns. Use ranges: "historically 10-13% CAGR for diversified equity funds".
3. Always distinguish between rule-based facts (tax calculations) and projections (market returns).
4. Output MUST be valid JSON only. No markdown. No preamble. Start with { and end with }.

OUTPUT SCHEMA (return exactly this structure):
{
  "summary": "2-3 sentence overall assessment. Professional tone, direct, data-driven.",
  "keyInsight": "Single most important actionable insight in 1 sentence.",
  "taxVerdict": "Specific tax regime recommendation with exact ₹ impact.",
  "recommendations": [
    {
      "id": "string",
      "title": "string",
      "insight": "1 sentence — WhatsApp-style urgency. Include ₹ numbers.",
      "detail": "2-3 sentences explaining the reasoning with citations.",
      "action": "Exact step: platform/fund name, ₹ amount, deadline.",
      "impact": "Quantified outcome: ₹X saved/gained over Y years.",
      "citation": "Income Tax Act Section XX | AMFI | SEBI Circular | Finance Act 2024",
      "confidence": 0,
      "safetyScore": 0,
      "growthScore": 0
    }
  ],
  "redFlags": ["string — critical risk in 1 sentence"],
  "monthlyChecklist": ["string — exact action this month"]
}`;

// ── Structured AI call ────────────────────────────────────────────────────────
export interface AIAdviceOutput {
  summary: string;
  keyInsight: string;
  taxVerdict: string;
  recommendations: Array<{
    id: string;
    title: string;
    insight: string;
    detail: string;
    action: string;
    impact: string;
    citation: string;
    confidence: number;
    safetyScore: number;
    growthScore: number;
  }>;
  redFlags: string[];
  monthlyChecklist: string[];
}

function mockResponse(metrics: any): AIAdviceOutput {
  const savingsRate = metrics.savingsRate ?? 25;
  const score = metrics.overallScore ?? 65;

  return {
    summary: `Your financial health score of ${score}/100 reflects a ${score >= 75 ? 'strong' : score >= 50 ? 'developing' : 'critical'} foundation. ${savingsRate >= 25 ? 'Your savings discipline is commendable' : 'Your savings rate needs immediate attention'}. Focus on the actions below to systematically build long-term wealth.`,
    keyInsight: metrics.taxSavingAmount > 10000
      ? `Switch to ${metrics.taxRegimeRecommendation} tax regime immediately — you are overpaying ₹${metrics.taxSavingAmount?.toLocaleString('en-IN')} in taxes annually.`
      : `Maximize your Section 80C limit of ₹1.5L to save up to ₹46,800 in tax this financial year.`,
    taxVerdict: `Based on your income and deduction profile, the ${metrics.taxRegimeRecommendation ?? 'New'} Tax Regime saves you ₹${(metrics.taxSavingAmount ?? 0).toLocaleString('en-IN')}/year (₹${Math.round((metrics.taxSavingAmount ?? 0) / 12).toLocaleString('en-IN')}/month more in-hand).`,
    recommendations: [],
    redFlags: metrics.emergencyMonths < 3
      ? [`CRITICAL: Only ${metrics.emergencyMonths} months of emergency cover — one job loss or medical event could force high-interest borrowing.`]
      : [],
    monthlyChecklist: [
      `Verify tax regime declaration with HR before April 1`,
      `Set up automated SIP mandate for recommended amount`,
      `Review portfolio overlap using AMFI factsheets`,
    ],
  };
}

async function callAI(payload: any): Promise<AIAdviceOutput> {
  const userMessage = `Analyze this financial profile and return structured JSON advice:

METRICS:
- Overall Health Score: ${payload.overallScore}/100
- Savings Rate: ${payload.savingsRate}%
- Emergency Fund: ${payload.emergencyMonths} months  
- Tax Saving Opportunity: ₹${payload.taxSavingAmount?.toLocaleString('en-IN') ?? 0}/year via ${payload.taxRegimeRecommendation} regime
- Goals: ${payload.goals || 'Not specified'}
- Debt-to-Income: ${payload.debtToIncomeRatio ?? 0}%

TOP ALERTS: ${(payload.shockInsights ?? []).join(' | ')}

Provide 3-4 highest-priority recommendations. Each must have specific ₹ numbers and citations.`;

  let rawText = '';

  if (useAnthropic) {
    logger.info({ action: 'ai_call', provider: 'anthropic' }, 'Calling Claude');
    const msg = await anthropic.messages.create({
      model: 'claude-3-haiku-20240307',
      max_tokens: 1500,
      temperature: 0.3,
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: userMessage }],
    });
    rawText = (msg.content[0] as any).text?.trim() ?? '';
  } else if (useOpenAI) {
    logger.info({ action: 'ai_call', provider: 'openai' }, 'Calling OpenAI');
    const res = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      temperature: 0.3,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: userMessage },
      ],
    });
    rawText = res.choices[0].message.content?.trim() ?? '';
  }

  // Parse structured JSON from AI response
  const jsonMatch = rawText.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    try {
      return JSON.parse(jsonMatch[0]) as AIAdviceOutput;
    } catch {
      logger.warn({ action: 'ai_parse_fail', rawText: rawText.slice(0, 200) }, 'Failed to parse AI JSON');
    }
  }

  return mockResponse(payload);
}

// ── Public export with caching ────────────────────────────────────────────────
export async function getStructuredAdvice(metrics: any): Promise<AIAdviceOutput> {
  if (!useAnthropic && !useOpenAI) {
    logger.info({ action: 'ai_mock' }, 'No AI keys configured, using mock response');
    return mockResponse(metrics);
  }

  const cacheKey = `ai:advice:${JSON.stringify(metrics).slice(0, 100)}`;
  try {
    return await withCache(cacheKey, TTL.AI_ANALYSIS, () => callAI(metrics));
  } catch (err) {
    logger.error({ err, action: 'ai_call_fail' }, 'AI call failed, using mock');
    return mockResponse(metrics);
  }
}

// Backward-compat alias
export async function getFinancialSummary(data: any): Promise<string> {
  const result = await getStructuredAdvice(data);
  return result.summary;
}
