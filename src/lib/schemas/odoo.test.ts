import { describe, it, expect } from 'vitest'
import { OdooPartnerSchema, OdooProductSchema, OdooSaleOrderSchema } from './odoo'

describe('OdooPartnerSchema', () => {
  const validPartner = {
    id: 1,
    name: 'John Doe',
    email: 'john@example.com',
    phone: false as const,
    street: '123 Main St',
    city: 'Ottawa',
    zip: 'K1A 0B1',
    country_id: [39, 'Canada'] as [number, string],
    state_id: [544, 'Ontario'] as [number, string],
    shopify_customer_id: 'gid://shopify/Customer/1001',
  }

  it('accepts a valid partner', () => {
    const result = OdooPartnerSchema.safeParse(validPartner)
    expect(result.success).toBe(true)
  })

  it('accepts numeric relation fields (no display name)', () => {
    const result = OdooPartnerSchema.safeParse({
      ...validPartner,
      country_id: 39,
      state_id: 544,
    })
    expect(result.success).toBe(true)
  })

  it('accepts false for optional relation fields', () => {
    const result = OdooPartnerSchema.safeParse({
      ...validPartner,
      country_id: false,
      state_id: false,
    })
    expect(result.success).toBe(true)
  })

  it('rejects missing name', () => {
    const { name: _, ...rest } = validPartner
    const result = OdooPartnerSchema.safeParse(rest)
    expect(result.success).toBe(false)
  })
})

describe('OdooProductSchema', () => {
  const validProduct = {
    id: 10,
    name: 'Custom Card',
    default_code: 'CARD-001',
    list_price: 25.0,
    standard_price: 10.0,
    qty_available: 100,
    type: 'product' as const,
    active: true,
    shopify_product_id: 'gid://shopify/Product/7001',
    shopify_variant_id: 'gid://shopify/ProductVariant/6001',
  }

  it('accepts a valid product', () => {
    const result = OdooProductSchema.safeParse(validProduct)
    expect(result.success).toBe(true)
  })

  it('accepts false for optional string fields (Odoo convention)', () => {
    const result = OdooProductSchema.safeParse({
      ...validProduct,
      default_code: false,
      shopify_product_id: false,
      shopify_variant_id: false,
    })
    expect(result.success).toBe(true)
  })

  it('rejects missing id', () => {
    const { id: _, ...rest } = validProduct
    const result = OdooProductSchema.safeParse(rest)
    expect(result.success).toBe(false)
  })

  it('rejects non-numeric list_price', () => {
    const result = OdooProductSchema.safeParse({ ...validProduct, list_price: '25.00' })
    expect(result.success).toBe(false)
  })
})

describe('OdooSaleOrderSchema', () => {
  const validOrder = {
    id: 100,
    name: 'SO001',
    partner_id: [1, 'John Doe'] as [number, string],
    state: 'sale' as const,
    date_order: '2026-03-12 10:00:00',
    amount_total: 50.0,
    amount_untaxed: 43.5,
    amount_tax: 6.5,
    shopify_order_id: 'gid://shopify/Order/12345',
    shopify_order_number: '#1001',
  }

  it('accepts a valid sale order', () => {
    const result = OdooSaleOrderSchema.safeParse(validOrder)
    expect(result.success).toBe(true)
  })

  it('accepts numeric partner_id', () => {
    const result = OdooSaleOrderSchema.safeParse({ ...validOrder, partner_id: 1 })
    expect(result.success).toBe(true)
  })

  it('accepts false for Shopify mapping fields (Odoo convention)', () => {
    const result = OdooSaleOrderSchema.safeParse({
      ...validOrder,
      shopify_order_id: false,
      shopify_order_number: false,
    })
    expect(result.success).toBe(true)
  })

  it('rejects missing state', () => {
    const { state: _, ...rest } = validOrder
    const result = OdooSaleOrderSchema.safeParse(rest)
    expect(result.success).toBe(false)
  })
})

