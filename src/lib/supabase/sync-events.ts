import { createServerClient } from './client'
import type { SyncEvent, SyncFilter, SyncStats, SyncStatus } from '@/types/sync'

const TABLE_NAME = 'sync_events'

export async function createSyncEvent(event: Omit<SyncEvent, 'id' | 'created_at' | 'updated_at'>): Promise<SyncEvent | null> {
  const supabase = createServerClient()
  
  const { data, error } = await supabase
    .from(TABLE_NAME)
    .insert({
      ...event,
      retry_count: event.retry_count ?? 0,
      max_retries: event.max_retries ?? 3,
    })
    .select()
    .single()

  if (error) {
    console.error('Failed to create sync event:', error)
    return null
  }

  return data
}

export async function updateSyncEvent(
  id: string,
  updates: Partial<SyncEvent>
): Promise<SyncEvent | null> {
  const supabase = createServerClient()
  
  const { data, error } = await supabase
    .from(TABLE_NAME)
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('Failed to update sync event:', error)
    return null
  }

  return data
}

export async function updateSyncStatus(
  id: string,
  status: SyncStatus,
  extra?: Partial<SyncEvent>
): Promise<SyncEvent | null> {
  return updateSyncEvent(id, { status, ...extra })
}

export async function getSyncEvents(filter: SyncFilter = {}): Promise<SyncEvent[]> {
  const supabase = createServerClient()
  
  let query = supabase
    .from(TABLE_NAME)
    .select('*')
    .order('created_at', { ascending: false })

  if (filter.type) {
    query = query.eq('type', filter.type)
  }
  if (filter.direction) {
    query = query.eq('direction', filter.direction)
  }
  if (filter.status) {
    query = query.eq('status', filter.status)
  }
  if (filter.startDate) {
    query = query.gte('created_at', filter.startDate)
  }
  if (filter.endDate) {
    query = query.lte('created_at', filter.endDate)
  }
  if (filter.limit) {
    query = query.limit(filter.limit)
  }
  if (filter.offset) {
    query = query.range(filter.offset, filter.offset + (filter.limit || 50) - 1)
  }

  const { data, error } = await query

  if (error) {
    console.error('Failed to fetch sync events:', error)
    return []
  }

  return data || []
}

export async function getSyncStats(): Promise<SyncStats> {
  const supabase = createServerClient()
  
  const { data, error } = await supabase
    .from(TABLE_NAME)
    .select('status, processing_time_ms')

  if (error || !data) {
    return {
      total: 0,
      pending: 0,
      processing: 0,
      success: 0,
      failed: 0,
      retry: 0,
      avgProcessingTime: 0,
    }
  }

  const stats: SyncStats = {
    total: data.length,
    pending: 0,
    processing: 0,
    success: 0,
    failed: 0,
    retry: 0,
    avgProcessingTime: 0,
  }

  let totalProcessingTime = 0
  let processedCount = 0

  for (const event of data) {
    switch (event.status) {
      case 'pending':
        stats.pending++
        break
      case 'processing':
        stats.processing++
        break
      case 'success':
        stats.success++
        break
      case 'failed':
        stats.failed++
        break
      case 'retry':
        stats.retry++
        break
    }

    if (event.processing_time_ms) {
      totalProcessingTime += event.processing_time_ms
      processedCount++
    }
  }

  stats.avgProcessingTime = processedCount > 0 ? totalProcessingTime / processedCount : 0

  return stats
}

export async function getFailedSyncsForRetry(): Promise<SyncEvent[]> {
  const supabase = createServerClient()
  
  const { data, error } = await supabase
    .from(TABLE_NAME)
    .select('*')
    .eq('status', 'retry')
    .lt('next_retry_at', new Date().toISOString())
    .order('next_retry_at', { ascending: true })
    .limit(100)

  if (error) {
    console.error('Failed to fetch retryable syncs:', error)
    return []
  }

  return data || []
}

export async function getSyncEventById(id: string): Promise<SyncEvent | null> {
  const supabase = createServerClient()

  const { data, error } = await supabase
    .from(TABLE_NAME)
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    console.error('Failed to fetch sync event:', error)
    return null
  }

  return data
}

export async function getFailedSyncEvents(): Promise<SyncEvent[]> {
  const supabase = createServerClient()

  const { data, error } = await supabase
    .from(TABLE_NAME)
    .select('*')
    .in('status', ['failed', 'retry'])
    .order('created_at', { ascending: false })
    .limit(50)

  if (error) {
    console.error('Failed to fetch failed sync events:', error)
    return []
  }

  return data || []
}

/**
 * Delete sync events older than the specified number of days.
 * Only deletes completed (success) events by default to keep failures for debugging.
 * Returns the count of deleted rows.
 */
export async function deleteOldSyncEvents(
  olderThanDays: number,
  { includeFailures = false }: { includeFailures?: boolean } = {}
): Promise<number> {
  const supabase = createServerClient()
  const cutoff = new Date(Date.now() - olderThanDays * 24 * 60 * 60 * 1000).toISOString()

  // Count matching rows first
  let countQuery = supabase
    .from(TABLE_NAME)
    .select('id', { count: 'exact', head: true })
    .lt('created_at', cutoff)

  if (!includeFailures) {
    countQuery = countQuery.in('status', ['success', 'pending'])
  }

  const { count } = await countQuery

  // Perform the delete
  let deleteQuery = supabase
    .from(TABLE_NAME)
    .delete()
    .lt('created_at', cutoff)

  if (!includeFailures) {
    deleteQuery = deleteQuery.in('status', ['success', 'pending'])
  }

  const { error } = await deleteQuery

  if (error) {
    console.error('Failed to delete old sync events:', error)
    return 0
  }

  return count ?? 0
}
