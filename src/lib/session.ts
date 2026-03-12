/**
 * Server-side session management for admin auth.
 *
 * Instead of storing the raw API key in the cookie, we:
 *   1. Generate a random session token on login
 *   2. Store SHA-256(token) in Supabase
 *   3. Set the raw token in the httpOnly cookie
 *   4. On each request, hash the cookie value and check against stored hashes
 *
 * Uses Web Crypto API so this module works in both Node.js and Edge runtimes.
 * Sessions persist across deploys via Supabase.
 */

import { createServerClient } from '@/lib/supabase/client'

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
  const supabase = createServerClient()

  // Clean expired sessions
  const expiry = new Date(Date.now() - SESSION_MAX_AGE_MS).toISOString()
  await supabase.from('admin_sessions').delete().lt('created_at', expiry)

  const token = generateRandomHex(32)
  const hash = await hashToken(token)
  await supabase.from('admin_sessions').insert({ hash })
  return token
}

export async function validateSession(token: string): Promise<boolean> {
  const supabase = createServerClient()
  const hash = await hashToken(token)

  const { data } = await supabase
    .from('admin_sessions')
    .select('created_at')
    .eq('hash', hash)
    .single()

  if (!data) return false

  const createdAt = new Date(data.created_at).getTime()
  if (Date.now() - createdAt > SESSION_MAX_AGE_MS) {
    await supabase.from('admin_sessions').delete().eq('hash', hash)
    return false
  }

  return true
}

export async function revokeSession(token: string): Promise<void> {
  const supabase = createServerClient()
  const hash = await hashToken(token)
  await supabase.from('admin_sessions').delete().eq('hash', hash)
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
