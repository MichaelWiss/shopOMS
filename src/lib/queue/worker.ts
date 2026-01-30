import { Worker, Job } from 'bullmq'
import { redis, QUEUE_NAMES, type OrderSyncJob, type InventorySyncJob, type FulfillmentSyncJob } from './queues'
import { transformShopifyOrderToOdoo } from '@/lib/transforms/order'
import { createSaleOrder, findOrderByShopifyId, cancelSaleOrder } from '@/lib/odoo/orders'
import { updateSyncStatus } from '@/lib/supabase/sync-events'
import type { ShopifyOrderWebhook } from '@/types/shopify'

/**
 * Process order sync jobs
 */
async function processOrderSync(job: Job<OrderSyncJob>) {
  const { type, shopifyOrder, syncEventId } = job.data
  const startTime = Date.now()

  console.log(`[OrderSync] Processing ${type} for sync event ${syncEventId}`)

  try {
    // Update status to processing
    await updateSyncStatus(syncEventId, 'processing')

    switch (type) {
      case 'order_create': {
        // Check if order already exists
        const order = shopifyOrder as unknown as ShopifyOrderWebhook
        const existingOrder = await findOrderByShopifyId(
          order.admin_graphql_api_id || order.id.toString()
        )

        if (existingOrder) {
          console.log(`[OrderSync] Order already exists in Odoo: ${existingOrder.id}`)
          await updateSyncStatus(syncEventId, 'success', {
            odoo_id: existingOrder.id,
            processing_time_ms: Date.now() - startTime,
          })
          return { success: true, odooId: existingOrder.id, action: 'skipped_duplicate' }
        }

        // Transform and create order
        const transformed = await transformShopifyOrderToOdoo(order)
        const odooOrderId = await createSaleOrder(
          transformed.partnerId,
          transformed.orderLines,
          transformed.metadata
        )

        await updateSyncStatus(syncEventId, 'success', {
          odoo_id: odooOrderId,
          transformed_payload: transformed as unknown as Record<string, unknown>,
          processing_time_ms: Date.now() - startTime,
        })

        console.log(`[OrderSync] Created Odoo order: ${odooOrderId}`)
        return { success: true, odooId: odooOrderId, action: 'created' }
      }

      case 'order_cancel': {
        const cancelOrder = shopifyOrder as unknown as ShopifyOrderWebhook
        const existingOrderToCancel = await findOrderByShopifyId(
          cancelOrder.admin_graphql_api_id || cancelOrder.id.toString()
        )

        if (existingOrderToCancel?.id) {
          await cancelSaleOrder(existingOrderToCancel.id)
          await updateSyncStatus(syncEventId, 'success', {
            odoo_id: existingOrderToCancel.id,
            processing_time_ms: Date.now() - startTime,
          })
          return { success: true, odooId: existingOrderToCancel.id, action: 'cancelled' }
        }

        await updateSyncStatus(syncEventId, 'success', {
          processing_time_ms: Date.now() - startTime,
        })
        return { success: true, action: 'no_order_to_cancel' }
      }

      case 'order_update': {
        // For now, just log updates - full implementation would sync changes
        await updateSyncStatus(syncEventId, 'success', {
          processing_time_ms: Date.now() - startTime,
        })
        return { success: true, action: 'update_logged' }
      }

      default:
        throw new Error(`Unknown order sync type: ${type}`)
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    const errorStack = error instanceof Error ? error.stack : undefined

    console.error(`[OrderSync] Failed:`, error)

    // Calculate next retry time
    const retryCount = (job.attemptsMade || 0) + 1
    const maxRetries = job.opts.attempts || 5
    const nextRetryAt = retryCount < maxRetries
      ? new Date(Date.now() + Math.pow(2, retryCount) * 1000).toISOString()
      : undefined

    await updateSyncStatus(syncEventId, retryCount < maxRetries ? 'retry' : 'failed', {
      error_message: errorMessage,
      error_stack: errorStack,
      retry_count: retryCount,
      max_retries: maxRetries,
      next_retry_at: nextRetryAt,
      processing_time_ms: Date.now() - startTime,
    })

    throw error // Re-throw to trigger BullMQ retry
  }
}

/**
 * Process inventory sync jobs
 */
async function processInventorySync(job: Job<InventorySyncJob>) {
  const { syncEventId } = job.data
  const startTime = Date.now()

  console.log(`[InventorySync] Processing sync event ${syncEventId}`)

  try {
    await updateSyncStatus(syncEventId, 'processing')

    // TODO: Implement inventory sync logic
    // 1. Find product in Odoo by SKU or Shopify ID
    // 2. Update quantity

    await updateSyncStatus(syncEventId, 'success', {
      processing_time_ms: Date.now() - startTime,
    })

    return { success: true }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    await updateSyncStatus(syncEventId, 'failed', {
      error_message: errorMessage,
      processing_time_ms: Date.now() - startTime,
    })
    throw error
  }
}

/**
 * Process fulfillment sync jobs
 */
async function processFulfillmentSync(job: Job<FulfillmentSyncJob>) {
  const { syncEventId } = job.data
  const startTime = Date.now()

  console.log(`[FulfillmentSync] Processing sync event ${syncEventId}`)

  try {
    await updateSyncStatus(syncEventId, 'processing')

    // TODO: Implement fulfillment sync logic
    // 1. Find order in Odoo
    // 2. Create/update delivery in Odoo

    await updateSyncStatus(syncEventId, 'success', {
      processing_time_ms: Date.now() - startTime,
    })

    return { success: true }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    await updateSyncStatus(syncEventId, 'failed', {
      error_message: errorMessage,
      processing_time_ms: Date.now() - startTime,
    })
    throw error
  }
}

// Create workers
export function startWorkers() {
  console.log('[Worker] Starting queue workers...')

  const orderWorker = new Worker<OrderSyncJob>(
    QUEUE_NAMES.ORDER_SYNC,
    processOrderSync,
    {
      connection: redis,
      concurrency: 5,
    }
  )

  const inventoryWorker = new Worker<InventorySyncJob>(
    QUEUE_NAMES.INVENTORY_SYNC,
    processInventorySync,
    {
      connection: redis,
      concurrency: 10,
    }
  )

  const fulfillmentWorker = new Worker<FulfillmentSyncJob>(
    QUEUE_NAMES.FULFILLMENT_SYNC,
    processFulfillmentSync,
    {
      connection: redis,
      concurrency: 5,
    }
  )

  // Worker event handlers
  const workers = [orderWorker, inventoryWorker, fulfillmentWorker]
  workers.forEach(worker => {
    worker.on('completed', (job) => {
      console.log(`[Worker] Job ${job.id} completed`)
    })

    worker.on('failed', (job, error) => {
      console.error(`[Worker] Job ${job?.id} failed:`, error.message)
    })

    worker.on('error', (error) => {
      console.error('[Worker] Worker error:', error)
    })
  })

  console.log('[Worker] Workers started successfully')

  return { orderWorker, inventoryWorker, fulfillmentWorker }
}

// Run workers if this file is executed directly
if (require.main === module) {
  startWorkers()
}
