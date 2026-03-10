import { inngest } from './client'
import { transformShopifyOrderToOdoo } from '@/lib/transforms/order'
import { createSaleOrder, findOrderByShopifyId, cancelSaleOrder } from '@/lib/odoo/orders'
import { updateSyncStatus } from '@/lib/supabase/sync-events'
import type { ShopifyOrderWebhook } from '@/types/shopify'

// --- Order Sync Function ---
export const orderSync = inngest.createFunction(
  {
    id: 'order-sync',
    retries: 5,
  },
  { event: 'shop-oms/order.sync' },
  async ({ event, step }) => {
    const { type, shopifyOrder, syncEventId } = event.data
    const startTime = Date.now()

    await step.run('mark-processing', async () => {
      await updateSyncStatus(syncEventId, 'processing')
    })

    switch (type) {
      case 'order_create': {
        const order = shopifyOrder as unknown as ShopifyOrderWebhook

        const existingOrder = await step.run('check-existing', async () => {
          return findOrderByShopifyId(
            order.admin_graphql_api_id || order.id.toString()
          )
        })

        if (existingOrder) {
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
        const cancelOrder = shopifyOrder as unknown as ShopifyOrderWebhook

        const existing = await step.run('find-order-to-cancel', async () => {
          return findOrderByShopifyId(
            cancelOrder.admin_graphql_api_id || cancelOrder.id.toString()
          )
        })

        if (existing?.id) {
          const odooId = existing.id
          await step.run('cancel-in-odoo', async () => {
            await cancelSaleOrder(odooId)
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
  },
  { event: 'shop-oms/inventory.sync' },
  async ({ event, step }) => {
    const { syncEventId } = event.data
    const startTime = Date.now()

    await step.run('mark-processing', async () => {
      await updateSyncStatus(syncEventId, 'processing')
    })

    await step.run('sync-inventory', async () => {
      // TODO: find product in Odoo by SKU, update quantity
    })

    await step.run('log-success', async () => {
      await updateSyncStatus(syncEventId, 'success', {
        processing_time_ms: Date.now() - startTime,
      })
    })

    return { success: true }
  }
)

// --- Fulfillment Sync Function ---
export const fulfillmentSync = inngest.createFunction(
  {
    id: 'fulfillment-sync',
    retries: 5,
  },
  { event: 'shop-oms/fulfillment.sync' },
  async ({ event, step }) => {
    const { syncEventId } = event.data
    const startTime = Date.now()

    await step.run('mark-processing', async () => {
      await updateSyncStatus(syncEventId, 'processing')
    })

    await step.run('sync-fulfillment', async () => {
      // TODO: find order in Odoo, create/update delivery
    })

    await step.run('log-success', async () => {
      await updateSyncStatus(syncEventId, 'success', {
        processing_time_ms: Date.now() - startTime,
      })
    })

    return { success: true }
  }
)

export const functions = [orderSync, inventorySync, fulfillmentSync]
