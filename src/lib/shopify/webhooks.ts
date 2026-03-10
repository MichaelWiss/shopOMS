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
  
  // Debug: log secret length and prefix (never log full secret!)
  console.log(`[Webhook Debug] Secret length: ${secret.length}, prefix: ${secret.substring(0, 8)}...`)
  console.log(`[Webhook Debug] Received signature: ${signature.substring(0, 20)}...`)
  
  const hmac = crypto.createHmac('sha256', secret)
  hmac.update(body, 'utf8')
  const computedSignature = hmac.digest('base64')
  
  console.log(`[Webhook Debug] Computed signature: ${computedSignature.substring(0, 20)}...`)

  try {
    const isValid = crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(computedSignature)
    )
    console.log(`[Webhook Debug] Signature valid: ${isValid}`)
    return isValid
  } catch (e) {
    console.error(`[Webhook Debug] timingSafeEqual error:`, e)
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
