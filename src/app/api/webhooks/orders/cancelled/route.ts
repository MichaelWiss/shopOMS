import { NextRequest, NextResponse } from 'next/server'
import { verifyWebhookSignature, extractWebhookMetadata } from '@/lib/shopify/webhooks'
import { createSyncEvent } from '@/lib/supabase/sync-events'
import { addOrderSyncJob } from '@/lib/queue'
import type { ShopifyOrderWebhook } from '@/types/shopify'

export async function POST(request: NextRequest) {
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

    await addOrderSyncJob({
      type: 'order_cancel',
      shopifyOrder: orderPayload as unknown as Record<string, unknown>,
      syncEventId: syncEvent.id!,
      webhookId: metadata.webhookId || '',
    })

    return NextResponse.json({ success: true, syncEventId: syncEvent.id })
  } catch (error) {
    console.error('[Webhook] Error processing order/cancelled:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
