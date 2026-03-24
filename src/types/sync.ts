// Sync Event Types for Supabase Logging

export type SyncStatus = 'pending' | 'processing' | 'success' | 'failed' | 'retry'
export type SyncType = 'order' | 'inventory' | 'fulfillment' | 'customer' | 'product'
export type SyncDirection = 'shopify_to_odoo' | 'odoo_to_shopify'

export interface SyncEvent {
  id?: string
  created_at?: string
  updated_at?: string
  type: SyncType
  direction: SyncDirection
  status: SyncStatus
  
  // Source identifiers
  shopify_id?: string
  odoo_id?: number
  
  // Payload storage
  source_payload?: Record<string, unknown>
  transformed_payload?: Record<string, unknown>
  
  // Error handling
  error_message?: string
  error_stack?: string
  retry_count?: number
  max_retries?: number
  next_retry_at?: string
  
  // Metadata
  webhook_id?: string
  job_id?: string
  processing_time_ms?: number
}

export interface SyncStats {
  total: number
  pending: number
  processing: number
  success: number
  failed: number
  retry: number
  avgProcessingTime: number
}

export interface SyncFilter {
  type?: SyncType
  direction?: SyncDirection
  status?: SyncStatus
  startDate?: string
  endDate?: string
  limit?: number
  offset?: number
}

export type SyncStreamMessageType =
  | 'snapshot'
  | 'upsert'
  | 'stats'
  | 'heartbeat'
  | 'error'

export interface SyncStreamSnapshotMessage {
  type: 'snapshot'
  at: string
  events: SyncEvent[]
  stats: SyncStats
}

export interface SyncStreamUpsertMessage {
  type: 'upsert'
  at: string
  event: SyncEvent
}

export interface SyncStreamStatsMessage {
  type: 'stats'
  at: string
  stats: SyncStats
}

export interface SyncStreamHeartbeatMessage {
  type: 'heartbeat'
  at: string
}

export interface SyncStreamErrorMessage {
  type: 'error'
  at: string
  message: string
}

export type SyncStreamMessage =
  | SyncStreamSnapshotMessage
  | SyncStreamUpsertMessage
  | SyncStreamStatsMessage
  | SyncStreamHeartbeatMessage
  | SyncStreamErrorMessage
