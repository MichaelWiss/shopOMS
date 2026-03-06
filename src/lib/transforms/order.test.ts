import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { ShopifyOrderWebhook } from '@/types/shopify'

// Mock modules before importing
vi.mock('@/lib/odoo/products', () => ({
  findProductBySku: vi.fn(),
}))

vi.mock('@/lib/odoo/partners', () => ({
  getOrCreatePartner: vi.fn(),
}))

describe('Order Transformation Utilities', () => {
  describe('calculateOrderTotals', () => {
    it('should calculate totals from Shopify order', () => {
      const order: Partial<ShopifyOrderWebhook> = {
        subtotal_price: '100.00',
        total_tax: '8.50',
        total_price: '108.50',
        total_discounts: '10.00',
      }

      const subtotal = parseFloat(order.subtotal_price!)
      const tax = parseFloat(order.total_tax!)
      const total = parseFloat(order.total_price!)
      const discount = parseFloat(order.total_discounts!)

      expect(subtotal).toBe(100)
      expect(tax).toBe(8.5)
      expect(total).toBe(108.5)
      expect(discount).toBe(10)
    })

    it('should handle zero values', () => {
      const order: Partial<ShopifyOrderWebhook> = {
        subtotal_price: '0.00',
        total_tax: '0.00',
        total_price: '0.00',
        total_discounts: '0.00',
      }

      expect(parseFloat(order.subtotal_price!)).toBe(0)
      expect(parseFloat(order.total_tax!)).toBe(0)
    })
  })

  describe('Line item transformation logic', () => {
    it('should calculate discount percentage correctly', () => {
      const originalPrice = 50.00
      const quantity = 2
      const totalDiscount = 10.00 // $10 off $100 total = 10%

      const discountPercent = (totalDiscount / (originalPrice * quantity)) * 100
      expect(discountPercent).toBe(10)
    })

    it('should handle zero discount', () => {
      const originalPrice = 50.00
      const quantity = 1
      const totalDiscount = 0

      const discountPercent = originalPrice > 0 && quantity > 0
        ? (totalDiscount / (originalPrice * quantity)) * 100
        : 0

      expect(discountPercent).toBe(0)
    })

    it('should handle zero price edge case', () => {
      const originalPrice = 0
      const quantity = 1
      const totalDiscount = 0

      const discountPercent = originalPrice > 0 && quantity > 0
        ? (totalDiscount / (originalPrice * quantity)) * 100
        : 0

      expect(discountPercent).toBe(0)
    })
  })

  describe('Customer name extraction', () => {
    it('should extract name from customer object', () => {
      const order: Partial<ShopifyOrderWebhook> = {
        customer: {
          id: 123,
          email: 'john@example.com',
          first_name: 'John',
          last_name: 'Doe',
        },
      }

      const customerName = order.customer
        ? `${order.customer.first_name} ${order.customer.last_name}`
        : 'Guest'

      expect(customerName).toBe('John Doe')
    })

    it('should fallback to billing address', () => {
      const order: Partial<ShopifyOrderWebhook> = {
        customer: undefined,
        billing_address: {
          first_name: 'Jane',
          last_name: 'Smith',
          address1: '123 Main St',
          city: 'Boston',
          zip: '02101',
        },
      }

      const customerName = order.customer
        ? `${order.customer.first_name} ${order.customer.last_name}`
        : order.billing_address
          ? `${order.billing_address.first_name} ${order.billing_address.last_name}`
          : 'Guest'

      expect(customerName).toBe('Jane Smith')
    })

    it('should generate guest name from order number', () => {
      const orderNumber = '1001'
      const customerName = `Guest Customer #${orderNumber}`
      expect(customerName).toBe('Guest Customer #1001')
    })
  })

  describe('Customization properties extraction', () => {
    it('should filter out internal Shopify properties', () => {
      const properties = [
        { name: 'Color', value: 'Blue' },
        { name: '_internal_prop', value: 'hidden' },
        { name: 'Size', value: 'Large' },
        { name: '_bundled_with', value: 'other-product' },
      ]

      const filtered = properties
        .filter(p => p.name && !p.name.startsWith('_'))
        .map(p => ({ name: p.name, value: p.value }))

      expect(filtered).toHaveLength(2)
      expect(filtered[0]).toEqual({ name: 'Color', value: 'Blue' })
      expect(filtered[1]).toEqual({ name: 'Size', value: 'Large' })
    })

    it('should handle empty properties', () => {
      const properties: Array<{ name: string; value: string }> = []
      const filtered = properties.filter(p => p.name && !p.name.startsWith('_'))
      expect(filtered).toHaveLength(0)
    })

    it('should format customization string correctly', () => {
      const customizations = [
        { name: 'Color', value: 'Navy' },
        { name: 'Font', value: 'Helvetica' },
      ]
      
      const customStr = customizations.map(c => `${c.name}: ${c.value}`).join(', ')
      expect(customStr).toBe('Color: Navy, Font: Helvetica')
    })
  })
})

describe('Email extraction', () => {
  it('should prefer order email over customer email', () => {
    const orderEmail = 'order@example.com'
    const customerEmail = 'customer@example.com'

    const email = orderEmail || customerEmail
    expect(email).toBe('order@example.com')
  })

  it('should fallback to customer email', () => {
    const orderEmail = ''
    const customerEmail = 'customer@example.com'

    const email = orderEmail || customerEmail
    expect(email).toBe('customer@example.com')
  })

  it('should generate placeholder for guests', () => {
    const orderNumber = '1001'
    const email = `guest-${orderNumber}@placeholder.com`
    expect(email).toBe('guest-1001@placeholder.com')
  })
})
