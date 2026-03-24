import { inngest } from './client'
import { transformShopifyOrderToOdoo } from '@/lib/transforms/order'
import { createSaleOrder, findOrderByShopifyId, cancelSaleOrder } from '@/lib/odoo/orders'
import { findProductBySku, updateProductInventory } from '@/lib/odoo/products'
import { updateSyncStatus } from '@/lib/supabase/sync-events'
import { upsertOrderMapping } from '@/lib/supabase/order-mappings'
import { alertSyncFailure, alertHealthDegraded, alertFailedSyncBacklog } from '@/lib/alerts'
import { checkHealth as checkOdoo } from '@/lib/odoo'
import { getFailedSyncEvents, deleteOldSyncEvents } from '@/lib/supabase/sync-events'
import { ShopifyOrderWebhookSchema, ShopifyInventoryWebhookSchema } from '@/lib/schemas'
import type { ShopifyOrderWebhook } from '@/types/shopify'
import { upsertInventorySnapshot } from '@/lib/supabase/inventory-snapshots'
import { upsertProductMapping } from '@/lib/supabase/product-mappings'

// --- Shared onFailure handler ---
async function handleFunctionFailure({ event, error }: { event: { data: Record<string, unknown> }; error: Error }) {
  await alertSyncFailure(
    (event.data.functionId as string) || 'unknown',
    error,
    { syncEventId: event.data.syncEventId, type: event.data.type },
  )
}

// --- Order Sync Function ---
export const orderSync = inngest.createFunction(
  {
    id: 'order-sync',
    retries: 5,
    onFailure: handleFunctionFailure,
  },
  { event: 'shop-oms/order.sync' },
  async ({ event, step }) => {
    const { type, shopifyOrder, syncEventId } = event.data
    const startTime = Date.now()

    await step.run('mark-processing', async () => {
      await updateSyncStatus(syncEventId, 'processing')
    })

    const order = await step.run('validate-payload', async () => {
      return ShopifyOrderWebhookSchema.parse(shopifyOrder) as unknown as ShopifyOrderWebhook
    })

    switch (type) {
      case 'order_create': {

        const existingOrder = await step.run('check-existing', async () => {
          return findOrderByShopifyId(
            order.admin_graphql_api_id || order.id.toString()
          )
        })

        if (existingOrder) {
          await step.run('save-mapping-duplicate', async () => {
            await upsertOrderMapping({
              shopify_order_id: order.admin_graphql_api_id || order.id.toString(),
              shopify_order_number: order.name,
              odoo_order_id: existingOrder.id,
              status: 'synced',
            })
          })

          await step.run('log-duplicate', async () => {
            await updateSyncStatus(syncEventId, 'success', {
              odoo_id: existingOrder.id,
              processing_time_ms: Date.now() - startTime,
            })
          })
          return { success: true, odooId: existingOrder.id, action: 'skipped_duplicate' }
        }

        const transformed = await step.run('transform-order', async () => {
          return transformShopifyOrderToOdoo(order)
        })

        const odooOrderId = await step.run('create-in-odoo', async () => {
          return createSaleOrder(
            transformed.partnerId,
            transformed.orderLines,
            transformed.metadata
          )
        })

        await step.run('save-mapping', async () => {
          await upsertOrderMapping({
            shopify_order_id: order.admin_graphql_api_id || order.id.toString(),
            shopify_order_number: order.name,
            odoo_order_id: odooOrderId,
            status: 'synced',
          })
        })

        await step.run('log-success', async () => {
          await updateSyncStatus(syncEventId, 'success', {
            odoo_id: odooOrderId,
            transformed_payload: transformed as unknown as Record<string, unknown>,
            processing_time_ms: Date.now() - startTime,
          })
        })

        return { success: true, odooId: odooOrderId, action: 'created' }
      }

      case 'order_cancel': {
        const existing = await step.run('find-order-to-cancel', async () => {
          return findOrderByShopifyId(
            order.admin_graphql_api_id || order.id.toString()
          )
        })

        if (existing?.id) {
          const odooId = existing.id
          await step.run('cancel-in-odoo', async () => {
            await cancelSaleOrder(odooId)
          })

          await step.run('save-mapping-cancelled', async () => {
            await upsertOrderMapping({
              shopify_order_id: order.admin_graphql_api_id || order.id.toString(),
              shopify_order_number: order.name,
              odoo_order_id: odooId,
              status: 'cancelled',
            })
          })

          await step.run('log-cancelled', async () => {
            await updateSyncStatus(syncEventId, 'success', {
              odoo_id: odooId,
              processing_time_ms: Date.now() - startTime,
            })
          })

          return { success: true, odooId: odooId, action: 'cancelled' }
        }

        await step.run('log-no-order', async () => {
          await updateSyncStatus(syncEventId, 'success', {
            processing_time_ms: Date.now() - startTime,
          })
        })

        return { success: true, action: 'no_order_to_cancel' }
      }

      case 'order_update': {
        await step.run('log-update', async () => {
          await updateSyncStatus(syncEventId, 'success', {
            processing_time_ms: Date.now() - startTime,
          })
        })

        return { success: true, action: 'update_logged' }
      }

      default:
        throw new Error(`Unknown order sync type: ${type}`)
    }
  }
)

