import { createServerClient } from './client'
import type { InventorySnapshot, InventoryFilter, InventorySnapshotStatus } from '@/types/sync'

const TABLE = 'inventory_snapshots'

export async function upsertInventorySnapshot(
  snapshot: Omit<InventorySnapshot, 'id' | 'drift' | 'created_at' | 'updated_at'>
): Promise<InventorySnapshot | null> {
  const supabase = createServerClient()
  const { data, error } = await supabase
    .from(TABLE)
    .upsert(
      { ...snapshot, updated_at: new Date().toISOString() },
      { onConflict: 'sku,location_id' }
    )
    .select()
    .single()

  if (error) {
    console.error('Failed to upsert inventory snapshot:', error)
    return null
  }
  return data
}

export async function getInventorySnapshots(filter: InventoryFilter = {}): Promise<InventorySnapshot[]> {
  const supabase = createServerClient()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let query: any = supabase.from(TABLE).select('*').order('sku', { ascending: true })

  if (filter.sku) query = query.ilike('sku', `%${filter.sku}%`)
  if (filter.location_id) query = query.eq('location_id', filter.location_id)
  if (filter.status) query = query.eq('status', filter.status)
  if (filter.driftOnly) query = query.neq('drift', 0)
  if (filter.limit) query = query.limit(filter.limit)
  if (filter.offset && filter.limit) {
    query = query.range(filter.offset, filter.offset + filter.limit - 1)
  }

  const { data, error } = await query
  if (error) {
    console.error('Failed to fetch inventory snapshots:', error)
    return []
  }
  return data ?? []
}

export async function getInventorySnapshotBySku(
  sku: string,
  locationId: string
): Promise<InventorySnapshot | null> {
  const supabase = createServerClient()
  const { data, error } = await supabase
    .from(TABLE)
    .select('*')
    .eq('sku', sku)
    .eq('location_id', locationId)
    .maybeSingle()

  if (error) {
    console.error('Failed to fetch inventory snapshot:', error)
    return null
  }
  return data
}

export async function updateInventorySnapshotStatus(
  sku: string,
  locationId: string,
  status: InventorySnapshotStatus,
  extra?: Partial<Omit<InventorySnapshot, 'id' | 'drift' | 'created_at'>>
): Promise<InventorySnapshot | null> {
  const supabase = createServerClient()
  const { data, error } = await supabase
    .from(TABLE)
    .update({ status, ...extra, updated_at: new Date().toISOString() })
    .eq('sku', sku)
    .eq('location_id', locationId)
    .select()
    .maybeSingle()

  if (error) {
    console.error('Failed to update inventory snapshot status:', error)
    return null
  }
  return data
}
