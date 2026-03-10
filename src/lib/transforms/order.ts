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
    customizations?: Array<{ name: string; value: string }>
  }>
  metadata: {
    shopifyOrderId: string
    shopifyOrderNumber: string
  }
  /** Aggregated customization note for the entire order */
  note?: string
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

  // Transform line items (filter out items with no Odoo product mapping)
  const resolvedLines = await Promise.all(
    shopifyOrder.line_items.map(async (item) => {
      // Try to find product by SKU in Odoo
      const odooProduct = item.sku ? await findProductBySku(item.sku) : null

      if (!odooProduct?.id) {
        console.warn(
          `[OrderTransform] No Odoo product found for SKU "${item.sku}" (Shopify item: ${item.title}, ID: ${item.id}). ` +
          `This line item will be skipped. Ensure the product is mapped in Odoo.`
        )
        return null
      }

      const originalPrice = parseFloat(item.price) || 0
      const totalDiscount = parseFloat(item.total_discount) || 0
      const discountPercent = originalPrice > 0 && item.quantity > 0
        ? (totalDiscount / (originalPrice * item.quantity)) * 100 
        : 0

      // Extract customization properties (filter out internal Shopify props starting with _)
      const customizations = (item.properties || [])
        .filter(p => p.name && !p.name.startsWith('_'))
        .map(p => ({ name: p.name, value: p.value }))

      // Build descriptive name with customization details
      let lineName = item.title
      if (customizations.length > 0) {
        const customStr = customizations.map(c => `${c.name}: ${c.value}`).join(', ')
        lineName = `${item.title} (${customStr})`
      }

      return {
        productId: odooProduct.id,
        name: lineName,
        quantity: item.quantity,
        priceUnit: originalPrice,
        discount: discountPercent,
        customizations: customizations.length > 0 ? customizations : undefined,
      }
    })
  )

  // Filter out line items that couldn't be mapped to Odoo products
  const orderLines = resolvedLines.filter(
    (line): line is NonNullable<typeof line> => line !== null
  )

  if (orderLines.length === 0) {
    throw new Error(
      `[OrderTransform] No line items could be mapped to Odoo products for order ${shopifyOrder.name}. ` +
      `Ensure product SKUs are configured in Odoo.`
    )
  }

  if (!partner.id) {
    throw new Error(
      `[OrderTransform] Failed to resolve Odoo partner ID for order ${shopifyOrder.name} (email: ${email}).`
    )
  }

  // Build order-level note with all customization details
  const linesWithCustomizations = orderLines.filter(l => l.customizations && l.customizations.length > 0)
  let note: string | undefined
  if (linesWithCustomizations.length > 0) {
    const sections = linesWithCustomizations.map(line => {
      const details = line.customizations!.map(c => `  - ${c.name}: ${c.value}`).join('\n')
      return `${line.name.split(' (')[0]}:\n${details}`
    })
    note = `Customization Details:\n${sections.join('\n\n')}`
  }

  return {
    partnerId: partner.id,
    orderLines,
    metadata: {
      shopifyOrderId: shopifyOrder.admin_graphql_api_id || shopifyOrder.id.toString(),
      shopifyOrderNumber: shopifyOrder.name,
    },
    note,
  }
}