// --- Inventory Sync Function ---
export const inventorySync = inngest.createFunction(
  {
    id: 'inventory-sync',
    retries: 3,
    onFailure: handleFunctionFailure,
  },
  { event: 'shop-oms/inventory.sync' },
  async ({ event, step }) => {
    const { syncEventId } = event.data
    const startTime = Date.now()

    await step.run('mark-processing', async () => {
      await updateSyncStatus(syncEventId, 'processing')
    })

    const inventoryData = await step.run('validate-payload', async () => {
      return ShopifyInventoryWebhookSchema.parse(event.data.inventoryData)
    })

    const result = await step.run('sync-inventory', async () => {
      if (!inventoryData.sku) {
        return { action: 'skipped' as const, reason: 'no_sku' }
      }

      const product = await findProductBySku(inventoryData.sku)
      if (!product || product.id === undefined) {
        return { action: 'skipped' as const, reason: 'product_not_found', sku: inventoryData.sku }
      }

      const qty = inventoryData.available ?? 0
      await updateProductInventory(product.id, qty)
      const productName = typeof product.name === 'string' ? product.name : null
      return { action: 'updated' as const, productId: product.id, productName, quantity: qty }
    })

    await step.run('update-read-models', async () => {
      if (!inventoryData.sku) return
      const locationId = String(inventoryData.location_id)
      const now = new Date().toISOString()

      await upsertProductMapping({
        sku: inventoryData.sku,
        shopify_inventory_item_id: String(inventoryData.inventory_item_id),
        odoo_product_id: result.action === 'updated' ? result.productId : null,
        odoo_product_name: result.action === 'updated' ? result.productName : null,
        mapping_status:
          result.action === 'updated' ? 'mapped'
          : result.action === 'skipped' && result.reason === 'product_not_found' ? 'missing_odoo'
          : 'pending',
        last_checked_at: now,
        last_error: null,
      })

      await upsertInventorySnapshot({
        sku: inventoryData.sku,
        location_id: locationId,
        shopify_qty: inventoryData.available ?? 0,
        odoo_qty: result.action === 'updated' ? (inventoryData.available ?? 0) : null,
        status: result.action === 'updated' ? 'synced' : 'failed',
        last_synced_at: result.action === 'updated' ? now : null,
        sync_event_id: (syncEventId as string) || null,
        last_error: null,
      })
    })

    await step.run('log-success', async () => {
      await updateSyncStatus(syncEventId, 'success', {
        odoo_id: result.action === 'updated' ? result.productId : undefined,
        processing_time_ms: Date.now() - startTime,
      })
    })

    return { success: true, ...result }
  }
)

