import { NextRequest } from 'next/server'
import { handleShopifyWebhook } from '@/lib/shopify/webhook-handler'
import { ShopifyInventoryWebhookSchema } from '@/lib/schemas'
import type { ShopifyInventoryWebhook } from '@/types/shopify'

export async function POST(request: NextRequest) {
  return handleShopifyWebhook(request, {
    syncType: 'inventory',
    inngestEvent: 'shop-oms/inventory.sync',
    logLabel: 'Inventory updated',
    schema: ShopifyInventoryWebhookSchema,
    extractShopifyId: (p) => {
      const inv = p as unknown as ShopifyInventoryWebhook
      return inv.inventory_item_id.toString()
    },
    buildEventData: (payload, syncEventId, webhookId) => ({
      type: 'inventory_update',
      inventoryData: payload,
      syncEventId,
      webhookId,
    }),
  })
}
