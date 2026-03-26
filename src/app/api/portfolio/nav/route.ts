import { NextResponse } from 'next/server';
import { getLatestNAV, searchFunds, calculatePortfolioValue } from '@/lib/data/mf';
import { NAVRequest, parseOrError } from '@/lib/schemas';
import { logger } from '@/lib/logger';

// GET /api/portfolio/nav?search=hdfc — search funds by name
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const query = searchParams.get('search');

  if (!query || query.length < 2) {
    return NextResponse.json(
      { success: false, error: 'Provide at least 2 characters in ?search=' },
      { status: 400 }
    );
  }

  const results = await searchFunds(query, 10);
  return NextResponse.json({ success: true, data: results });
}

// POST /api/portfolio/nav — get NAVs for specific scheme codes
export async function POST(req: Request) {
  let body: unknown;
  try { body = await req.json(); } catch {
    return NextResponse.json({ success: false, error: 'Invalid JSON' }, { status: 400 });
  }

  const parsed = parseOrError(NAVRequest, body);
  if (!parsed.success) return parsed.response;

  const { schemeCodes } = parsed.data;
  logger.info({ action: 'nav_fetch', count: schemeCodes.length }, 'Fetching NAV');

  const navData = await getLatestNAV(schemeCodes);
  return NextResponse.json({ success: true, data: navData });
}
