export function calculateHealthScore(income: number, expenses: number, savings: number, loans: number) {
  let score = 0;
  
  // 1. Savings Rate (40 points)
  const savingsRate = income > 0 ? ((income - expenses) / income) * 100 : 0;
  if (savingsRate >= 30) score += 40;
  else if (savingsRate >= 10) score += 20;
  else score += 5;

  // 2. Emergency Fund (30 points) -> Target exactly 6 months
  const emergencyMonths = expenses > 0 ? savings / expenses : 0;
  if (emergencyMonths >= 6) score += 30;
  else if (emergencyMonths >= 3) score += 15;
  else score += 5;

  // 3. Debt Ratio (30 points)
  const debtRatio = income > 0 ? loans / income : 0;
  if (debtRatio === 0) score += 30;
  else if (debtRatio < 0.2) score += 25;
  else if (debtRatio < 0.4) score += 15;
  else score += 0;

  return {
    total: Math.min(score, 100),
    breakdown: { savingsRate, emergencyMonths, debtRatio }
  };
}
