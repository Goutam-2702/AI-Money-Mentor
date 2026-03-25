export function calculateFireCorpus(annualExpenses: number, inflationRate = 0.06) {
  // Use 25x annual expenses rule as base FIRE number
  const baseFireCorpus = annualExpenses * 25;
  
  // Future Value calculation assuming 10 years to FIRE for projection
  const yearsToProjection = 10;
  const inflationAdjustedCorpus = baseFireCorpus * Math.pow(1 + inflationRate, yearsToProjection);

  return {
    baseFireCorpus: Math.round(baseFireCorpus),
    inflationAdjustedCorpus: Math.round(inflationAdjustedCorpus),
    yearsToProjection,
    inflationRate: inflationRate * 100
  };
}
