import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { z } from 'zod'

describe('Environment Validation', () => {
  describe('Shopify schema validation', () => {
    const shopifySchema = z.object({
      SHOPIFY_STORE_DOMAIN: z.string().min(1),
      SHOPIFY_STOREFRONT_ACCESS_TOKEN: z.string().min(1),
      SHOPIFY_CLIENT_ID: z.string().min(1),
      SHOPIFY_CLIENT_SECRET: z.string().min(1),
      SHOPIFY_API_VERSION: z.string().default('2026-01'),
    })

    it('should validate complete Shopify config', () => {
      const config = {
        SHOPIFY_STORE_DOMAIN: 'test-store.myshopify.com',
        SHOPIFY_STOREFRONT_ACCESS_TOKEN: 'shpat_123',
        SHOPIFY_CLIENT_ID: 'client-id',
        SHOPIFY_CLIENT_SECRET: 'client-secret',
        SHOPIFY_API_VERSION: '2026-01',
      }

      const result = shopifySchema.safeParse(config)
      expect(result.success).toBe(true)
    })

    it('should reject missing required fields', () => {
      const config = {
        SHOPIFY_STORE_DOMAIN: 'test-store.myshopify.com',
        // Missing other fields
      }

      const result = shopifySchema.safeParse(config)
      expect(result.success).toBe(false)
    })

    it('should use default API version', () => {
      const config = {
        SHOPIFY_STORE_DOMAIN: 'test-store.myshopify.com',
        SHOPIFY_STOREFRONT_ACCESS_TOKEN: 'token',
        SHOPIFY_CLIENT_ID: 'id',
        SHOPIFY_CLIENT_SECRET: 'secret',
        // API version omitted
      }

      const result = shopifySchema.safeParse(config)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.SHOPIFY_API_VERSION).toBe('2026-01')
      }
    })
  })

  describe('Odoo schema validation', () => {
    const odooSchema = z.object({
      ODOO_URL: z.string().url(),
      ODOO_DB: z.string().min(1),
      ODOO_USERNAME: z.string().min(1),
      ODOO_API_KEY: z.string().min(1),
    })

    it('should validate complete Odoo config', () => {
      const config = {
        ODOO_URL: 'https://my-company.odoo.com',
        ODOO_DB: 'my-company',
        ODOO_USERNAME: 'admin@example.com',
        ODOO_API_KEY: 'api-key-123',
      }

      const result = odooSchema.safeParse(config)
      expect(result.success).toBe(true)
    })

    it('should reject invalid URL', () => {
      const config = {
        ODOO_URL: 'not-a-url',
        ODOO_DB: 'db',
        ODOO_USERNAME: 'user',
        ODOO_API_KEY: 'key',
      }

      const result = odooSchema.safeParse(config)
      expect(result.success).toBe(false)
    })
  })

  describe('Supabase schema validation', () => {
    const supabaseSchema = z.object({
      NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
      NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
      SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
    })

    it('should validate complete Supabase config', () => {
      const config = {
        NEXT_PUBLIC_SUPABASE_URL: 'https://abc123.supabase.co',
        NEXT_PUBLIC_SUPABASE_ANON_KEY: 'anon-key',
        SUPABASE_SERVICE_ROLE_KEY: 'service-role-key',
      }

      const result = supabaseSchema.safeParse(config)
      expect(result.success).toBe(true)
    })

    it('should reject missing service role key', () => {
      const config = {
        NEXT_PUBLIC_SUPABASE_URL: 'https://abc123.supabase.co',
        NEXT_PUBLIC_SUPABASE_ANON_KEY: 'anon-key',
        // Missing service role key
      }

      const result = supabaseSchema.safeParse(config)
      expect(result.success).toBe(false)
    })
  })

})