// --- Fulfillment Sync Function ---
export const fulfillmentSync = inngest.createFunction(
  {
    id: 'fulfillment-sync',
    retries: 5,
    onFailure: handleFunctionFailure,
  },
  { event: 'shop-oms/fulfillment.sync' },
  async ({ event, step }) => {
    const { syncEventId } = event.data
    const startTime = Date.now()

    await step.run('mark-processing', async () => {
      await updateSyncStatus(syncEventId, 'processing')
    })

    const fulfillmentData = event.data.fulfillmentData as {
      order_id?: number | string
      admin_graphql_api_id?: string
      tracking_number?: string
      tracking_company?: string
      status?: string
    }

    const result = await step.run('sync-fulfillment', async () => {
      const shopifyOrderId = fulfillmentData.admin_graphql_api_id ||
        (fulfillmentData.order_id ? String(fulfillmentData.order_id) : null)

      if (!shopifyOrderId) {
        return { action: 'skipped' as const, reason: 'no_order_id' }
      }

      const existing = await findOrderByShopifyId(shopifyOrderId)
      if (!existing) {
        return { action: 'skipped' as const, reason: 'order_not_found', shopifyOrderId }
      }

      // Log fulfillment data against the order for now.
      // Full delivery creation requires Odoo stock.picking integration.
      return {
        action: 'logged' as const,
        odooOrderId: existing.id,
        tracking: fulfillmentData.tracking_number,
        carrier: fulfillmentData.tracking_company,
      }
    })

    await step.run('log-success', async () => {
      await updateSyncStatus(syncEventId, 'success', {
        odoo_id: result.action === 'logged' ? result.odooOrderId : undefined,
        processing_time_ms: Date.now() - startTime,
      })
    })

    return { success: true, ...result }
  }
)

// --- Health Check Cron ---
export const healthCheck = inngest.createFunction(
  { id: 'health-check' },
  { cron: '*/15 * * * *' },
  async ({ step }) => {
    const odooStatus = await step.run('check-odoo', async () => {
      try {
        const healthy = await checkOdoo()
        return { status: healthy ? 'ok' : 'error', message: healthy ? undefined : 'Auth failed' } as const
      } catch (err) {
        return { status: 'error' as const, message: err instanceof Error ? err.message : 'Unknown error' }
      }
    })

    const failedEvents = await step.run('check-failed-syncs', async () => {
      const events = await getFailedSyncEvents()
      return events.length
    })

    if (odooStatus.status !== 'ok') {
      await step.run('alert-health', async () => {
        await alertHealthDegraded({ odoo: odooStatus })
      })
    }

    if (failedEvents > 0) {
      await step.run('alert-backlog', async () => {
        await alertFailedSyncBacklog(failedEvents)
      })
    }

    return { odoo: odooStatus, failedSyncBacklog: failedEvents }
  }
)

// --- Retention Cleanup Cron ---
// Runs daily at 3:00 AM UTC. Deletes successful sync events older than 30 days
// and expired rate limit entries.
export const retentionCleanup = inngest.createFunction(
  { id: 'retention-cleanup' },
  { cron: '0 3 * * *' },
  async ({ step }) => {
    const deletedSyncEvents = await step.run('cleanup-sync-events', async () => {
      // Delete successful/pending events older than 30 days
      const successCount = await deleteOldSyncEvents(30)
      // Delete failed events older than 90 days
      const failedCount = await deleteOldSyncEvents(90, { includeFailures: true })
      return { success: successCount, failed: failedCount }
    })

    const deletedRateLimits = await step.run('cleanup-rate-limits', async () => {
      const { createServerClient } = await import('@/lib/supabase/client')
      const supabase = createServerClient()
      const { error } = await supabase
        .from('rate_limit_entries')
        .delete()
        .lt('reset_at', new Date().toISOString())
      return error ? 0 : 1
    })

    const deletedSessions = await step.run('cleanup-expired-sessions', async () => {
      const { createServerClient } = await import('@/lib/supabase/client')
      const supabase = createServerClient()
      const cutoff = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
      const { error } = await supabase
        .from('admin_sessions')
        .delete()
        .lt('created_at', cutoff)
      return error ? 0 : 1
    })

    console.log('[Retention] Cleanup complete:', {
      syncEvents: deletedSyncEvents,
      rateLimits: deletedRateLimits,
      sessions: deletedSessions,
    })

    return { syncEvents: deletedSyncEvents, rateLimits: deletedRateLimits, sessions: deletedSessions }
  }
)

export const functions = [orderSync, inventorySync, fulfillmentSync, healthCheck, retentionCleanup]
