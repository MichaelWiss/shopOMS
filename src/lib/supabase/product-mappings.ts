import { createServerClient } from './client'
import type { ProductMapping, MappingFilter } from '@/types/sync'

const TABLE = 'product_mappings'

export async function upsertProductMapping(
  mapping: Omit<ProductMapping, 'id' | 'created_at' | 'updated_at'>
): Promise<ProductMapping | null> {
  const supabase = createServerClient()
  const { data, error } = await supabase
    .from(TABLE)
    .upsert(
      { ...mapping, updated_at: new Date().toISOString() },
      { onConflict: 'sku' }
    )
    .select()
    .single()

  if (error) {
    console.error('Failed to upsert product mapping:', error)
    return null
  }
  return data
}

export async function getProductMappings(filter: MappingFilter = {}): Promise<ProductMapping[]> {
  const supabase = createServerClient()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let query: any = supabase.from(TABLE).select('*').order('sku', { ascending: true })

  if (filter.sku) query = query.ilike('sku', `%${filter.sku}%`)
  if (filter.status) query = query.eq('mapping_status', filter.status)
  if (filter.missingOnly) query = query.in('mapping_status', ['missing_odoo', 'missing_sku', 'error'])
  if (filter.limit) query = query.limit(filter.limit)
  if (filter.offset && filter.limit) {
    query = query.range(filter.offset, filter.offset + filter.limit - 1)
  }

  const { data, error } = await query
  if (error) {
    console.error('Failed to fetch product mappings:', error)
    return []
  }
  return data ?? []
}

export async function getProductMappingBySku(sku: string): Promise<ProductMapping | null> {
  const supabase = createServerClient()
  const { data, error } = await supabase
    .from(TABLE)
    .select('*')
    .eq('sku', sku)
    .maybeSingle()

  if (error) {
    console.error('Failed to fetch product mapping:', error)
    return null
  }
  return data
}
