import type { ShopifyCustomer } from '@/types/shopify'
import type { OdooPartner } from '@/types/odoo'

/**
 * Transform Shopify customer to Odoo partner format
 */
export function transformShopifyCustomerToOdoo(
  customer: ShopifyCustomer
): Omit<OdooPartner, 'id'> {
  return {
    name: `${customer.first_name} ${customer.last_name}`.trim() || customer.email,
    email: customer.email,
    phone: customer.phone || undefined,
    shopify_customer_id: customer.id.toString(),
    customer_rank: 1,
  }
}
