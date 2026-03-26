/**
 * Portfolio Overlap Detection Engine
 * Detects stock-level overlap between mutual funds using a curated holdings map.
 * In production, this would fetch live AMC portfolio data from AMFI/MFI APIs.
 */

export interface FundHolding {
  name: string;
  isin?: string;
  weight: number; // % of fund's AUM in this stock
}

export interface MutualFund {
  id: string;
  name: string;
  category: 'large_cap' | 'mid_cap' | 'small_cap' | 'flexi_cap' | 'index' | 'hybrid' | 'debt';
  expenseRatio: number; // %
  aum: number;          // Cr
  returnsCagr3Y: number; // %
  riskLevel: 'low' | 'moderate' | 'high';
  // Top-10 holdings (representative — sourced from latest factsheets)
  topHoldings: FundHolding[];
}

export interface OverlapResult {
  fund1: string;
  fund2: string;
  overlapPercentage: number; // % of common stocks by weight
  commonStocks: string[];
  severity: 'low' | 'medium' | 'high'; // <20% low, 20-50% medium, >50% high
  recommendation: string;
}

export interface PortfolioAnalysis {
  funds: MutualFund[];
  overlaps: OverlapResult[];
  redFlags: RedFlag[];
  diversificationScore: number; // 0-100
  recommendations: string[];
}

export interface RedFlag {
  fund: string;
  type: 'high_expense_ratio' | 'high_overlap' | 'category_overlap' | 'low_aum' | 'poor_returns';
  severity: 'warning' | 'critical';
  message: string;
}

// ─── CURATED FUND DATABASE (representative top holdings) ──────────────────────
export const FUND_DATABASE: Record<string, MutualFund> = {
  'hdfc_small_cap': {
    id: 'hdfc_small_cap',
    name: 'HDFC Small Cap Fund - Direct',
    category: 'small_cap',
    expenseRatio: 0.64,
    aum: 28000,
    returnsCagr3Y: 31.2,
    riskLevel: 'high',
    topHoldings: [
      { name: 'Atul Ltd', weight: 3.2 }, { name: 'Bharat Electronics', weight: 2.8 },
      { name: 'Carborundum Universal', weight: 2.6 }, { name: 'KEI Industries', weight: 2.4 },
      { name: 'Firstsource Solutions', weight: 2.1 }, { name: 'CRISIL Ltd', weight: 2.0 },
      { name: 'Sonata Software', weight: 1.9 }, { name: 'Orient Electric', weight: 1.8 },
    ]
  },
  'parag_parikh_flexi': {
    id: 'parag_parikh_flexi',
    name: 'Parag Parikh Flexi Cap Fund - Direct',
    category: 'flexi_cap',
    expenseRatio: 0.59,
    aum: 72000,
    returnsCagr3Y: 22.1,
    riskLevel: 'moderate',
    topHoldings: [
      { name: 'HDFC Bank', weight: 6.5 }, { name: 'Bajaj Holdings', weight: 5.8 },
      { name: 'Coal India', weight: 4.2 }, { name: 'Power Grid Corp', weight: 3.9 },
      { name: 'ITC Ltd', weight: 4.1 }, { name: 'Alphabet (Google)', weight: 5.2 },
      { name: 'Microsoft', weight: 4.8 }, { name: 'Meta Platforms', weight: 3.1 },
    ]
  },
  'sbi_nifty_50_index': {
    id: 'sbi_nifty_50_index',
    name: 'SBI Nifty 50 Index Fund - Direct',
    category: 'index',
    expenseRatio: 0.12,
    aum: 18000,
    returnsCagr3Y: 17.8,
    riskLevel: 'moderate',
    topHoldings: [
      { name: 'HDFC Bank', weight: 13.2 }, { name: 'Reliance Industries', weight: 9.8 },
      { name: 'ICICI Bank', weight: 8.4 }, { name: 'Infosys', weight: 6.2 },
      { name: 'TCS', weight: 4.9 }, { name: 'Larsen & Toubro', weight: 4.3 },
      { name: 'Axis Bank', weight: 3.5 }, { name: 'Kotak Mahindra Bank', weight: 3.2 },
    ]
  },
  'axis_bluechip': {
    id: 'axis_bluechip',
    name: 'Axis Bluechip Fund - Regular',
    category: 'large_cap',
    expenseRatio: 1.59,
    aum: 35000,
    returnsCagr3Y: 15.1,
    riskLevel: 'moderate',
    topHoldings: [
      { name: 'HDFC Bank', weight: 9.8 }, { name: 'ICICI Bank', weight: 7.2 },
      { name: 'Reliance Industries', weight: 6.5 }, { name: 'TCS', weight: 5.8 },
      { name: 'Infosys', weight: 5.1 }, { name: 'Larsen & Toubro', weight: 4.8 },
      { name: 'Axis Bank', weight: 4.2 }, { name: 'Bharti Airtel', weight: 3.9 },
    ]
  },
  'mirae_emerging_bluechip': {
    id: 'mirae_emerging_bluechip',
    name: 'Mirae Asset Large & Midcap Fund - Direct',
    category: 'flexi_cap',
    expenseRatio: 0.57,
    aum: 32000,
    returnsCagr3Y: 23.4,
    riskLevel: 'moderate',
    topHoldings: [
      { name: 'HDFC Bank', weight: 5.2 }, { name: 'ICICI Bank', weight: 4.1 },
      { name: 'Reliance Industries', weight: 4.8 }, { name: 'Infosys', weight: 3.9 },
      { name: 'Tata Motors', weight: 3.2 }, { name: 'Maruti Suzuki', weight: 2.9 },
      { name: 'Divi\'s Laboratories', weight: 2.7 }, { name: 'Zomato', weight: 2.5 },
    ]
  },
};

