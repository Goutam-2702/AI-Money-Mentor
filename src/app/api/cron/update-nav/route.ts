import { NextResponse } from 'next/server';
import { cacheDelete } from '@/lib/cache';
import { logger } from '@/lib/logger';

export async function GET(req: Request) {
  // Protect the cron from unauthorized access
  const authHeader = req.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  logger.info({ action: 'cron_nav_refresh' }, 'Starting NAV cache refresh');
  await cacheDelete('amfi:nav:all');

  return NextResponse.json({
    success: true,
    message: 'AMFI NAV cache cleared. Will refresh on next request.',
    timestamp: new Date().toISOString(),
  });
}
