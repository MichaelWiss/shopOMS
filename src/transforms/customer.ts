import type { ShopifyOrderWebhook, ShopifyAddress, ShopifyCustomer } from '@/types/shopify'
import type { OdooPartner } from '@/types/odoo'

/**
 * Transform a Shopify customer + address into an Odoo res.partner record.
 *
 * Odoo requires at minimum: name, email.
 * We populate address fields from shipping_address (preferred) or billing_address.
 */
export function transformCustomerToPartner(
  order: ShopifyOrderWebhook
): Omit<OdooPartner, 'id'> {
  const customer = order.customer
  const address = order.shipping_address ?? order.billing_address

  const name = buildCustomerName(customer, address, order.email)

  return {
    name,
    email: customer?.email ?? order.email,
    phone: customer?.phone ?? address?.phone ?? undefined,
    shopify_customer_id: customer?.id?.toString(),
    customer_rank: 1,
    ...transformAddress(address),
  }
}

/**
 * Build a display name from whichever source has data.
 * Priority: customer name > address name > email local part.
 */
function buildCustomerName(
  customer: ShopifyCustomer | null,
  address: ShopifyAddress | null,
  email: string
): string {
  if (customer?.first_name || customer?.last_name) {
    return [customer.first_name, customer.last_name].filter(Boolean).join(' ')
  }

  if (address?.first_name || address?.last_name) {
    return [address.first_name, address.last_name].filter(Boolean).join(' ')
  }

  // Fallback to email local-part
  return email.split('@')[0]
}

/**
 * Map a Shopify address to Odoo partner address fields.
 * Returns an empty object when no address is available.
 */
export function transformAddress(
  address: ShopifyAddress | null | undefined
): Partial<OdooPartner> {
  if (!address) return {}

  return {
    street: address.address1 || undefined,
    street2: address.address2 ?? undefined,
    city: address.city || undefined,
    zip: address.zip || undefined,
    // Note: state_id and country_id require Odoo lookups at runtime
    // to resolve codes → IDs. Store raw codes as metadata for now.
    // The Odoo integration layer will resolve them.
  }
}

/**
 * Build a shipping-specific partner (child) from the shipping address.
 * In Odoo, shipping addresses can be stored as child contacts of the
 * main partner with type = 'delivery'.
 */
export function transformShippingAddress(
  address: ShopifyAddress | null,
  parentPartnerId: number
): Omit<OdooPartner, 'id'> | null {
  if (!address) return null

  const name = [address.first_name, address.last_name].filter(Boolean).join(' ')

  return {
    name: name || 'Shipping Address',
    email: '',
    phone: address.phone ?? undefined,
    street: address.address1 || undefined,
    street2: address.address2 ?? undefined,
    city: address.city || undefined,
    zip: address.zip || undefined,
    customer_rank: 0,
  }
}
