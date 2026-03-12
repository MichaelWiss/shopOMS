import { describe, it, expect } from 'vitest'
import { z } from 'zod'

// Replicate the schemas from cart.ts for isolated validation testing
const AddToCartSchema = z.object({
  variantId: z.string().min(1).startsWith('gid://shopify/'),
  quantity: z.number().int().min(1).max(100),
})

const UpdateQuantitySchema = z.object({
  lineId: z.string().min(1).startsWith('gid://shopify/'),
  quantity: z.number().int().min(0).max(100),
})

const RemoveItemSchema = z.object({
  lineId: z.string().min(1).startsWith('gid://shopify/'),
})

describe('AddToCartSchema', () => {
  it('accepts valid variant ID and quantity', () => {
    const result = AddToCartSchema.safeParse({
      variantId: 'gid://shopify/ProductVariant/12345',
      quantity: 3,
    })
    expect(result.success).toBe(true)
  })

  it('rejects non-Shopify GID', () => {
    const result = AddToCartSchema.safeParse({ variantId: 'variant-123', quantity: 1 })
    expect(result.success).toBe(false)
  })

  it('rejects empty string variant', () => {
    const result = AddToCartSchema.safeParse({ variantId: '', quantity: 1 })
    expect(result.success).toBe(false)
  })

  it('rejects zero quantity', () => {
    const result = AddToCartSchema.safeParse({
      variantId: 'gid://shopify/ProductVariant/1',
      quantity: 0,
    })
    expect(result.success).toBe(false)
  })

  it('rejects quantity over 100', () => {
    const result = AddToCartSchema.safeParse({
      variantId: 'gid://shopify/ProductVariant/1',
      quantity: 101,
    })
    expect(result.success).toBe(false)
  })

  it('rejects fractional quantity', () => {
    const result = AddToCartSchema.safeParse({
      variantId: 'gid://shopify/ProductVariant/1',
      quantity: 1.5,
    })
    expect(result.success).toBe(false)
  })
})

describe('UpdateQuantitySchema', () => {
  it('accepts quantity of zero (remove item)', () => {
    const result = UpdateQuantitySchema.safeParse({
      lineId: 'gid://shopify/CartLine/1',
      quantity: 0,
    })
    expect(result.success).toBe(true)
  })

  it('accepts valid update', () => {
    const result = UpdateQuantitySchema.safeParse({
      lineId: 'gid://shopify/CartLine/1',
      quantity: 5,
    })
    expect(result.success).toBe(true)
  })

  it('rejects negative quantity', () => {
    const result = UpdateQuantitySchema.safeParse({
      lineId: 'gid://shopify/CartLine/1',
      quantity: -1,
    })
    expect(result.success).toBe(false)
  })
})

describe('RemoveItemSchema', () => {
  it('accepts valid line ID', () => {
    const result = RemoveItemSchema.safeParse({ lineId: 'gid://shopify/CartLine/1' })
    expect(result.success).toBe(true)
  })

  it('rejects non-Shopify GID', () => {
    const result = RemoveItemSchema.safeParse({ lineId: 'line-123' })
    expect(result.success).toBe(false)
  })
})
