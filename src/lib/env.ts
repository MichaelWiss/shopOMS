import { z } from 'zod'

/**
 * Centralized environment variable validation.
 * 
 * All env vars are validated at access time with clear error messages.
 * Import the `env` object instead of reading `process.env` directly.
 */

// --- Schemas ---

const shopifySchema = z.object({
  SHOPIFY_STORE_DOMAIN: z.string().min(1, 'SHOPIFY_STORE_DOMAIN is required'),
  SHOPIFY_STOREFRONT_ACCESS_TOKEN: z.string().min(1, 'SHOPIFY_STOREFRONT_ACCESS_TOKEN is required'),
  SHOPIFY_ADMIN_ACCESS_TOKEN: z.string().min(1, 'SHOPIFY_ADMIN_ACCESS_TOKEN is required'),
  SHOPIFY_WEBHOOK_SECRET: z.string().min(1, 'SHOPIFY_WEBHOOK_SECRET is required'),
  SHOPIFY_API_VERSION: z.string().default('2024-01'),
})

const odooSchema = z.object({
  ODOO_URL: z.string().url('ODOO_URL must be a valid URL'),
  ODOO_DB: z.string().min(1, 'ODOO_DB is required'),
  ODOO_USERNAME: z.string().min(1, 'ODOO_USERNAME is required'),
  ODOO_API_KEY: z.string().min(1, 'ODOO_API_KEY is required'),
})

const supabaseSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url('NEXT_PUBLIC_SUPABASE_URL must be a valid URL'),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1, 'NEXT_PUBLIC_SUPABASE_ANON_KEY is required'),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1, 'SUPABASE_SERVICE_ROLE_KEY is required'),
})

const redisSchema = z.object({
  REDIS_URL: z.string().min(1, 'REDIS_URL is required'),
})

const adminSchema = z.object({
  ADMIN_API_KEY: z.string().min(1, 'ADMIN_API_KEY is required'),
})

// --- Lazy validators (only validate when accessed) ---

function createLazyEnv<T extends z.ZodType>(schema: T, raw: () => Record<string, unknown>): z.infer<T> {
  let cached: z.infer<T> | undefined
  return new Proxy({} as z.infer<T>, {
    get(_target, prop) {
      if (cached === undefined) {
        const result = schema.safeParse(raw())
        if (!result.success) {
          const messages = result.error.issues.map(i => `  - ${i.path.join('.')}: ${i.message}`).join('\n')
          throw new Error(`Environment variable validation failed:\n${messages}`)
        }
        cached = result.data
      }
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      return cached![prop as string]
    },
  })
}

/**
 * Validated Shopify environment variables.
 * Throws on first access if any required vars are missing.
 */
export const shopifyEnv = createLazyEnv(shopifySchema, () => ({
  SHOPIFY_STORE_DOMAIN: process.env.SHOPIFY_STORE_DOMAIN,
  SHOPIFY_STOREFRONT_ACCESS_TOKEN: process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN,
  SHOPIFY_ADMIN_ACCESS_TOKEN: process.env.SHOPIFY_ADMIN_ACCESS_TOKEN,
  SHOPIFY_WEBHOOK_SECRET: process.env.SHOPIFY_WEBHOOK_SECRET,
  SHOPIFY_API_VERSION: process.env.SHOPIFY_API_VERSION,
}))

/**
 * Validated Odoo environment variables.
 */
export const odooEnv = createLazyEnv(odooSchema, () => ({
  ODOO_URL: process.env.ODOO_URL,
  ODOO_DB: process.env.ODOO_DB,
  ODOO_USERNAME: process.env.ODOO_USERNAME,
  ODOO_API_KEY: process.env.ODOO_API_KEY,
}))

/**
 * Validated Supabase environment variables.
 */
export const supabaseEnv = createLazyEnv(supabaseSchema, () => ({
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
}))

/**
 * Validated Redis environment variables.
 */
export const redisEnv = createLazyEnv(redisSchema, () => ({
  REDIS_URL: process.env.REDIS_URL,
}))

/**
 * Validated Admin environment variables.
 */
export const adminEnv = createLazyEnv(adminSchema, () => ({
  ADMIN_API_KEY: process.env.ADMIN_API_KEY,
}))
