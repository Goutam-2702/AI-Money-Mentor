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

export function calculateWealthAndRetirement(
  age: number,
  savings: number,
  monthlyExpenses: number,
  currentMonthlySIP: number,
  optimizedMonthlySIP: number
) {
  const returnRate = 0.12; // 12% annual return
  const inflationRate = 0.06; // 6% annual inflation
  
  // Current FIRE target: 25x early expenses
  const annualExpenses = monthlyExpenses * 12;
  const baseFireCorpus = annualExpenses * 25;
  
  const currentTrajectory = [];
  const optimizedTrajectory = [];
  
  let currentWealth = savings;
  let optimizedWealth = savings;
  let inflationAdjustedTarget = baseFireCorpus;

  let currentRetirementAge = 60; // default cap
  let optimizedRetirementAge = 60; // default cap
  let foundCurrent = false;
  let foundOptimized = false;
  
  // Simulate up to 30 years or age 80
  const maxYears = Math.min(30, 80 - age);

  for (let year = 1; year <= maxYears; year++) {
    // Current Trajectory calculation
    let currentWealthYearEnd = currentWealth;
    let optWealthYearEnd = optimizedWealth;
    
    // Add monthly contributions and compile returns (simplified annually)
    for(let m = 0; m < 12; m++) {
      currentWealthYearEnd += currentMonthlySIP;
      currentWealthYearEnd *= (1 + returnRate / 12);
      
      optWealthYearEnd += optimizedMonthlySIP;
      optWealthYearEnd *= (1 + returnRate / 12);
    }
    
    currentWealth = Math.round(currentWealthYearEnd);
    optimizedWealth = Math.round(optWealthYearEnd);
    
    inflationAdjustedTarget = baseFireCorpus * Math.pow(1 + inflationRate, year);
    
    currentTrajectory.push({
      year: year,
      age: age + year,
      netWorth: currentWealth
    });
    
    optimizedTrajectory.push({
      year: year,
      age: age + year,
      netWorth: optimizedWealth
    });

    if (!foundCurrent && currentWealth >= inflationAdjustedTarget) {
      currentRetirementAge = age + year;
      foundCurrent = true;
    }
    
    if (!foundOptimized && optimizedWealth >= inflationAdjustedTarget) {
      optimizedRetirementAge = age + year;
      foundOptimized = true;
    }
  }

  // If they never reach FIRE, we assume age 60 (or their current age if > 60)
  if (!foundCurrent) currentRetirementAge = Math.max(60, age);
  if (!foundOptimized) optimizedRetirementAge = Math.max(60, age);
  
  // Ensure optimized age is not worse than current
  if (optimizedRetirementAge > currentRetirementAge && optimizedMonthlySIP > currentMonthlySIP) {
    optimizedRetirementAge = currentRetirementAge; 
  }

  return {
    wealth_projection: {
      current: currentTrajectory,
      optimized: optimizedTrajectory
    },
    retirement_comparison: {
      current_retirement_age: currentRetirementAge,
      optimized_retirement_age: optimizedRetirementAge,
      years_saved: Math.max(0, currentRetirementAge - optimizedRetirementAge)
    }
  };
}
