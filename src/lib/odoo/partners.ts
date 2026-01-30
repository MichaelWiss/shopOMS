import { create, searchRead, write } from './client'
import type { OdooPartner } from '@/types/odoo'

const MODEL = 'res.partner'

/**
 * Create a new partner (customer) in Odoo
 */
export async function createPartner(partner: Omit<OdooPartner, 'id'>): Promise<number> {
  return create(MODEL, {
    ...partner,
    customer_rank: 1,  // Mark as customer
  })
}

/**
 * Get partner by ID
 */
export async function getPartner(partnerId: number): Promise<OdooPartner | null> {
  const partners = await searchRead<OdooPartner>(
    MODEL,
    [['id', '=', partnerId]],
    {
      fields: [
        'id', 'name', 'email', 'phone', 'street', 'street2',
        'city', 'state_id', 'country_id', 'zip', 'shopify_customer_id',
      ],
      limit: 1,
    }
  )
  return partners[0] || null
}

/**
 * Find partner by email
 */
export async function findPartnerByEmail(email: string): Promise<OdooPartner | null> {
  const partners = await searchRead<OdooPartner>(
    MODEL,
    [['email', '=', email]],
    {
      fields: ['id', 'name', 'email', 'shopify_customer_id'],
      limit: 1,
    }
  )
  return partners[0] || null
}

/**
 * Find partner by Shopify customer ID
 */
export async function findPartnerByShopifyId(shopifyCustomerId: string): Promise<OdooPartner | null> {
  const partners = await searchRead<OdooPartner>(
    MODEL,
    [['shopify_customer_id', '=', shopifyCustomerId]],
    {
      fields: ['id', 'name', 'email', 'shopify_customer_id'],
      limit: 1,
    }
  )
  return partners[0] || null
}

/**
 * Update partner
 */
export async function updatePartner(partnerId: number, data: Partial<OdooPartner>): Promise<boolean> {
  return write(MODEL, [partnerId], data as Record<string, unknown>)
}

/**
 * Get or create partner by email
 * Returns existing partner if found, creates new one otherwise
 */
export async function getOrCreatePartner(
  email: string,
  name: string,
  shopifyCustomerId?: string,
  address?: Partial<OdooPartner>
): Promise<OdooPartner> {
  // First try to find by Shopify ID
  if (shopifyCustomerId) {
    const existingByShopify = await findPartnerByShopifyId(shopifyCustomerId)
    if (existingByShopify) {
      return existingByShopify
    }
  }

  // Then try by email
  const existingByEmail = await findPartnerByEmail(email)
  if (existingByEmail) {
    // Update Shopify ID if not set
    if (shopifyCustomerId && !existingByEmail.shopify_customer_id) {
      await updatePartner(existingByEmail.id!, { shopify_customer_id: shopifyCustomerId })
    }
    return existingByEmail
  }

  // Create new partner
  const partnerId = await createPartner({
    name,
    email,
    shopify_customer_id: shopifyCustomerId,
    ...address,
  })

  return {
    id: partnerId,
    name,
    email,
    shopify_customer_id: shopifyCustomerId,
    ...address,
  }
}
