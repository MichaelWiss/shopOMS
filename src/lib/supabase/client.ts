import { createClient, SupabaseClient } from '@supabase/supabase-js'
import { supabaseEnv } from '@/lib/env'

/**
 * Browser-safe Supabase client (uses anon key).
 * Throws if env vars are missing.
 */
export function getSupabaseClient() {
  return createClient(supabaseEnv.NEXT_PUBLIC_SUPABASE_URL, supabaseEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY)
}

/**
 * Server-side Supabase client with service role (for API routes / workers).
 * Cached per-process to avoid connection overhead.
 */
let serverClient: SupabaseClient | null = null

export function createServerClient() {
  if (!serverClient) {
    serverClient = createClient(
      supabaseEnv.NEXT_PUBLIC_SUPABASE_URL,
      supabaseEnv.SUPABASE_SERVICE_ROLE_KEY
    )
  }
  return serverClient
}

/** @deprecated Use getSupabaseClient() instead */
export const supabase = null
