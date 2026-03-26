/**
 * AMFI India Mutual Fund NAV fetcher.
 * Data source: https://www.amfiindia.com/spages/NAVAll.txt (free, no auth)
 * Format: SchemeCode;ISINGrowth;ISINDivReinv;SchemeName;NAV;Date
 */

import { withCache, TTL } from '@/lib/cache';
import { logger } from '@/lib/logger';

const AMFI_URL = 'https://www.amfiindia.com/spages/NAVAll.txt';

export interface NAVEntry {
  schemeCode: string;
  name: string;
  nav: number;
  date: string;
  isinGrowth: string;
}

export type NAVMap = Record<string, NAVEntry>;

// ── Fetch all NAVs (cached) ───────────────────────────────────────────────────
async function fetchAllNAVs(): Promise<NAVMap> {
  logger.info({ action: 'amfi_fetch' }, 'Fetching AMFI NAV data');

  const response = await fetch(AMFI_URL, {
    next: { revalidate: 0 }, // disable Next.js fetch cache; we manage TTL ourselves
    headers: { 'User-Agent': 'AI-Money-Mentor/1.0' },
  });

  if (!response.ok) {
    throw new Error(`AMFI fetch failed: ${response.status} ${response.statusText}`);
  }

  const text = await response.text();
  const navMap: NAVMap = {};
  let parsed = 0;

  for (const line of text.split('\n')) {
    const parts = line.split(';');
    if (parts.length < 6) continue;

    const [code, isinGrowth, , name, navStr, date] = parts;
    const nav = parseFloat(navStr?.trim() ?? '');

    if (!code?.trim() || isNaN(nav) || nav <= 0) continue;

    navMap[code.trim()] = {
      schemeCode: code.trim(),
      name: name?.trim() ?? '',
      nav,
      date: date?.trim() ?? '',
      isinGrowth: isinGrowth?.trim() ?? '',
    };
    parsed++;
  }

  logger.info({ action: 'amfi_fetch', count: parsed }, 'AMFI NAV data parsed');
  return navMap;
}

// ── Public API ────────────────────────────────────────────────────────────────
/**
 * Get NAV for one or more scheme codes.
 * Results are cached for 4 hours (AMFI updates once daily).
 */
export async function getLatestNAV(schemeCodes: string[]): Promise<NAVMap> {
  const allNAVs = await withCache('amfi:nav:all', TTL.AMFI_NAV, fetchAllNAVs);

  const filtered: NAVMap = {};
  for (const code of schemeCodes) {
    if (allNAVs[code]) filtered[code] = allNAVs[code];
  }
  return filtered;
}

/**
 * Search funds by name (fuzzy match on cached data).
 */
export async function searchFunds(query: string, limit = 10): Promise<NAVEntry[]> {
  const allNAVs = await withCache('amfi:nav:all', TTL.AMFI_NAV, fetchAllNAVs);
  const q = query.toLowerCase();

  return Object.values(allNAVs)
    .filter((f) => f.name.toLowerCase().includes(q))
    .slice(0, limit);
}

/**
 * Calculate current portfolio value from holdings.
 */
export async function calculatePortfolioValue(
  holdings: Array<{ schemeCode: string; units: number; purchaseNav?: number }>
): Promise<{
  totalCurrentValue: number;
  totalInvested: number;
  totalGain: number;
  gainPercent: number;
  holdings: Array<{
    schemeCode: string;
    name: string;
    units: number;
    currentNav: number;
    currentValue: number;
    invested: number;
    gain: number;
    gainPercent: number;
  }>;
}> {
  const codes = holdings.map((h) => h.schemeCode);
  const navMap = await getLatestNAV(codes);

  let totalCurrentValue = 0;
  let totalInvested = 0;

  const enriched = holdings.map((h) => {
    const nav = navMap[h.schemeCode];
    const currentNav = nav?.nav ?? 0;
    const currentValue = h.units * currentNav;
    const invested = h.purchaseNav ? h.units * h.purchaseNav : 0;
    const gain = currentValue - invested;

    totalCurrentValue += currentValue;
    totalInvested += invested;

    return {
      schemeCode: h.schemeCode,
      name: nav?.name ?? 'Unknown Fund',
      units: h.units,
      currentNav,
      currentValue: Math.round(currentValue),
      invested: Math.round(invested),
      gain: Math.round(gain),
      gainPercent: invested > 0 ? parseFloat(((gain / invested) * 100).toFixed(2)) : 0,
    };
  });

  const totalGain = totalCurrentValue - totalInvested;

  return {
    totalCurrentValue: Math.round(totalCurrentValue),
    totalInvested: Math.round(totalInvested),
    totalGain: Math.round(totalGain),
    gainPercent:
      totalInvested > 0
        ? parseFloat(((totalGain / totalInvested) * 100).toFixed(2))
        : 0,
    holdings: enriched,
  };
}
