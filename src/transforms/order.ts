import type {
  ShopifyOrderWebhook,
  ShopifyOrderLineItem,
} from '@/types/shopify'
import type { OdooSaleOrder, OdooSaleOrderLine } from '@/types/odoo'

// ─── Field-mapping reference ────────────────────────────────────────
//
//  Shopify order (REST webhook)       →  Odoo sale.order
//  ─────────────────────────────────  →  ───────────────────────
//  id / admin_graphql_api_id          →  shopify_order_id
//  name  ("#1001")                    →  shopify_order_number
//  created_at                         →  date_order
//  customer → (res.partner lookup)    →  partner_id
//  shipping_address                   →  partner_shipping_id
//  billing_address                    →  partner_invoice_id
//  line_items[].product_id + sku      →  order_line[].product_id  (via product mapping)
//  line_items[].title                 →  order_line[].name
//  line_items[].quantity              →  order_line[].product_uom_qty
//  line_items[].price                 →  order_line[].price_unit
//  line_items[].total_discount        →  order_line[].discount    (calculated %)
//
// ─────────────────────────────────────────────────────────────────────

/**
 * Context needed to resolve Shopify IDs into Odoo IDs.
 * The caller is responsible for looking these up before calling transform.
 */
export interface OrderTransformContext {
  /** Odoo partner ID already resolved for this customer */
  partnerId: number
  /** Odoo partner ID for the shipping address (child contact), if any */
  shippingPartnerId?: number
  /** Odoo partner ID for the billing address (child contact), if any */
  invoicePartnerId?: number
  /**
   * Mapping of Shopify product_id → Odoo product_id.
   * Unmapped products will use a fallback (see transformLineItem).
   */
  productIdMap: Record<number, number>
  /** Odoo ID of a generic fallback product for unmapped items */
  fallbackProductId?: number
}

/**
 * Transform a full Shopify order webhook payload into an Odoo sale.order
 * object ready to be created via `create('sale.order', ...)`.
 *
 * The returned value does NOT include `partner_id` as an integer directly;
 * it follows the [id] convention expected by `createSaleOrder()`.
 */
export function transformOrderToSaleOrder(
  order: ShopifyOrderWebhook,
  ctx: OrderTransformContext
): OdooSaleOrder {
  const lines: Array<[number, number, OdooSaleOrderLine]> = order.line_items.map(
    (item) => [
      0, // 0 = create
      0, // virtual ID (ignored on create)
      transformLineItem(item, ctx),
    ]
  )

  const saleOrder: OdooSaleOrder = {
    partner_id: ctx.partnerId,
    date_order: formatOdooDatetime(order.created_at),
    order_line: lines,
    shopify_order_id: order.admin_graphql_api_id || order.id.toString(),
    shopify_order_number: order.name,
  }

  // Separate shipping / invoice addresses when available
  if (ctx.shippingPartnerId) {
    saleOrder.partner_shipping_id = ctx.shippingPartnerId
  }
  if (ctx.invoicePartnerId) {
    saleOrder.partner_invoice_id = ctx.invoicePartnerId
  }

  return saleOrder
}

/**
 * Transform a single Shopify line item → Odoo sale.order.line values.
 */
export function transformLineItem(
  item: ShopifyOrderLineItem,
  ctx: OrderTransformContext
): OdooSaleOrderLine {
  const odooProductId =
    ctx.productIdMap[item.product_id] ?? ctx.fallbackProductId

  if (!odooProductId) {
    throw new MappingError(
      `No Odoo product mapping for Shopify product ${item.product_id} (SKU: ${item.sku}). ` +
        'Provide a productIdMap entry or a fallbackProductId.'
    )
  }

  return {
    product_id: odooProductId,
    name: buildLineDescription(item),
    product_uom_qty: item.quantity,
    price_unit: parseFloat(item.price),
    discount: computeDiscountPercent(item),
  }
}

// ─── Helpers ─────────────────────────────────────────────────────────

/**
 * Build a human-readable line description.
 * If a SKU exists, append it for easy reference.
 */
function buildLineDescription(item: ShopifyOrderLineItem): string {
  if (item.sku) {
    return `${item.title} [${item.sku}]`
  }
  return item.title
}

/**
 * Compute discount as a percentage of the unit price.
 *
 * Shopify gives `total_discount` as an absolute amount over all units.
 * Odoo expects a percentage per-unit.
 *
 *   discountPct = (total_discount / (price × qty)) × 100
 *
 * Returns 0 when there is no discount or price is zero.
 */
export function computeDiscountPercent(item: ShopifyOrderLineItem): number {
  const totalDiscount = parseFloat(item.total_discount)
  if (!totalDiscount || totalDiscount <= 0) return 0

  const lineTotal = parseFloat(item.price) * item.quantity
  if (lineTotal <= 0) return 0

  const pct = (totalDiscount / lineTotal) * 100
  // Round to 2 decimals to avoid floating-point noise
  return Math.round(pct * 100) / 100
}

/**
 * Convert an ISO-8601 string (Shopify) to the datetime format Odoo expects.
 * Odoo XML-RPC accepts ISO strings or "YYYY-MM-DD HH:MM:SS" (UTC).
 */
export function formatOdooDatetime(iso: string): string {
  const d = new Date(iso)
  const pad = (n: number) => n.toString().padStart(2, '0')
  return (
    `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())} ` +
    `${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())}:${pad(d.getUTCSeconds())}`
  )
}

/**
 * Custom error for mapping failures.
 * Callers can catch this specifically to decide on retry vs. dead-letter.
 */
export class MappingError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'MappingError'
  }
}
