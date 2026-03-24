'use client'

import { Suspense } from 'react'
import { CheckCircle, AlertTriangle, Clock, RefreshCw } from 'lucide-react'
import { useSyncEventsLive } from '@/hooks/useSyncEventsLive'
import { RetryButton } from '@/components/SyncActions'
import { SyncPagination } from '@/components/SyncFilters'
import type { SyncEvent, SyncFilter, SyncStats } from '@/types/sync'
import type { LiveConnectionState } from '@/hooks/useSyncEventsLive'

export interface SyncEventsLiveProps {
  initialEvents: SyncEvent[]
  initialStats: SyncStats
  filter: SyncFilter
  searchQuery: string
  currentPage: number
  pageSize: number
}

// ── Formatting helpers ────────────────────────────────────────────────────────

function formatDirection(direction: string): string {
  const [source, target] = direction.split('_to_')
  return `${source.charAt(0).toUpperCase() + source.slice(1)} → ${target.charAt(0).toUpperCase() + target.slice(1)}`
}

function formatDuration(ms: number | null | undefined): string {
  if (!ms) return '—'
  if (ms < 1000) return `${ms}ms`
  return `${(ms / 1000).toFixed(1)}s`
}

function formatTimestamp(date: string | undefined): string {
  if (!date) return '—'
  return new Date(date).toLocaleString('en-US', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })
}

function getEventDetails(event: SyncEvent): string {
  if (event.error_message) {
    const msg = event.error_message
    return msg.length > 50 ? `${msg.slice(0, 50)}…` : msg
  }
  if (event.odoo_id && event.shopify_id) {
    return `Shopify ${event.shopify_id.slice(-8)} → Odoo ${event.odoo_id}`
  }
  if (event.shopify_id) {
    return `Shopify ${event.shopify_id.slice(-8)}`
  }
  return event.type
}

// ── Live status badge ─────────────────────────────────────────────────────────

function LiveIndicator({
  state,
  onRetry,
}: {
  state: LiveConnectionState
  onRetry: () => void
}) {
  if (state === 'live') {
    return (
      <span className="flex items-center gap-1.5 text-[11px] text-[#10B981]">
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#10B981] opacity-75" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-[#10B981]" />
        </span>
        Live
      </span>
    )
  }

  if (state === 'degraded') {
    return (
      <button
        onClick={onRetry}
        className="flex items-center gap-1.5 text-[11px] text-[#F59E0B] hover:text-[#D97706] transition-colors"
        aria-label="Polling mode, click to try live reconnect"
      >
        <RefreshCw className="h-3 w-3" />
        Polling (no live connection)
      </button>
    )
  }

  if (state === 'error') {
    return (
      <button
        onClick={onRetry}
        className="flex items-center gap-1.5 text-[11px] text-[#EF4444] hover:text-[#DC2626] transition-colors"
        aria-label="Stream disconnected, click to reconnect"
      >
        <AlertTriangle className="h-3 w-3" />
        Stream disconnected — click to reconnect
      </button>
    )
  }

  return (
    <span className="flex items-center gap-1.5 text-[11px] text-[#999]">
      <RefreshCw className="h-3 w-3 animate-spin" aria-hidden="true" />
      Connecting…
    </span>
  )
}

// ── Main component ─────────────────────────────────────────────────────────────

