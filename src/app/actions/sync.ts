'use server'

import { inngest } from '@/lib/inngest/client'
import { updateSyncStatus } from '@/lib/supabase/sync-events'
import { getSyncEventById, getFailedSyncEvents } from '@/lib/supabase/sync-events'
import { revalidatePath } from 'next/cache'

export async function retrySyncEvent(syncEventId: string) {
  const event = await getSyncEventById(syncEventId)

  if (!event) {
    return { success: false, error: 'Sync event not found' }
  }

  if (event.status !== 'failed' && event.status !== 'retry') {
    return { success: false, error: 'Only failed or retry events can be retried' }
  }

  if (!event.source_payload) {
    return { success: false, error: 'No source payload to retry' }
  }

  // Reset status to pending
  await updateSyncStatus(syncEventId, 'pending', {
    retry_count: (event.retry_count ?? 0) + 1,
    error_message: undefined,
    error_stack: undefined,
  })

  // Re-send the Inngest event based on type
  const eventName = event.type === 'order' ? 'shop-oms/order.sync' :
    event.type === 'inventory' ? 'shop-oms/inventory.sync' :
    event.type === 'fulfillment' ? 'shop-oms/fulfillment.sync' : null

  if (!eventName) {
    return { success: false, error: `Unknown sync type: ${event.type}` }
  }

  const jobType = event.type === 'order'
    ? (event.direction === 'shopify_to_odoo' ? 'order_create' : 'order_create')
    : event.type === 'inventory'
    ? 'inventory_update'
    : 'fulfillment_create'

  const dataKey = event.type === 'order' ? 'shopifyOrder' :
    event.type === 'inventory' ? 'inventoryData' : 'fulfillmentData'

  await inngest.send({
    name: eventName,
    data: {
      type: jobType,
      [dataKey]: event.source_payload,
      syncEventId,
      webhookId: event.webhook_id || '',
    },
  })

  revalidatePath('/admin/sync')
  return { success: true }
}

export async function retryAllFailed() {
  const failedEvents = await getFailedSyncEvents()

  if (failedEvents.length === 0) {
    return { success: true, retried: 0 }
  }

  let retried = 0
  for (const event of failedEvents) {
    const result = await retrySyncEvent(event.id!)
    if (result.success) retried++
  }

  revalidatePath('/admin/sync')
  return { success: true, retried }
}
