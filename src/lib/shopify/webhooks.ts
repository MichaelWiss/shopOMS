import crypto from 'crypto'
import { shopifyEnv } from '@/lib/env'

/**
 * Verify Shopify webhook signature (HMAC-SHA256)
 */
export function verifyWebhookSignature(
  rawBody: string | Buffer,
  signature: string | null
): boolean {
  if (!signature) {
    console.error('[Webhook] No signature provided')
    return false
  }

  const body = typeof rawBody === 'string' ? rawBody : rawBody.toString('utf8')
  const secret = shopifyEnv.SHOPIFY_CLIENT_SECRET
  
  const hmac = crypto.createHmac('sha256', secret)
  hmac.update(body, 'utf8')
  const computedSignature = hmac.digest('base64')

  // All debug in one line to avoid Vercel log truncation
  console.log(`[Webhook Debug] secretLen=${secret.length} secretPrefix=${secret.substring(0, 8)} bodyLen=${body.length} received=${signature} computed=${computedSignature}`)

  try {
    return crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(computedSignature)
    )
  } catch {
    console.error(`[Webhook Debug] Buffer length mismatch - signatures different lengths`)
    return false
  }
}

/**
 * Extract webhook metadata from headers
 */
export function extractWebhookMetadata(headers: Headers) {
  return {
    topic: headers.get('x-shopify-topic'),
    shopDomain: headers.get('x-shopify-shop-domain'),
    webhookId: headers.get('x-shopify-webhook-id'),
    apiVersion: headers.get('x-shopify-api-version'),
    hmacSha256: headers.get('x-shopify-hmac-sha256'),
    triggeredAt: headers.get('x-shopify-triggered-at'),
  }
}

export type WebhookTopic = 
  | 'orders/create'
  | 'orders/updated'
  | 'orders/cancelled'
  | 'orders/fulfilled'
  | 'orders/paid'
  | 'inventory_levels/update'
  | 'fulfillments/create'
  | 'fulfillments/update'
  | 'customers/create'
  | 'customers/update'
  | 'products/create'
  | 'products/update'
  | 'products/delete'
