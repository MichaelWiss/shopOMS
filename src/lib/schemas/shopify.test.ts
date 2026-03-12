import { describe, it, expect } from 'vitest'
import {
  ShopifyOrderWebhookSchema,
  ShopifyInventoryWebhookSchema,
  ShopifyFulfillmentWebhookSchema,
} from './shopify'

// --- Minimal valid fixtures ---

const validAddress = {
  first_name: 'John',
  last_name: 'Doe',
  address1: '123 Main St',
  address2: null,
  city: 'Ottawa',
  province: 'Ontario',
  province_code: 'ON',
  country: 'Canada',
  country_code: 'CA',
  zip: 'K1A 0B1',
  phone: null,
}

const validCustomer = {
  id: 1001,
  email: 'john@example.com',
  first_name: 'John',
  last_name: 'Doe',
  phone: null,
}

const validLineItem = {
  id: 5001,
  variant_id: 6001,
  product_id: 7001,
  title: 'Custom Card',
  quantity: 2,
  sku: 'CARD-001',
  price: '25.00',
  total_discount: '0.00',
  properties: [],
}

function makeValidOrder(overrides: Record<string, unknown> = {}) {
  return {
    id: 12345,
    admin_graphql_api_id: 'gid://shopify/Order/12345',
    order_number: 1001,
    name: '#1001',
    email: 'john@example.com',
    created_at: '2026-03-12T10:00:00Z',
    updated_at: '2026-03-12T10:00:00Z',
    financial_status: 'paid',
    fulfillment_status: null,
    currency: 'CAD',
    total_price: '50.00',
    subtotal_price: '50.00',
    total_tax: '6.50',
    total_discounts: '0.00',
    line_items: [validLineItem],
    shipping_address: validAddress,
    billing_address: validAddress,
    customer: validCustomer,
    ...overrides,
  }
}

// --- Order Webhook Schema ---

describe('ShopifyOrderWebhookSchema', () => {
  it('accepts a valid order payload', () => {
    const result = ShopifyOrderWebhookSchema.safeParse(makeValidOrder())
    expect(result.success).toBe(true)
  })

  it('accepts nullable customer, addresses, and fulfillment_status', () => {
    const order = makeValidOrder({
      customer: null,
      shipping_address: null,
      billing_address: null,
      fulfillment_status: null,
    })
    const result = ShopifyOrderWebhookSchema.safeParse(order)
    expect(result.success).toBe(true)
  })

  it('rejects missing id', () => {
    const { id: _, ...rest } = makeValidOrder()
    const result = ShopifyOrderWebhookSchema.safeParse(rest)
    expect(result.success).toBe(false)
  })

  it('rejects empty line_items', () => {
    const result = ShopifyOrderWebhookSchema.safeParse(makeValidOrder({ line_items: [] }))
    expect(result.success).toBe(false)
  })

  it('rejects non-numeric id', () => {
    const result = ShopifyOrderWebhookSchema.safeParse(makeValidOrder({ id: 'abc' }))
    expect(result.success).toBe(false)
  })

  it('rejects missing email', () => {
    const { email: _, ...rest } = makeValidOrder()
    const result = ShopifyOrderWebhookSchema.safeParse(rest)
    expect(result.success).toBe(false)
  })

  it('rejects line item with zero quantity', () => {
    const result = ShopifyOrderWebhookSchema.safeParse(
      makeValidOrder({ line_items: [{ ...validLineItem, quantity: 0 }] })
    )
    expect(result.success).toBe(false)
  })

  it('accepts line items with properties', () => {
    const item = { ...validLineItem, properties: [{ name: 'color', value: 'red' }] }
    const result = ShopifyOrderWebhookSchema.safeParse(makeValidOrder({ line_items: [item] }))
    expect(result.success).toBe(true)
  })

  it('rejects entirely wrong shape', () => {
    const result = ShopifyOrderWebhookSchema.safeParse({ foo: 'bar' })
    expect(result.success).toBe(false)
  })
})

// --- Inventory Webhook Schema ---

describe('ShopifyInventoryWebhookSchema', () => {
  const validInventory = {
    inventory_item_id: 9001,
    location_id: 8001,
    available: 42,
    updated_at: '2026-03-12T10:00:00Z',
  }

  it('accepts valid inventory payload', () => {
    const result = ShopifyInventoryWebhookSchema.safeParse(validInventory)
    expect(result.success).toBe(true)
  })

  it('rejects missing inventory_item_id', () => {
    const { inventory_item_id: _, ...rest } = validInventory
    const result = ShopifyInventoryWebhookSchema.safeParse(rest)
    expect(result.success).toBe(false)
  })

  it('rejects string available', () => {
    const result = ShopifyInventoryWebhookSchema.safeParse({ ...validInventory, available: '42' })
    expect(result.success).toBe(false)
  })

  it('accepts zero available', () => {
    const result = ShopifyInventoryWebhookSchema.safeParse({ ...validInventory, available: 0 })
    expect(result.success).toBe(true)
  })

  it('accepts negative available (back-ordered)', () => {
    const result = ShopifyInventoryWebhookSchema.safeParse({ ...validInventory, available: -5 })
    expect(result.success).toBe(true)
  })
})

// --- Fulfillment Webhook Schema ---

describe('ShopifyFulfillmentWebhookSchema', () => {
  const validFulfillment = {
    id: 3001,
    order_id: 12345,
    status: 'success',
    tracking_number: 'TRACK123',
    tracking_url: 'https://ups.com/track/TRACK123',
    tracking_company: 'UPS',
    line_items: [validLineItem],
  }

  it('accepts valid fulfillment payload', () => {
    const result = ShopifyFulfillmentWebhookSchema.safeParse(validFulfillment)
    expect(result.success).toBe(true)
  })

  it('accepts nullable tracking fields', () => {
    const result = ShopifyFulfillmentWebhookSchema.safeParse({
      ...validFulfillment,
      tracking_number: null,
      tracking_url: null,
      tracking_company: null,
    })
    expect(result.success).toBe(true)
  })

  it('rejects missing order_id', () => {
    const { order_id: _, ...rest } = validFulfillment
    const result = ShopifyFulfillmentWebhookSchema.safeParse(rest)
    expect(result.success).toBe(false)
  })

  it('rejects missing line_items', () => {
    const { line_items: _, ...rest } = validFulfillment
    const result = ShopifyFulfillmentWebhookSchema.safeParse(rest)
    expect(result.success).toBe(false)
  })
})
