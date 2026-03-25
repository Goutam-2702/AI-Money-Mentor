import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import dbConnect from '@/lib/db';
import { UserFinance } from '@/models/UserFinance';
import { getFinancialAdvice } from '@/lib/ai';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { age, income, expenses, savings, investments, loans, goals } = body;

    // RULE-BASED SCORING
    let score = 0;
    
    // 1. Savings Rate
    let savingsRatePercentage = 0;
    if (income > 0) {
      savingsRatePercentage = ((income - expenses) / income) * 100;
    }
    
    if (savingsRatePercentage > 30) {
      score += 40; // Good
    } else if (savingsRatePercentage >= 10 && savingsRatePercentage <= 30) {
      score += 20; // Medium
    } else {
      score += 5; // Poor
    }

    // 2. Emergency Fund
    let emergencyMonths = 0;
    if (expenses > 0) {
      emergencyMonths = savings / expenses;
    }
    
    if (emergencyMonths >= 6) {
      score += 30; // Good
    } else if (emergencyMonths >= 3) {
      score += 15; // Medium
    } else {
      score += 5; // Poor
    }

    // 3. Debt Ratio
    let debtRatio = 0;
    if (income > 0) {
      debtRatio = loans / income;
    }
    
    if (debtRatio === 0) {
      score += 30;
    } else if (debtRatio < 0.2) {
      score += 25;
    } else if (debtRatio < 0.4) {
      score += 15;
    } else {
      score += 0;
    }

    // Keep it max 100
    if(score > 100) score = 100;

    // AI Call
    const aiResponse = await getFinancialAdvice({
      age, income, expenses, savings, investments, loans, goals, score
    });

    const finalData = {
      score,
      problems: aiResponse.problems || [],
      actions: aiResponse.actions || [],
      investments: aiResponse.investments || [],
      warnings: aiResponse.warnings || [],
      plan_3_months: aiResponse.plan_3_months || {
        month1: [],
        month2: [],
        month3: []
      }
    };

    // Save to DB (Optional, but required by specs)
    let savedId = null;
    try {
      await dbConnect();
      if (mongoose.connection && mongoose.connection.readyState === 1) { // 1 = connected
        const savedRecord = await UserFinance.create({
          age, income, expenses, savings, investments, loans, goals,
          score: finalData.score,
          problems: finalData.problems,
          actions: finalData.actions,
          recommendedInvestments: finalData.investments,
          warnings: finalData.warnings,
          plan: finalData.plan_3_months
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
