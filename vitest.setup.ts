import { vi } from 'vitest'

// Mock environment variables for tests
process.env.SHOPIFY_STORE_DOMAIN = 'test-store.myshopify.com'
process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN = 'test-storefront-token'
process.env.SHOPIFY_CLIENT_ID = 'test-client-id'
process.env.SHOPIFY_CLIENT_SECRET = 'test-client-secret'
process.env.SHOPIFY_API_VERSION = '2026-01'

process.env.ODOO_URL = 'https://test-odoo.odoo.com'
process.env.ODOO_DB = 'test-db'
process.env.ODOO_USERNAME = 'test@example.com'
process.env.ODOO_API_KEY = 'test-api-key'

process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co'
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key'
process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-service-role-key'

process.env.REDIS_URL = 'redis://localhost:6379'
process.env.ADMIN_API_KEY = 'test-admin-key'

// Global mocks
vi.mock('@/lib/odoo/client', () => ({
  create: vi.fn(),
  searchRead: vi.fn(),
  execute: vi.fn(),
  write: vi.fn(),
}))

vi.mock('@/lib/supabase/client', () => ({
  createServerClient: vi.fn(() => ({
    from: vi.fn(() => ({
      insert: vi.fn(() => ({ select: vi.fn(() => ({ single: vi.fn(() => ({ data: { id: 'test-id' }, error: null })) })) })),
      update: vi.fn(() => ({ eq: vi.fn(() => ({ select: vi.fn(() => ({ single: vi.fn(() => ({ data: {}, error: null })) })) })) })),
      select: vi.fn(() => ({ order: vi.fn() })),
    })),
  })),
  getSupabaseClient: vi.fn(),
}))
