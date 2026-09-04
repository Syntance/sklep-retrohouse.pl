/**
 * Mini in-memory rate limiter — fallback gdy Upstash Ratelimit nie
 * jest jeszcze podpięty (`UPSTASH_REDIS_REST_URL` brak w env).
 *
 * Mapa per-process — w środowisku serverless (Vercel Functions) Map
 * resetuje się przy zimnym starcie, więc realny limit jest "miękki".
 * To OK dla MVP B2B briefu (mała powierzchnia ataku); w prod
 * podmieniamy na Upstash Redis-backed counter (wpięty w ten sam
 * interfejs).
 *
 * Reguła 55-security: 30 req/min per session dla mutations.
 */

type Bucket = { count: number; resetAt: number };

const BUCKETS = new Map<string, Bucket>();

type RateLimitResult = { ok: boolean; retryAfterSec: number };

export function rateLimit(key: string, limit: number, windowMs: number): RateLimitResult {
	const now = Date.now();
	const existing = BUCKETS.get(key);
	if (!existing || existing.resetAt <= now) {
		BUCKETS.set(key, { count: 1, resetAt: now + windowMs });
		return { ok: true, retryAfterSec: 0 };
	}
	if (existing.count >= limit) {
		return { ok: false, retryAfterSec: Math.ceil((existing.resetAt - now) / 1000) };
	}
	existing.count += 1;
	return { ok: true, retryAfterSec: 0 };
}
