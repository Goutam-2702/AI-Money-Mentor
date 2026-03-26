export function generateSmartPlan(income: number, expenses: number, savings: number, currentSIP: number = 0) {
  const investableAmount = income - expenses;
  const targetEmergencyFixed = expenses * 6;
  const plan = [];
  let recommended_sip = 0;
  let gap_indicator = null;

  if (investableAmount <= 0) {
    return {
      plan: [
        `Reduce monthly expenses by at least ₹${Math.abs(investableAmount) + 2000} immediately.`,
        `Pause all non-essential spending until cashflow is positive.`
      ],
      recommended_sip: 0,
      gap_indicator: `Critical deficit: You are burning ₹${Math.abs(investableAmount)} more than you earn.`
    };
  }

  // 1. Emergency Fund Priority
  if (savings < targetEmergencyFixed) {
    plan.push(`Build emergency fund to ₹${targetEmergencyFixed.toLocaleString('en-IN')} (Current: ₹${savings.toLocaleString('en-IN')}).`);
    plan.push(`Save ₹${investableAmount.toLocaleString('en-IN')} this month towards the emergency buffer.`);
  } else {
    plan.push(`Emergency fund is fully funded at ₹${savings.toLocaleString('en-IN')}. Good job!`);
  }

  // 2. Investment Targets
  if (savings >= targetEmergencyFixed) {
    recommended_sip = Math.round((investableAmount * 0.8) / 1000) * 1000;
  } else {
    recommended_sip = Math.round((investableAmount * 0.2) / 1000) * 1000;
  }

  if (recommended_sip > 0) {
    if (currentSIP > 0 && currentSIP < recommended_sip) {
      plan.push(`Increase SIP from ₹${currentSIP.toLocaleString('en-IN')} → ₹${recommended_sip.toLocaleString('en-IN')} this month.`);
    } else if (currentSIP === 0) {
      plan.push(`Start a new SIP of ₹${recommended_sip.toLocaleString('en-IN')} in Index/Equity Mutual Funds.`);
    } else if (currentSIP >= recommended_sip) {
      plan.push(`Maintain current SIP of ₹${currentSIP.toLocaleString('en-IN')} (Target met).`);
    }
  }

  if (currentSIP < recommended_sip) {
    const gap = recommended_sip - currentSIP;
    gap_indicator = `You are under-investing by ₹${gap.toLocaleString('en-IN')}/month`;
  } else if (currentSIP >= recommended_sip && recommended_sip > 0) {
    gap_indicator = `You are investing on track!`;
  }

  return { plan, recommended_sip, gap_indicator };
}
