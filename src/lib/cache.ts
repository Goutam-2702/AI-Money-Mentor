/**
 * Cache layer — in-memory with optional Redis upgrade.
 * Drop in REDIS_URL env variable to automatically use Redis.
 * Falls back to in-memory Map gracefully when Redis is unavailable.
 */

// ── In-Memory Store ───────────────────────────────────────────────────────────
interface CacheEntry {
  value: string;
  expiresAt: number;
}

const memStore = new Map<string, CacheEntry>();

// Cleanup expired entries every 5 minutes
if (typeof globalThis !== 'undefined') {
  setInterval(() => {
    const now = Date.now();
    for (const [k, v] of memStore) {
      if (v.expiresAt < now) memStore.delete(k);
    }
  }, 300_000);
}

function memGet(key: string): string | null {
  const entry = memStore.get(key);
  if (!entry) return null;
  if (entry.expiresAt < Date.now()) {
    memStore.delete(key);
    return null;
  }
  return entry.value;
}

function memSet(key: string, value: string, ttlSeconds: number) {
  memStore.set(key, { value, expiresAt: Date.now() + ttlSeconds * 1000 });
}

// ── Generic withCache helper ──────────────────────────────────────────────────
/**
 * Wraps any async function with cache-aside pattern.
 *
 * @example
 * const navData = await withCache('amfi:nav:all', 14400, fetchAMFI);
 */
export async function withCache<T>(
  key: string,
  ttlSeconds: number,
  fetcher: () => Promise<T>
): Promise<T> {
  try {
    // Try Redis first (if configured)
    if (process.env.REDIS_URL) {
      const redis = await getRedis();
      if (redis) {
        const cached = await redis.get(key);
        if (cached) return JSON.parse(cached) as T;
        const fresh = await fetcher();
        await redis.set(key, JSON.stringify(fresh), 'EX', ttlSeconds);
        return fresh;
      }
    }

    // In-memory fallback
    const cached = memGet(key);
    if (cached) return JSON.parse(cached) as T;

    const fresh = await fetcher();
    memSet(key, JSON.stringify(fresh), ttlSeconds);
    return fresh;
  } catch (err) {
    console.warn('[Cache] Error, falling back to direct fetch:', err);
    return fetcher();
  }
}

export async function cacheDelete(key: string) {
  memStore.delete(key);
  if (process.env.REDIS_URL) {
    const redis = await getRedis();
    await redis?.del(key);
  }
}

// ── Lazy Redis connection ─────────────────────────────────────────────────────
let redisClient: any = null;

async function getRedis() {
  if (redisClient) return redisClient;
  if (!process.env.REDIS_URL) return null;
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const Redis = require('ioredis');
    redisClient = new Redis(process.env.REDIS_URL, {
      maxRetriesPerRequest: 1,
      connectTimeout: 2000,
      lazyConnect: true,
    });
    await redisClient.connect();
    return redisClient;
  } catch {
    return null; // Redis unavailable — use memory cache
  }
}

// ── Cache TTL constants ───────────────────────────────────────────────────────
export const TTL = {
  AMFI_NAV: 4 * 3600,       // 4 hours — NAV updates once daily
  NSE_PRICE: 15 * 60,        // 15 minutes — live market
  TAX_SLABS: 30 * 24 * 3600, // 30 days — annual budget updates
  AI_ANALYSIS: 3600,         // 1 hour — expensive LLM call
  PORTFOLIO: 30 * 60,        // 30 minutes
} as const;
