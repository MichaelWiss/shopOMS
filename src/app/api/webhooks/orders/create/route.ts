import { NextRequest, NextResponse } from 'next/server'
import { verifyWebhookSignature, extractWebhookMetadata } from '@/lib/shopify/webhooks'
import { createSyncEvent } from '@/lib/supabase/sync-events'
import { addOrderSyncJob } from '@/lib/queue'
import type { ShopifyOrderWebhook } from '@/types/shopify'

export async function POST(request: NextRequest) {
  const startTime = Date.now()

  try {
    // Get raw body for signature verification
    const rawBody = await request.text()
    const metadata = extractWebhookMetadata(request.headers)

    // Verify webhook signature
    if (!verifyWebhookSignature(rawBody, metadata.hmacSha256)) {
      console.error('[Webhook] Invalid signature')
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
    }

    // Parse the order payload
    const orderPayload: ShopifyOrderWebhook = JSON.parse(rawBody)

    console.log(`[Webhook] Order created: ${orderPayload.name} (${orderPayload.id})`)

    // Create sync event in Supabase
    const syncEvent = await createSyncEvent({
      type: 'order',
      direction: 'shopify_to_odoo',
      status: 'pending',
      shopify_id: orderPayload.admin_graphql_api_id || orderPayload.id.toString(),
      source_payload: orderPayload as unknown as Record<string, unknown>,
      webhook_id: metadata.webhookId || undefined,
    })

    if (!syncEvent) {
      console.error('[Webhook] Failed to create sync event')
      return NextResponse.json({ error: 'Failed to log event' }, { status: 500 })
    }

    // Add to queue for processing
    await addOrderSyncJob({
      type: 'order_create',
      shopifyOrder: orderPayload as unknown as Record<string, unknown>,
      syncEventId: syncEvent.id!,
      webhookId: metadata.webhookId || '',
    })

    console.log(`[Webhook] Queued order sync job: ${syncEvent.id}`)

    return NextResponse.json({
      success: true,
      syncEventId: syncEvent.id,
      processingTime: Date.now() - startTime,
    })
  } catch (error) {
    console.error('[Webhook] Error processing order/create:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
