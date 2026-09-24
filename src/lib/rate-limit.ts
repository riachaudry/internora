import 'server-only';

/**
 * In-memory fixed-window limiter. Good enough for a single Node instance.
 * Swap the store for Upstash Redis before running more than one instance.
 */
const hits = new Map<string, { count: number; resetAt: number }>();
const WINDOW = Number(process.env.RATE_LIMIT_WINDOW_SECONDS ?? 60) * 1000;
const MAX = Number(process.env.RATE_LIMIT_MAX_REQUESTS ?? 30);

export function rateLimit(key: string, max = MAX) {
  const now = Date.now();
  const entry = hits.get(key);
  if (!entry || now > entry.resetAt) {
    hits.set(key, { count: 1, resetAt: now + WINDOW });
    return { ok: true, remaining: max - 1 };
  }
  entry.count += 1;
  return { ok: entry.count <= max, remaining: Math.max(0, max - entry.count) };
}

export function clientKey(req: Request, scope: string) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
    ?? req.headers.get('x-real-ip') ?? 'unknown';
  return `${scope}:${ip}`;
}
