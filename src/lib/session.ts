/**
 * Server-side session management for admin auth.
 *
 * Instead of storing the raw API key in the cookie, we:
 *   1. Generate a random session token on login
 *   2. Store SHA-256(token) server-side
 *   3. Set the raw token in the httpOnly cookie
 *   4. On each request, hash the cookie value and check against stored hashes
 *
 * Uses Web Crypto API so this module works in both Node.js and Edge runtimes.
 *
 * Trade-off: in-memory store resets on redeploy (users re-login).
 * Acceptable for single-admin use. For multi-instance, move to Supabase.
 */

const sessions = new Map<string, { createdAt: number }>()

const SESSION_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000 // 7 days

function hexEncode(buffer: ArrayBuffer): string {
  return Array.from(new Uint8Array(buffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('')
}

async function hashToken(token: string): Promise<string> {
  const data = new TextEncoder().encode(token)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  return hexEncode(hashBuffer)
}

function generateRandomHex(bytes: number): string {
  const arr = new Uint8Array(bytes)
  crypto.getRandomValues(arr)
  return hexEncode(arr.buffer)
}

export async function createSession(): Promise<string> {
  // Clean expired sessions
  const now = Date.now()
  for (const [hash, meta] of sessions.entries()) {
    if (now - meta.createdAt > SESSION_MAX_AGE_MS) {
      sessions.delete(hash)
    }
  }

  const token = generateRandomHex(32)
  const hash = await hashToken(token)
  sessions.set(hash, { createdAt: now })
  return token
}

export async function validateSession(token: string): Promise<boolean> {
  const hash = await hashToken(token)
  const session = sessions.get(hash)
  if (!session) return false

  if (Date.now() - session.createdAt > SESSION_MAX_AGE_MS) {
    sessions.delete(hash)
    return false
  }

  return true
}

export async function revokeSession(token: string): Promise<void> {
  const hash = await hashToken(token)
  sessions.delete(hash)
}

export function compareSecrets(a: string, b: string): boolean {
  if (a.length !== b.length) return false
  const encoder = new TextEncoder()
  const bufA = encoder.encode(a)
  const bufB = encoder.encode(b)
  let result = 0
  for (let i = 0; i < bufA.length; i++) {
    result |= bufA[i] ^ bufB[i]
  }
  return result === 0
}
