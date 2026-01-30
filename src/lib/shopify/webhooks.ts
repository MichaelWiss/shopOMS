import crypto from 'crypto'

const SHOPIFY_WEBHOOK_SECRET = process.env.SHOPIFY_WEBHOOK_SECRET!

/**
 * Verify Shopify webhook signature (HMAC-SHA256)
 */
export function verifyWebhookSignature(
  rawBody: string | Buffer,
  signature: string | null
): boolean {
  if (!signature) {
    return false
  }

  const body = typeof rawBody === 'string' ? rawBody : rawBody.toString('utf8')
  
  const hmac = crypto.createHmac('sha256', SHOPIFY_WEBHOOK_SECRET)
  hmac.update(body, 'utf8')
  const computedSignature = hmac.digest('base64')

  try {
    return crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(computedSignature)
    )
  } catch {
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
