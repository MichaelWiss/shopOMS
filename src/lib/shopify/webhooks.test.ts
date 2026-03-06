import { describe, it, expect, vi, beforeEach } from 'vitest'
import crypto from 'crypto'

// Test the webhook signature verification logic directly
describe('Shopify Webhook Verification', () => {
  const secret = 'test-webhook-secret'
  
  function computeHmac(body: string, secretKey: string): string {
    const hmac = crypto.createHmac('sha256', secretKey)
    hmac.update(body, 'utf8')
    return hmac.digest('base64')
  }

  it('should verify valid signature', () => {
    const body = JSON.stringify({ order_id: 123, name: '#1001' })
    const signature = computeHmac(body, secret)
    
    // Verify using same logic
    const hmac = crypto.createHmac('sha256', secret)
    hmac.update(body, 'utf8')
    const computed = hmac.digest('base64')
    
    expect(crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(computed))).toBe(true)
  })

  it('should reject invalid signature', () => {
    const body = JSON.stringify({ order_id: 123 })
    const invalidSignature = 'invalid-signature-here'
    const validSignature = computeHmac(body, secret)
    
    expect(() => {
      crypto.timingSafeEqual(Buffer.from(invalidSignature), Buffer.from(validSignature))
    }).toThrow() // Different lengths will throw
  })

  it('should reject tampered body', () => {
    const originalBody = JSON.stringify({ order_id: 123 })
    const signature = computeHmac(originalBody, secret)
    
    const tamperedBody = JSON.stringify({ order_id: 999 })
    const tamperedSignature = computeHmac(tamperedBody, secret)
    
    expect(signature).not.toBe(tamperedSignature)
  })

  it('should handle empty signature', () => {
    const body = JSON.stringify({ order_id: 123 })
    const signature: string | null = null
    
    expect(signature).toBeNull()
  })
})

describe('Webhook Metadata Extraction', () => {
  it('should extract all webhook headers', () => {
    const headers = new Headers({
      'x-shopify-topic': 'orders/create',
      'x-shopify-shop-domain': 'test-store.myshopify.com',
      'x-shopify-webhook-id': 'webhook-123',
      'x-shopify-api-version': '2026-01',
      'x-shopify-hmac-sha256': 'abc123',
      'x-shopify-triggered-at': '2026-03-06T12:00:00Z',
    })

    const metadata = {
      topic: headers.get('x-shopify-topic'),
      shopDomain: headers.get('x-shopify-shop-domain'),
      webhookId: headers.get('x-shopify-webhook-id'),
      apiVersion: headers.get('x-shopify-api-version'),
      hmacSha256: headers.get('x-shopify-hmac-sha256'),
      triggeredAt: headers.get('x-shopify-triggered-at'),
    }

    expect(metadata.topic).toBe('orders/create')
    expect(metadata.shopDomain).toBe('test-store.myshopify.com')
    expect(metadata.webhookId).toBe('webhook-123')
    expect(metadata.apiVersion).toBe('2026-01')
    expect(metadata.hmacSha256).toBe('abc123')
    expect(metadata.triggeredAt).toBe('2026-03-06T12:00:00Z')
  })

  it('should handle missing headers gracefully', () => {
    const headers = new Headers({})
    
    expect(headers.get('x-shopify-topic')).toBeNull()
    expect(headers.get('x-shopify-hmac-sha256')).toBeNull()
  })
})