export function SyncEventsLive({
  initialEvents,
  initialStats,
  filter,
  searchQuery,
  currentPage,
  pageSize,
}: SyncEventsLiveProps) {
  const { events, stats, connectionState, retryConnect } = useSyncEventsLive(
    initialEvents,
    initialStats,
    filter,
  )

  // Client-side text filter (mirrors server behaviour for live-mode consistency)
  let filteredEvents = events
  if (searchQuery) {
    const q = searchQuery.toLowerCase()
    filteredEvents = events.filter(
      (e) =>
        e.type?.toLowerCase().includes(q) ||
        e.direction?.toLowerCase().includes(q) ||
        e.shopify_id?.toLowerCase().includes(q) ||
        e.error_message?.toLowerCase().includes(q) ||
        e.webhook_id?.toLowerCase().includes(q),
    )
  }

  const totalEvents = filteredEvents.length
  const paginatedEvents = filteredEvents.slice((currentPage - 1) * pageSize, currentPage * pageSize)

  // Live stats supersede server-rendered stats once the stream connects
  const liveStats = stats ?? initialStats

  return (
    <>
      {/* Connection indicator */}
      <div className="flex items-center justify-end mb-2">
        <LiveIndicator state={connectionState} onRetry={retryConnect} />
      </div>

      {/* Events table */}
      <div className="bg-white rounded-lg border border-[#E5E5E5] overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[#E5E5E5] bg-[#FAFAFA]">
              <th className="text-left px-4 py-3 text-[11px] font-medium text-[#666] uppercase tracking-wide">Type</th>
              <th className="text-left px-4 py-3 text-[11px] font-medium text-[#666] uppercase tracking-wide">Action</th>
              <th className="text-left px-4 py-3 text-[11px] font-medium text-[#666] uppercase tracking-wide">Flow</th>
              <th className="text-left px-4 py-3 text-[11px] font-medium text-[#666] uppercase tracking-wide">Details</th>
              <th className="text-left px-4 py-3 text-[11px] font-medium text-[#666] uppercase tracking-wide">Duration</th>
              <th className="text-left px-4 py-3 text-[11px] font-medium text-[#666] uppercase tracking-wide">Status</th>
              <th className="text-left px-4 py-3 text-[11px] font-medium text-[#666] uppercase tracking-wide">Timestamp</th>
              <th className="text-left px-4 py-3 text-[11px] font-medium text-[#666] uppercase tracking-wide"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E5E5E5]">
            {paginatedEvents.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-4 py-8 text-center text-[13px] text-[#666]">
                  {searchQuery || filter.type || filter.status || filter.startDate
                    ? 'No sync events match your filters.'
                    : 'No sync events yet. Events will appear here when webhooks are triggered.'}
                </td>
              </tr>
            ) : (
              paginatedEvents.map((event) => (
                <tr
                  key={event.id}
                  className={`hover:bg-[#FAFAFA] transition-colors ${
                    event.status === 'failed' ? 'bg-[#FEF2F2]' : ''
                  }`}
                >
                  <td className="px-4 py-3">
                    <span
                      className={`text-[11px] px-2 py-0.5 rounded ${
                        event.type === 'order'
                          ? 'bg-[#DBEAFE] text-[#1E40AF]'
                          : event.type === 'product'
                            ? 'bg-[#FEF3C7] text-[#92400E]'
                            : event.type === 'inventory'
                              ? 'bg-[#D1FAE5] text-[#065F46]'
                              : event.type === 'fulfillment'
                                ? 'bg-[#E0E7FF] text-[#3730A3]'
                                : 'bg-[#F3F4F6] text-[#4B5563]'
                      }`}
                    >
                      {event.type}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-[12px] text-[#1a1a1a] font-mono">{event.direction}</td>
                  <td className="px-4 py-3 text-[12px] text-[#666]">{formatDirection(event.direction)}</td>
                  <td className="px-4 py-3 text-[12px] text-[#1a1a1a]">{getEventDetails(event)}</td>
                  <td className="px-4 py-3 text-[12px] text-[#666] font-mono">
                    {formatDuration(event.processing_time_ms)}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      {event.status === 'success' ? (
                        <CheckCircle className="h-4 w-4 text-[#10B981]" />
                      ) : event.status === 'pending' || event.status === 'processing' ? (
                        <Clock className="h-4 w-4 text-[#F59E0B]" />
                      ) : (
                        <AlertTriangle className="h-4 w-4 text-[#EF4444]" />
                      )}
                      <span
                        className={`text-[11px] ${
                          event.status === 'success'
                            ? 'text-[#10B981]'
                            : event.status === 'pending' || event.status === 'processing'
                              ? 'text-[#F59E0B]'
                              : 'text-[#EF4444]'
                        }`}
                      >
                        {event.status}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-[11px] text-[#666]">{formatTimestamp(event.created_at)}</td>
                  <td className="px-4 py-3">
                    {(event.status === 'failed' || event.status === 'retry') && event.id && (
                      <RetryButton syncEventId={event.id} />
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination — totalEvents capped at stream buffer (200); use liveStats.total for accurate
          all-time count when no search/filter is active */}
      <Suspense fallback={null}>
        <SyncPagination
          currentPage={currentPage}
          totalEvents={searchQuery ? totalEvents : (liveStats.total ?? totalEvents)}
          pageSize={pageSize}
        />
      </Suspense>
    </>
  )
}
