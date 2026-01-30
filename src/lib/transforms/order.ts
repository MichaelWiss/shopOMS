import type { ShopifyOrderWebhook } from '@/types/shopify'
import type { OdooSaleOrder, OdooSaleOrderLine } from '@/types/odoo'
import { findProductBySku } from '@/lib/odoo/products'
import { getOrCreatePartner } from '@/lib/odoo/partners'

interface TransformedOrder {
  partnerId: number
  orderLines: Array<{
    productId: number
    name: string
    quantity: number
    priceUnit: number
    discount?: number
  }>
  metadata: {
    shopifyOrderId: string
    shopifyOrderNumber: string
  }
}

/**
 * Transform Shopify order webhook payload to Odoo sale order format
 */
export async function transformShopifyOrderToOdoo(
  shopifyOrder: ShopifyOrderWebhook
): Promise<TransformedOrder> {
  // Get or create customer in Odoo
  const customerName = shopifyOrder.customer
    ? `${shopifyOrder.customer.first_name} ${shopifyOrder.customer.last_name}`
    : shopifyOrder.billing_address
      ? `${shopifyOrder.billing_address.first_name} ${shopifyOrder.billing_address.last_name}`
      : `Guest Customer #${shopifyOrder.order_number}`

  const email = shopifyOrder.email || shopifyOrder.customer?.email || `guest-${shopifyOrder.order_number}@placeholder.com`
  const shopifyCustomerId = shopifyOrder.customer?.id?.toString()

  // Build address data
  const address = shopifyOrder.shipping_address || shopifyOrder.billing_address
  const addressData = address
    ? {
        street: address.address1,
        street2: address.address2 || undefined,
        city: address.city,
        zip: address.zip,
        phone: address.phone || undefined,
      }
    : {}

  const partner = await getOrCreatePartner(email, customerName, shopifyCustomerId, addressData)

  // Transform line items
  const orderLines = await Promise.all(
    shopifyOrder.line_items.map(async (item) => {
      // Try to find product by SKU in Odoo
      const odooProduct = item.sku ? await findProductBySku(item.sku) : null

      const originalPrice = parseFloat(item.price)
      const totalDiscount = parseFloat(item.total_discount)
      const discountPercent = originalPrice > 0 
        ? (totalDiscount / (originalPrice * item.quantity)) * 100 
        : 0

      return {
        productId: odooProduct?.id || 1, // Fallback to generic product if not mapped
        name: item.title,
        quantity: item.quantity,
        priceUnit: originalPrice,
        discount: discountPercent,
      }
    })
  )

  return {
    partnerId: partner.id!,
    orderLines,
    metadata: {
      shopifyOrderId: shopifyOrder.admin_graphql_api_id || shopifyOrder.id.toString(),
      shopifyOrderNumber: shopifyOrder.name,
    },
  }
}

/**
 * Calculate order totals for validation
 */
export function calculateOrderTotals(shopifyOrder: ShopifyOrderWebhook) {
  const subtotal = parseFloat(shopifyOrder.subtotal_price)
  const tax = parseFloat(shopifyOrder.total_tax)
  const total = parseFloat(shopifyOrder.total_price)
  const discount = parseFloat(shopifyOrder.total_discounts)

  return {
    subtotal,
    tax,
    total,
    discount,
    itemCount: shopifyOrder.line_items.reduce((sum, item) => sum + item.quantity, 0),
  }
}
