import { describe, it, expect, vi, beforeEach } from 'vitest'
import crypto from 'crypto'

// --- Mock dependencies before importing ---

/* eslint-disable @typescript-eslint/no-explicit-any */
const mockCreateSyncEvent = vi.fn() as any
const mockInngestSend = vi.fn() as any
const mockWebhookRateLimit = vi.fn() as any

vi.mock('@/lib/supabase/sync-events', () => ({
  createSyncEvent: (...a: any[]) => mockCreateSyncEvent(...a),
}))

vi.mock('@/lib/inngest/client', () => ({
  inngest: { send: (...a: any[]) => mockInngestSend(...a) },
}))

vi.mock('@/lib/rate-limit', () => ({
  rateLimiters: { webhook: (...a: any[]) => mockWebhookRateLimit(...a) },
  getClientIp: () => '127.0.0.1',
}))

vi.mock('@/lib/env', () => ({
  shopifyEnv: { SHOPIFY_CLIENT_SECRET: 'test-webhook-secret' },
}))

import { handleShopifyWebhook } from './webhook-handler'
import { z } from 'zod'

// --- Helpers ---

const WEBHOOK_SECRET = 'test-webhook-secret'

function hmac(body: string): string {
  return crypto.createHmac('sha256', WEBHOOK_SECRET).update(body, 'utf8').digest('base64')
}

function makeRequest(body: string, signature?: string): Request & { headers: Headers } {
  const headers = new Headers({
    'content-type': 'application/json',
    'x-shopify-topic': 'orders/create',
    'x-shopify-shop-domain': 'test-store.myshopify.com',
    'x-shopify-webhook-id': 'wh-123',
    'x-shopify-api-version': '2026-01',
    'x-shopify-hmac-sha256': signature ?? hmac(body),
    'x-shopify-triggered-at': '2026-03-12T10:00:00Z',
    'x-forwarded-for': '127.0.0.1',
  })

  return new Request('http://localhost/api/webhooks/orders/create', {
    method: 'POST',
    headers,
    body,
  }) as Request & { headers: Headers }
}

const baseConfig = {
  syncType: 'order' as const,
  inngestEvent: 'shop-oms/order.sync',
  logLabel: 'Order created',
  extractShopifyId: (p: Record<string, unknown>) => String(p.id),
  buildEventData: (p: Record<string, unknown>, sid: string, wid: string) => ({
    type: 'order_create',
    shopifyOrder: p,
    syncEventId: sid,
    webhookId: wid,
  }),
}

// --- Tests ---

describe('handleShopifyWebhook', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockWebhookRateLimit.mockReturnValue({ success: true })
    mockCreateSyncEvent.mockResolvedValue({ id: 'sync-001' })
    mockInngestSend.mockResolvedValue(undefined)
  })

  it('returns 401 for invalid signature', async () => {
    const body = JSON.stringify({ id: 1 })
    const req = makeRequest(body, 'bad-signature')
    const res = await handleShopifyWebhook(req as never, baseConfig)
    expect(res.status).toBe(401)
  })

  it('returns 429 when rate limited', async () => {
    mockWebhookRateLimit.mockReturnValue({ success: false })
    const body = JSON.stringify({ id: 1 })
    const req = makeRequest(body)
    const res = await handleShopifyWebhook(req as never, baseConfig)
    expect(res.status).toBe(429)
  })

  it('returns 200 and dispatches Inngest event on success', async () => {
    const body = JSON.stringify({ id: 1 })
    const req = makeRequest(body)
    const res = await handleShopifyWebhook(req as never, baseConfig)
    expect(res.status).toBe(200)

    const json = await res.json()
    expect(json.syncEventId).toBe('sync-001')
    expect(mockInngestSend).toHaveBeenCalledOnce()
  })

  it('returns 500 when sync event creation fails', async () => {
    mockCreateSyncEvent.mockResolvedValue(null)
    const body = JSON.stringify({ id: 1 })
    const req = makeRequest(body)
    const res = await handleShopifyWebhook(req as never, baseConfig)
    expect(res.status).toBe(500)
  })

  it('returns 500 when Inngest dispatch fails', async () => {
    mockInngestSend.mockRejectedValue(new Error('Inngest down'))
    const body = JSON.stringify({ id: 1 })
    const req = makeRequest(body)
    const res = await handleShopifyWebhook(req as never, baseConfig)
    expect(res.status).toBe(500)
    // Should create a failure event
    expect(mockCreateSyncEvent).toHaveBeenCalledTimes(2)
  })

  // --- Schema validation ---

  it('returns 400 when schema validation fails', async () => {
    const schema = z.object({ id: z.number(), name: z.string() })
    const body = JSON.stringify({ id: 1 }) // missing name
    const req = makeRequest(body)
    const res = await handleShopifyWebhook(req as never, { ...baseConfig, schema })
    expect(res.status).toBe(400)
    const json = await res.json()
    expect(json.error).toBe('Invalid webhook payload')
  })

  it('passes through when schema validates successfully', async () => {
    const schema = z.object({ id: z.number() })
    const body = JSON.stringify({ id: 1 })
    const req = makeRequest(body)
    const res = await handleShopifyWebhook(req as never, { ...baseConfig, schema })
    expect(res.status).toBe(200)
  })

  it('skips validation when no schema provided', async () => {
    const body = JSON.stringify({ anything: 'goes' })
    const req = makeRequest(body)
    const res = await handleShopifyWebhook(req as never, baseConfig)
    expect(res.status).toBe(200)
  })
})
