import type {
  SyncFilter,
  SyncStatus,
  SyncStreamMessage,
  SyncType,
} from '@/types/sync'

const VALID_TYPES: readonly SyncType[] = [
  'order',
  'inventory',
  'fulfillment',
  'customer',
  'product',
]

const VALID_STATUSES: readonly SyncStatus[] = [
  'pending',
  'processing',
  'success',
  'failed',
  'retry',
]

export const SYNC_STREAM_CONFIG = {
  defaultLimit: 50,
  maxLimit: 200,
  maxRetainedRows: 200,
  pollIntervalMs: 2000,
  heartbeatMs: 15000,
  sseRetryMs: 3000,
  degradedPollMs: 10_000,
} as const

// Phase 1 lock-in: define intentional scope boundaries before implementation.
export const SYNC_STREAM_PHASE1_NON_GOALS = [
  'No Supabase Realtime auth redesign',
  'No new websocket transport dependencies',
  'No admin page visual redesign',
  'No pagination/filter semantics changes',
] as const

function parsePositiveInt(value: string | null, fallback: number): number {
  if (!value) return fallback
  const parsed = Number.parseInt(value, 10)
  if (!Number.isFinite(parsed) || parsed <= 0) return fallback
  return parsed
}

export function parseSyncFilterFromSearchParams(searchParams: URLSearchParams): SyncFilter {
  const filter: SyncFilter = {}

  const type = searchParams.get('type')
  if (type && VALID_TYPES.includes(type as SyncType)) {
    filter.type = type as SyncType
  }

  const status = searchParams.get('status')
  if (status && VALID_STATUSES.includes(status as SyncStatus)) {
    filter.status = status as SyncStatus
  }

  const startDate = searchParams.get('startDate')
  if (startDate) {
    filter.startDate = startDate
  }

  const endDate = searchParams.get('endDate')
  if (endDate) {
    filter.endDate = endDate
  }

  const limit = parsePositiveInt(searchParams.get('limit'), SYNC_STREAM_CONFIG.defaultLimit)
  filter.limit = Math.min(limit, SYNC_STREAM_CONFIG.maxLimit)

  const offsetRaw = searchParams.get('offset')
  if (offsetRaw) {
    const offset = Number.parseInt(offsetRaw, 10)
    if (Number.isFinite(offset) && offset >= 0) {
      filter.offset = offset
    }
  }

  return filter
}

export function toSseFrame(message: SyncStreamMessage): string {
  return `event: ${message.type}\ndata: ${JSON.stringify(message)}\n\n`
}
