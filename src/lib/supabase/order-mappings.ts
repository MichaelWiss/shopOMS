import { createServerClient } from './client'

const TABLE_NAME = 'order_mappings'

export interface OrderMapping {
  id?: string
  shopify_order_id: string
  shopify_order_number?: string
  odoo_order_id?: number
  odoo_order_name?: string
  status?: 'pending' | 'synced' | 'cancelled' | 'failed'
  created_at?: string
  synced_at?: string
}

export async function upsertOrderMapping(mapping: Omit<OrderMapping, 'id' | 'created_at'>): Promise<OrderMapping | null> {
  const supabase = createServerClient()

  const { data, error } = await supabase
    .from(TABLE_NAME)
    .upsert(
      {
        ...mapping,
        synced_at: mapping.odoo_order_id ? new Date().toISOString() : undefined,
      },
      { onConflict: 'shopify_order_id' }
    )
    .select()
    .single()

  if (error) {
    console.error('Failed to upsert order mapping:', error)
    return null
  }

  return data
}

export async function getOrderMappingByShopifyId(shopifyOrderId: string): Promise<OrderMapping | null> {
  const supabase = createServerClient()

  const { data, error } = await supabase
    .from(TABLE_NAME)
    .select('*')
    .eq('shopify_order_id', shopifyOrderId)
    .single()

  if (error) {
    if (error.code === 'PGRST116') return null // not found
    console.error('Failed to fetch order mapping:', error)
    return null
  }

  return data
}

export async function getOrderMappingByOdooId(odooOrderId: number): Promise<OrderMapping | null> {
  const supabase = createServerClient()

  const { data, error } = await supabase
    .from(TABLE_NAME)
    .select('*')
    .eq('odoo_order_id', odooOrderId)
    .single()

  if (error) {
    if (error.code === 'PGRST116') return null
    console.error('Failed to fetch order mapping:', error)
    return null
  }

  return data
}

export async function getOrderMappings(): Promise<OrderMapping[]> {
  const supabase = createServerClient()

  const { data, error } = await supabase
    .from(TABLE_NAME)
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Failed to fetch order mappings:', error)
    return []
  }

  return data ?? []
}