// ─── OVERLAP CALCULATION ──────────────────────────────────────────────────────
function calculatePairOverlap(fund1: MutualFund, fund2: MutualFund): OverlapResult {
  const holdings1 = new Map(fund1.topHoldings.map(h => [h.name, h.weight]));
  const holdings2 = new Map(fund2.topHoldings.map(h => [h.name, h.weight]));

  const commonStocks: string[] = [];
  let overlapWeight = 0;

  for (const [stock, w1] of holdings1) {
    if (holdings2.has(stock)) {
      commonStocks.push(stock);
      // Use min weight to measure overlap (Sharpe overlap formula)
      overlapWeight += Math.min(w1, holdings2.get(stock)!);
    }
  }

  // Express as % of the smaller fund's top-holdings total weight
  const totalWeight1 = fund1.topHoldings.reduce((s, h) => s + h.weight, 0);
  const totalWeight2 = fund2.topHoldings.reduce((s, h) => s + h.weight, 0);
  const minTotal = Math.min(totalWeight1, totalWeight2);
  const overlapPct = minTotal > 0 ? (overlapWeight / minTotal) * 100 : 0;

  const severity: 'low' | 'medium' | 'high' =
    overlapPct >= 50 ? 'high' : overlapPct >= 20 ? 'medium' : 'low';

  const recommendation =
    severity === 'high'
      ? `Stop SIP in '${fund1.name}' — ${overlapPct.toFixed(0)}% overlap with '${fund2.name}'. You're paying two expense ratios for the same exposure.`
      : severity === 'medium'
      ? `Consider consolidating '${fund1.name}' and '${fund2.name}' — ${overlapPct.toFixed(0)}% overlap reduces diversification benefit.`
      : `Acceptable overlap (${overlapPct.toFixed(0)}%) between '${fund1.name}' and '${fund2.name}'.`;

  return {
    fund1: fund1.name,
    fund2: fund2.name,
    overlapPercentage: parseFloat(overlapPct.toFixed(1)),
    commonStocks,
    severity,
    recommendation,
  };
}

