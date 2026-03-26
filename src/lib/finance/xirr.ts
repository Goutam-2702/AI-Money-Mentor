/**
 * XIRR (Extended Internal Rate of Return) calculator.
 * Uses Newton-Raphson iteration for convergence.
 * Industry-standard for mutual fund return calculation in India.
 */

export interface Cashflow {
  date: Date;
  amount: number; // negative = investment outflow, positive = redemption/current value
}

/**
 * Calculate XIRR for a series of cashflows.
 * @returns annualized return as a decimal (e.g., 0.142 = 14.2% p.a.)
 */
export function calculateXIRR(cashflows: Cashflow[], guess = 0.1): number {
  if (cashflows.length < 2) return 0;

  const dates = cashflows.map((cf) => cf.date);
  const amounts = cashflows.map((cf) => cf.amount);
  const firstDate = dates[0];

  // Convert dates to year fractions from first date
  const yearFractions = dates.map(
    (d) => (d.getTime() - firstDate.getTime()) / (365.25 * 24 * 3600 * 1000)
  );

  // NPV function: sum of PV of all cashflows at given rate
  const npv = (rate: number): number =>
    amounts.reduce((sum, amount, i) => sum + amount / Math.pow(1 + rate, yearFractions[i]), 0);

  // Derivative of NPV for Newton-Raphson
  const dnpv = (rate: number): number =>
    amounts.reduce(
      (sum, amount, i) =>
        sum - yearFractions[i] * amount / Math.pow(1 + rate, yearFractions[i] + 1),
      0
    );

  let rate = guess;
  const MAX_ITER = 200;
  const PRECISION = 1e-7;

  for (let i = 0; i < MAX_ITER; i++) {
    const fVal = npv(rate);
    const dfVal = dnpv(rate);

    if (Math.abs(dfVal) < 1e-12) break;

    const newRate = rate - fVal / dfVal;

    if (Math.abs(newRate - rate) < PRECISION) {
      return parseFloat((newRate * 100).toFixed(2)); // return as percentage
    }
    rate = newRate;
  }

  return parseFloat((rate * 100).toFixed(2));
}

/**
 * Build cashflows from SIP transactions for XIRR calculation.
 * @param sipTransactions Array of { date, amount } investment records
 * @param currentValue Total current portfolio value
 */
export function buildSIPCashflows(
  sipTransactions: Array<{ date: Date; amount: number }>,
  currentValue: number
): Cashflow[] {
  const cfs: Cashflow[] = sipTransactions.map((t) => ({
    date: t.date,
    amount: -Math.abs(t.amount), // negative = outflow
  }));

  // Add current value as final positive cashflow (today)
  cfs.push({ date: new Date(), amount: currentValue });

  return cfs;
}

/**
 * Annualized return using CAGR (simpler, for lump sum investments).
 */
export function calculateCAGR(
  invested: number,
  currentValue: number,
  years: number
): number {
  if (invested <= 0 || years <= 0) return 0;
  return parseFloat((((Math.pow(currentValue / invested, 1 / years) - 1) * 100).toFixed(2)));
}

/**
 * Future Value of a regular SIP at given monthly return rate.
 */
export function sipFutureValue(
  monthlySIP: number,
  annualReturnRate: number,
  years: number
): number {
  const r = annualReturnRate / 12;
  const n = years * 12;
  if (r === 0) return monthlySIP * n;
  return Math.round(monthlySIP * ((Math.pow(1 + r, n) - 1) / r) * (1 + r));
}
