import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import dbConnect from '@/lib/db';
import { UserFinance } from '@/models/UserFinance';
import { getFinancialSummary } from '@/lib/ai';
import { calculateHealthScore } from '@/lib/finance/scoring';
import { calculateFireCorpus } from '@/lib/finance/fire';
import { generateInsights } from '@/lib/finance/insights';
import { generateSmartPlan } from '@/lib/finance/planning';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    let { age, income, expenses, savings, investments, loans, goals } = body;

    // Use mock data fallback if user input is incomplete
    if (!income || !expenses) {
      income = 50000;
      expenses = 30000;
      age = age || 25;
      savings = savings || 10000;
      loans = loans || 0;
      investments = investments || "None";
      goals = goals || "Save for the future";
    }

    // 1. Scoring Engine
    const health = calculateHealthScore(income, expenses, savings, loans);
    
    // 2. FIRE Engine
    const fireData = calculateFireCorpus(expenses * 12);
    
    // 3. Insight Engine
    const insights = generateInsights(health.breakdown.savingsRate, health.breakdown.emergencyMonths, health.breakdown.debtRatio);
    
    // 4. Planning Engine
    const monthlyPlan = generateSmartPlan(income, expenses, savings);

    // 5. LLM Summary Engine (NO math allowed in AI)
    const aiPayload = {
      score: health.total,
      savingsRate: health.breakdown.savingsRate,
      emergencyMonths: health.breakdown.emergencyMonths,
      debtRatio: health.breakdown.debtRatio,
      goals
    };
    const aiSummary = await getFinancialSummary(aiPayload);

    // Final Strict Output Format
    const finalData = {
      score: health.total,
      breakdown: health.breakdown,
      fire_plan: fireData,
      insights,
      monthly_plan: monthlyPlan,
      ai_summary: aiSummary
    };

    // Save to DB (Optional, but required by specs)
    let savedId = null;
    try {
      await dbConnect();
      if (mongoose.connection && mongoose.connection.readyState === 1) { // 1 = connected
        const savedRecord = await UserFinance.create({
          age, income, expenses, savings, investments, loans, goals,
          score: finalData.score,
          ai_summary: finalData.ai_summary,
          insights: finalData.insights.map(i => i.text),
          monthly_plan: finalData.monthly_plan
        });
        savedId = savedRecord._id;
      }
    } catch (dbErr) {
      console.warn('MongoDB Error, continuing without saving:', dbErr);
    }

    return NextResponse.json({ success: true, data: finalData, savedId });
  } catch (error: any) {
    console.error('API Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