// ─── RED FLAG DETECTION ───────────────────────────────────────────────────────
function detectRedFlags(funds: MutualFund[], overlaps: OverlapResult[]): RedFlag[] {
  const flags: RedFlag[] = [];

  for (const fund of funds) {
    // Expense ratio check
    const expenseThreshold =
      fund.category === 'index' ? 0.3 :
      fund.category === 'large_cap' ? 0.8 :
      fund.category === 'flexi_cap' ? 1.0 :
      1.5; // small/mid cap

    if (fund.expenseRatio > expenseThreshold) {
      flags.push({
        fund: fund.name,
        type: 'high_expense_ratio',
        severity: fund.expenseRatio > expenseThreshold * 2 ? 'critical' : 'warning',
        message: `Expense ratio of ${fund.expenseRatio}% exceeds the category benchmark of ${expenseThreshold}%. Switch to Direct Plan to save ~${(fund.expenseRatio - 0.4).toFixed(2)}%/year.`,
      });
    }

    // AUM check (< ₹500 Cr is risk for small/mid cap)
    if ((fund.category === 'small_cap' || fund.category === 'mid_cap') && fund.aum < 500) {
      flags.push({
        fund: fund.name,
        type: 'low_aum',
        severity: 'warning',
        message: `Low AUM of ₹${fund.aum} Cr. Small/mid cap funds with low AUM face liquidity risk during market stress.`,
      });
    }
  }

  // Add flags from high-severity overlaps
  for (const overlap of overlaps) {
    if (overlap.severity === 'high') {
      flags.push({
        fund: overlap.fund1,
        type: 'high_overlap',
        severity: 'critical',
        message: `High portfolio overlap (${overlap.overlapPercentage}%) with ${overlap.fund2}. Net diversification value is near zero.`,
      });
    }
  }

  return flags;
}

// ─── MAIN ANALYSIS FUNCTION ────────────────────────────────────────────────────
export function analyzePortfolio(fundIds: string[]): PortfolioAnalysis {
  const funds = fundIds
    .map(id => FUND_DATABASE[id])
    .filter(Boolean);

  // If no fund IDs match, return default portfolio
  const analysisTarget = funds.length > 0 ? funds : [
    FUND_DATABASE['sbi_nifty_50_index'],
    FUND_DATABASE['parag_parikh_flexi'],
  ];

  // Calculate all pairwise overlaps
  const overlaps: OverlapResult[] = [];
  for (let i = 0; i < analysisTarget.length; i++) {
    for (let j = i + 1; j < analysisTarget.length; j++) {
      overlaps.push(calculatePairOverlap(analysisTarget[i], analysisTarget[j]));
    }
  }

  const redFlags = detectRedFlags(analysisTarget, overlaps);

  // Diversification score (inverted weighted overlap)
  const avgOverlap =
    overlaps.length > 0
      ? overlaps.reduce((s, o) => s + o.overlapPercentage, 0) / overlaps.length
      : 0;
  const diversificationScore = Math.max(0, Math.round(100 - avgOverlap * 1.2));

  // Recommendations
  const recommendations: string[] = [];
  const highOverlap = overlaps.filter(o => o.severity === 'high');
  if (highOverlap.length > 0) {
    recommendations.push(`Eliminate ${highOverlap.length} high-overlap fund pair(s) to improve portfolio efficiency.`);
  }
  const regularPlanFunds = analysisTarget.filter(f => f.expenseRatio > 1.0);
  if (regularPlanFunds.length > 0) {
    const annualSaving = regularPlanFunds.reduce((s, f) => s + (f.expenseRatio - 0.4) * 100000, 0);
    recommendations.push(`Switch ${regularPlanFunds.length} fund(s) to Direct Plan — estimated annual saving: ₹${Math.round(annualSaving).toLocaleString('en-IN')}.`);
  }
  if (diversificationScore < 60) {
    recommendations.push('Add international funds (US equity) or Gold/Bond funds to improve geographic & asset class diversification.');
  }

  return {
    funds: analysisTarget,
    overlaps,
    redFlags,
    diversificationScore,
    recommendations,
  };
}
