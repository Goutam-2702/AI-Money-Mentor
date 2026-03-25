export function generateInsights(savingsRate: number, emergencyMonths: number, debtRatio: number) {
  const insights = [];

  if (emergencyMonths < 3) {
    insights.push({ type: 'danger', text: "High risk: Insufficient emergency buffer (< 3 months)." });
  } else if (emergencyMonths >= 6) {
    insights.push({ type: 'success', text: "Strong safety net: 6+ months of emergency fund secured." });
  } else {
    insights.push({ type: 'warning', text: "Moderate risk: Emergency fund is building, but not at 6 months yet." });
  }

  if (savingsRate >= 30) {
    insights.push({ type: 'success', text: "Excellent savings discipline (>= 30% savings rate)." });
  } else if (savingsRate < 10) {
    insights.push({ type: 'danger', text: "Warning: Savings rate is too low (< 10%). Immediate budgeting needed." });
  }

  if (debtRatio > 0.4) {
    insights.push({ type: 'danger', text: "High debt burden: Over 40% of income is going to debts." });
  } else if (debtRatio > 0 && debtRatio <= 0.4) {
    insights.push({ type: 'warning', text: "Manageable debt: Keep EMIs under control and aggressively pay down high interest." });
  } else {
    insights.push({ type: 'success', text: "Debt-free: Outstanding financial freedom indicator!" });
  }

  return insights;
}

export function generateShockInsights(
  savingsRate: number, 
  emergencyMonths: number, 
  yearsSaved: number
) {
  const shockInsights = [];

  if (savingsRate < 20) {
    shockInsights.push("You are saving too little to retire comfortably");
  }

  if (yearsSaved > 5) {
    shockInsights.push("Small changes today can accelerate your retirement significantly");
  }

  if (emergencyMonths < 3) {
    shockInsights.push("High financial risk due to low emergency buffer");
  }

  return shockInsights;
}
