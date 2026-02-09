import { create, execute, searchRead, write } from './client'
import type { OdooSaleOrder, OdooSaleOrderLine } from '@/types/odoo'

const MODEL = 'sale.order'
const LINE_MODEL = 'sale.order.line'

/**
 * Create a new sale order in Odoo
 */
export async function createSaleOrder(
  partnerId: number,
  orderLines: Array<{
    productId: number
    name: string
    quantity: number
    priceUnit: number
    discount?: number
  }>,
  metadata?: {
    shopifyOrderId?: string
    shopifyOrderNumber?: string
  }
): Promise<number> {
  const lines: Array<[number, number, OdooSaleOrderLine]> = orderLines.map(line => [
    0,  // Create new record
    0,  // No ID (new record)
    {
      product_id: line.productId,
      name: line.name,
      product_uom_qty: line.quantity,
      price_unit: line.priceUnit,
      discount: line.discount || 0,
    },
  ])

  const orderData: OdooSaleOrder = {
    partner_id: partnerId,
    order_line: lines,
    ...(metadata?.shopifyOrderId && { shopify_order_id: metadata.shopifyOrderId }),
    ...(metadata?.shopifyOrderNumber && { shopify_order_number: metadata.shopifyOrderNumber }),
  }

  return create(MODEL, orderData as unknown as Record<string, unknown>)
}

/**
 * Get sale order by ID
 */
export async function getSaleOrder(orderId: number): Promise<OdooSaleOrder | null> {
  const orders = await searchRead<OdooSaleOrder>(
    MODEL,
    [['id', '=', orderId]],
    {
      fields: [
        'id', 'name', 'partner_id', 'date_order', 'state',
        'amount_total', 'amount_tax', 'amount_untaxed',
        'shopify_order_id', 'shopify_order_number',
      ],
      limit: 1,
    }
  )
  return orders[0] || null
}

/**
 * Find sale order by Shopify order ID
 */
export async function findOrderByShopifyId(shopifyOrderId: string): Promise<OdooSaleOrder | null> {
  const orders = await searchRead<OdooSaleOrder>(
    MODEL,
    [['shopify_order_id', '=', shopifyOrderId]],
    {
      fields: ['id', 'name', 'state', 'partner_id'],
      limit: 1,
    }
  )
  return orders[0] || null
}

/**
 * Confirm a sale order (draft -> sale).
 * Uses Odoo's action_confirm RPC method to trigger proper business logic
 * (inventory reservation, invoicing workflows, etc.).
 */
export async function confirmSaleOrder(orderId: number): Promise<boolean> {
  return execute<boolean>(MODEL, 'action_confirm', [[orderId]])
}

/**
 * Cancel a sale order.
 * Uses Odoo's action_cancel RPC method to trigger proper business logic
 * (inventory unreservation, cancellation workflows, etc.).
 */
export async function cancelSaleOrder(orderId: number): Promise<boolean> {
  return execute<boolean>(MODEL, 'action_cancel', [[orderId]])
}

/**
 * Get recent orders
 */
export async function getRecentOrders(limit: number = 50): Promise<OdooSaleOrder[]> {
  return searchRead<OdooSaleOrder>(
    MODEL,
    [],
    {
      fields: [
        'id', 'name', 'partner_id', 'date_order', 'state',
        'amount_total', 'shopify_order_id',
      ],
      limit,
      order: 'date_order desc',
    }
  )
}
