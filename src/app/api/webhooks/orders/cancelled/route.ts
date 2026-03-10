import { NextRequest, NextResponse } from 'next/server'
import { verifyWebhookSignature, extractWebhookMetadata } from '@/lib/shopify/webhooks'
import { createSyncEvent } from '@/lib/supabase/sync-events'
import { inngest } from '@/lib/inngest/client'
import { rateLimiters, getClientIp } from '@/lib/rate-limit'
import type { ShopifyOrderWebhook } from '@/types/shopify'

export async function POST(request: NextRequest) {
  // Rate limit webhooks
  const ip = getClientIp(request.headers)
  const rateLimit = rateLimiters.webhook(ip)
  if (!rateLimit.success) {
    return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 })
  }

  try {
    const rawBody = await request.text()
    const metadata = extractWebhookMetadata(request.headers)

    if (!verifyWebhookSignature(rawBody, metadata.hmacSha256)) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
    }

    const orderPayload: ShopifyOrderWebhook = JSON.parse(rawBody)

    console.log(`[Webhook] Order cancelled: ${orderPayload.name}`)

    const syncEvent = await createSyncEvent({
      type: 'order',
      direction: 'shopify_to_odoo',
      status: 'pending',
      shopify_id: orderPayload.admin_graphql_api_id || orderPayload.id.toString(),
      source_payload: orderPayload as unknown as Record<string, unknown>,
      webhook_id: metadata.webhookId || undefined,
    })

    if (!syncEvent) {
      return NextResponse.json({ error: 'Failed to log event' }, { status: 500 })
    }

    await inngest.send({
      name: 'shop-oms/order.sync',
      data: {
        type: 'order_cancel',
        shopifyOrder: orderPayload as unknown as Record<string, unknown>,
        syncEventId: syncEvent.id!,
        webhookId: metadata.webhookId || '',
      },
    })

    return NextResponse.json({ success: true, syncEventId: syncEvent.id })
  } catch (error) {
    console.error('[Webhook] Error processing order/cancelled:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
