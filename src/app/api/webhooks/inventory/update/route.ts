import { NextRequest, NextResponse } from 'next/server'
import { verifyWebhookSignature, extractWebhookMetadata } from '@/lib/shopify/webhooks'
import { createSyncEvent } from '@/lib/supabase/sync-events'
import { addInventorySyncJob } from '@/lib/queue'
import type { ShopifyInventoryWebhook } from '@/types/shopify'

export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.text()
    const metadata = extractWebhookMetadata(request.headers)

    if (!verifyWebhookSignature(rawBody, metadata.hmacSha256)) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
    }

    const inventoryPayload: ShopifyInventoryWebhook = JSON.parse(rawBody)

    console.log(`[Webhook] Inventory updated: item ${inventoryPayload.inventory_item_id}, qty: ${inventoryPayload.available}`)

    const syncEvent = await createSyncEvent({
      type: 'inventory',
      direction: 'shopify_to_odoo',
      status: 'pending',
      shopify_id: inventoryPayload.inventory_item_id.toString(),
      source_payload: inventoryPayload as unknown as Record<string, unknown>,
      webhook_id: metadata.webhookId || undefined,
    })

    if (!syncEvent) {
      return NextResponse.json({ error: 'Failed to log event' }, { status: 500 })
    }

    await addInventorySyncJob({
      type: 'inventory_update',
      inventoryData: inventoryPayload as unknown as Record<string, unknown>,
      syncEventId: syncEvent.id!,
      webhookId: metadata.webhookId || '',
    })

    return NextResponse.json({ success: true, syncEventId: syncEvent.id })
  } catch (error) {
    console.error('[Webhook] Error processing inventory/update:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
