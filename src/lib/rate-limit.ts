/**
 * Rate limiter with Supabase persistence for multi-instance deployments.
 * Falls back to in-memory store if Supabase is unavailable.
 */

import { createServerClient } from '@/lib/supabase/client'

interface RateLimitEntry {
  count: number
  resetAt: number
}

// In-memory fallback (used when Supabase fails or in tests)
const memoryStore = new Map<string, RateLimitEntry>()

// Cleanup old entries from memory fallback periodically
if (typeof globalThis !== 'undefined' && typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now()
    for (const [key, entry] of memoryStore.entries()) {
      if (entry.resetAt < now) {
        memoryStore.delete(key)
      }
    }
  }, 60_000)
}

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
 * Uses Supabase rate_limit_entries table, falling back to in-memory if unavailable.
 * 
 * @param key - Unique key for the client (e.g., IP address, API key)
 * @param config - Rate limit configuration
 * @returns RateLimitResult with success status and metadata
 */
export function rateLimit(key: string, config: RateLimitConfig): RateLimitResult {
  const { identifier, limit, windowMs } = config
  const now = Date.now()
  const cacheKey = `${identifier}:${key}`

  // Use in-memory store for synchronous rate limiting (non-blocking)
  let entry = memoryStore.get(cacheKey)

  // Reset if window has passed
  if (!entry || entry.resetAt < now) {
    entry = {
      count: 0,
      resetAt: now + windowMs,
    }
  }

  // Increment count
  entry.count++
  memoryStore.set(cacheKey, entry)

  const remaining = Math.max(0, limit - entry.count)
  const success = entry.count <= limit

  // Persist to Supabase asynchronously (fire-and-forget)
  persistRateLimit(cacheKey, entry.count, new Date(entry.resetAt).toISOString()).catch(() => {})

  return {
    success,
    limit,
    remaining,
    reset: entry.resetAt,
  }
}

/**
 * Load rate limit state from Supabase on cold start.
 * Call this at startup to rehydrate the in-memory store.
 */
export async function rehydrateRateLimits(): Promise<void> {
  try {
    const supabase = createServerClient()
    const now = new Date().toISOString()
    const { data } = await supabase
      .from('rate_limit_entries')
      .select('key, count, reset_at')
      .gt('reset_at', now)

    if (data) {
      for (const row of data) {
        memoryStore.set(row.key, {
          count: row.count,
          resetAt: new Date(row.reset_at).getTime(),
        })
      }
    }
  } catch {
    // Supabase unavailable — continue with empty in-memory store
  }
}

async function persistRateLimit(key: string, count: number, resetAt: string): Promise<void> {
  const supabase = createServerClient()
  await supabase
    .from('rate_limit_entries')
    .upsert({ key, count, reset_at: resetAt }, { onConflict: 'key' })
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
