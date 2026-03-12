import { NextRequest } from 'next/server'
import { handleShopifyWebhook } from '@/lib/shopify/webhook-handler'
import { ShopifyOrderWebhookSchema } from '@/lib/schemas'
import type { ShopifyOrderWebhook } from '@/types/shopify'

export async function POST(request: NextRequest) {
  return handleShopifyWebhook(request, {
    syncType: 'order',
    inngestEvent: 'shop-oms/order.sync',
    logLabel: 'Order created',
    schema: ShopifyOrderWebhookSchema,
    extractShopifyId: (p) => {
      const order = p as unknown as ShopifyOrderWebhook
      return order.admin_graphql_api_id || order.id.toString()
    },
    buildEventData: (payload, syncEventId, webhookId) => ({
      type: 'order_create',
      shopifyOrder: payload,
      syncEventId,
      webhookId,
    }),
  })
}
