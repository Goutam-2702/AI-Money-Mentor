export function generateSmartPlan(income: number, expenses: number, savings: number) {
  const investableAmount = income - expenses;
  const targetEmergencyFixed = expenses * 6;
  const metrics = [];

  if (investableAmount <= 0) {
    return [
      `Reduce monthly expenses by at least ₹${Math.abs(investableAmount) + 2000} to stop bleeding cash.`,
      `Pause all non-essential spending. Free up cash flow immediately.`
    ];
  }

  // 1. Emergency Fund Priority
  if (savings < targetEmergencyFixed) {
    const deficit = targetEmergencyFixed - savings;
    const requiredMonths = Math.ceil(deficit / investableAmount);
    metrics.push(`Save ₹${investableAmount.toLocaleString('en-IN')} this month to reach ₹${targetEmergencyFixed.toLocaleString('en-IN')} target in ${requiredMonths} months.`);
  } else {
    metrics.push(`Emergency fund successfully maxed at ₹${savings.toLocaleString('en-IN')} (6+ months). Keep parked safely in FDs or Liquid Funds.`);
  }

  // 2. Investment Targets
  let sipTarget = 0;
  if (savings >= targetEmergencyFixed) {
    sipTarget = Math.round(investableAmount * 0.8 / 1000) * 1000;
    metrics.push(`Invest ₹${sipTarget.toLocaleString('en-IN')} in Index/Equity Mutual Funds via SIP.`);
  } else {
    // Only small SIP if emergency not met
    sipTarget = Math.round(investableAmount * 0.2 / 1000) * 1000;
    if (sipTarget > 1000) {
      metrics.push(`Invest ₹${sipTarget.toLocaleString('en-IN')} via SIP to build the habit while completing your emergency buffer.`);
    }
  }

  // 3. SIP Compounding Math
  if (sipTarget > 1000) {
    const years = 10;
    const rate = 0.12;
    const monthlyRate = rate / 12;
    const months = years * 12;
    const sipFutureValue = sipTarget * (((Math.pow(1 + monthlyRate, months) - 1)) / monthlyRate) * (1 + monthlyRate);
    metrics.push(`A ₹${sipTarget.toLocaleString('en-IN')}/mo SIP will project to ~₹${Math.round(sipFutureValue).toLocaleString('en-IN')} in ${years} years at 12% CAGR.`);
  }

  return metrics;
}
