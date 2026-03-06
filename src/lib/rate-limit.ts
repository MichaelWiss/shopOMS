/**
 * Simple in-memory rate limiter for development/low-traffic use.
 * 
 * For production with multiple instances, use Upstash Rate Limit:
 * https://upstash.com/docs/oss/sdks/ts/ratelimit/overview
 * 
 * npm install @upstash/ratelimit @upstash/redis
 */

interface RateLimitEntry {
  count: number
  resetAt: number
}

// In-memory store (single instance only - use Redis for multi-instance)
const store = new Map<string, RateLimitEntry>()

// Cleanup old entries periodically
setInterval(() => {
  const now = Date.now()
  for (const [key, entry] of store.entries()) {
    if (entry.resetAt < now) {
      store.delete(key)
    }
  }
}, 60_000) // Clean up every minute

export interface RateLimitConfig {
  /** Unique identifier for the rate limit (e.g., 'api', 'webhook', 'login') */
  identifier: string
  /** Maximum requests allowed in the window */
  limit: number
  /** Window duration in milliseconds */
  windowMs: number
}

export interface RateLimitResult {
  success: boolean
  limit: number
  remaining: number
  reset: number
}

/**
 * Check if a request should be rate limited.
 * 
 * @param key - Unique key for the client (e.g., IP address, API key)
 * @param config - Rate limit configuration
 * @returns RateLimitResult with success status and metadata
 */
export function rateLimit(key: string, config: RateLimitConfig): RateLimitResult {
  const { identifier, limit, windowMs } = config
  const now = Date.now()
  const cacheKey = `${identifier}:${key}`

  let entry = store.get(cacheKey)

  // Reset if window has passed
  if (!entry || entry.resetAt < now) {
    entry = {
      count: 0,
      resetAt: now + windowMs,
    }
  }

  // Increment count
  entry.count++
  store.set(cacheKey, entry)

  const remaining = Math.max(0, limit - entry.count)
  const success = entry.count <= limit

  return {
    success,
    limit,
    remaining,
    reset: entry.resetAt,
  }
}

// Pre-configured rate limiters for common use cases
export const rateLimiters = {
  /**
   * Webhook endpoints: 100 requests per minute per IP
   * Shopify sends webhooks in bursts, so this is generous
   */
  webhook: (ip: string) => rateLimit(ip, {
    identifier: 'webhook',
    limit: 100,
    windowMs: 60_000,
  }),

  /**
   * Login attempts: 5 per minute per IP
   * Prevents brute force attacks
   */
  login: (ip: string) => rateLimit(ip, {
    identifier: 'login',
    limit: 5,
    windowMs: 60_000,
  }),

  /**
   * API endpoints: 60 requests per minute per API key
   */
  api: (apiKey: string) => rateLimit(apiKey, {
    identifier: 'api',
    limit: 60,
    windowMs: 60_000,
  }),

  /**
   * Storefront: 120 requests per minute per IP
   * Normal browsing patterns
   */
  storefront: (ip: string) => rateLimit(ip, {
    identifier: 'storefront',
    limit: 120,
    windowMs: 60_000,
  }),
}

/**
 * Get client IP from request headers.
 * Handles common proxy scenarios (Vercel, Cloudflare, etc.)
 */
export function getClientIp(headers: Headers): string {
  // Vercel/common proxies
  const forwarded = headers.get('x-forwarded-for')
  if (forwarded) {
    return forwarded.split(',')[0].trim()
  }

  // Cloudflare
  const cfConnecting = headers.get('cf-connecting-ip')
  if (cfConnecting) {
    return cfConnecting
  }

  // Fallback
  return headers.get('x-real-ip') ?? 'unknown'
}
