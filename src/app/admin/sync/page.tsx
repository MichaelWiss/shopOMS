import { Suspense } from 'react'
import { CheckCircle, AlertTriangle, Clock } from 'lucide-react'
import { getSyncEvents, getSyncStats } from '@/lib/supabase/sync-events'
import { RetryAllButton, RetryButton } from '@/components/SyncActions'
import { SyncFilters, SyncPagination } from '@/components/SyncFilters'
import type { SyncEvent, SyncType, SyncStatus as SyncStatusType } from '@/types/sync'

export const revalidate = 10

const PAGE_SIZE = 25

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

function escapeHtml(str: string): string {
  return str.replace(/[<>&"']/g, c => ({'<':'&lt;','>':'&gt;','&':'&amp;','"':'&quot;',"'":'&#39;'}[c] || c))
}

function getEventDetails(event: SyncEvent): string {
  if (event.error_message) {
    return escapeHtml(event.error_message.slice(0, 50) + (event.error_message.length > 50 ? '...' : ''))
  }
  if (event.odoo_id && event.shopify_id) {
    return `Shopify ${event.shopify_id.slice(-8)} → Odoo ${event.odoo_id}`
  }
  if (event.shopify_id) {
    return `Shopify ${event.shopify_id.slice(-8)}`
  }
  return event.type
}

const VALID_TYPES: SyncType[] = ['order', 'inventory', 'fulfillment', 'customer', 'product']
const VALID_STATUSES: SyncStatusType[] = ['pending', 'processing', 'success', 'failed', 'retry']

export default async function SyncPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const params = await searchParams
  const typeFilter = VALID_TYPES.includes(params.type as SyncType) ? (params.type as SyncType) : undefined
  const statusFilter = VALID_STATUSES.includes(params.status as SyncStatusType) ? (params.status as SyncStatusType) : undefined
  const daysFilter = ['1', '7', '30'].includes(params.days as string) ? Number(params.days) : undefined
  const searchQuery = typeof params.q === 'string' ? params.q.trim() : ''
  const currentPage = Math.max(1, Number(params.page) || 1)

  const startDate = daysFilter
    ? new Date(Date.now() - daysFilter * 24 * 60 * 60 * 1000).toISOString()
    : undefined

  // Fetch a larger set when searching client-side by text
  const fetchLimit = searchQuery ? 200 : PAGE_SIZE
  const fetchOffset = searchQuery ? 0 : (currentPage - 1) * PAGE_SIZE

  const [allEvents, stats] = await Promise.all([
    getSyncEvents({
      type: typeFilter,
      status: statusFilter,
      startDate,
      limit: fetchLimit,
      offset: fetchOffset,
    }),
    getSyncStats(),
  ])

  // Client-side text search filter (searches type, direction, shopify_id, error_message)
  let events = allEvents
  if (searchQuery) {
    const q = searchQuery.toLowerCase()
    events = allEvents.filter(
      (e) =>
        e.type?.toLowerCase().includes(q) ||
        e.direction?.toLowerCase().includes(q) ||
        e.shopify_id?.toLowerCase().includes(q) ||
        e.error_message?.toLowerCase().includes(q) ||
        e.webhook_id?.toLowerCase().includes(q),
    )
  }

  // Paginate after text search
  const totalEvents = events.length
  const paginatedEvents = searchQuery
    ? events.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)
    : events

  // Calculate today's stats from all-time stats source
  const todayStart = new Date()
  todayStart.setHours(0, 0, 0, 0)
  const todayEvents = allEvents.filter(e => new Date(e.created_at!) >= todayStart)
  const todayStats = {
    total: todayEvents.length,
    success: todayEvents.filter(e => e.status === 'success').length,
    pending: todayEvents.filter(e => e.status === 'pending' || e.status === 'processing').length,
    errors: todayEvents.filter(e => e.status === 'failed').length,
  }

  return (
    <div className="max-w-[1400px] mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-[24px] font-medium text-[#1a1a1a]">Sync Logs</h1>
        <div className="flex items-center gap-3">
          <RetryAllButton />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg border border-[#E5E5E5]">
          <p className="text-[12px] text-[#666] uppercase tracking-wide mb-3">Today</p>
          <div className="flex items-center gap-6">
            <div>
              <p className="text-[24px] font-medium text-[#1a1a1a]">{todayStats.total}</p>
              <p className="text-[11px] text-[#666]">total events</p>
            </div>
            <div className="flex items-center gap-4 text-[13px]">
              <span className="flex items-center gap-1.5">
                <CheckCircle className="h-4 w-4 text-[#10B981]" />
                {todayStats.success}
              </span>
              <span className="flex items-center gap-1.5">
                <Clock className="h-4 w-4 text-[#F59E0B]" />
                {todayStats.pending}
              </span>
              <span className="flex items-center gap-1.5">
                <AlertTriangle className="h-4 w-4 text-[#EF4444]" />
                {todayStats.errors}
              </span>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-[#E5E5E5]">
          <p className="text-[12px] text-[#666] uppercase tracking-wide mb-3">All Time</p>
          <div className="flex items-center gap-6">
            <div>
              <p className="text-[24px] font-medium text-[#1a1a1a]">{stats.total}</p>
              <p className="text-[11px] text-[#666]">total events</p>
            </div>
            <div className="flex items-center gap-4 text-[13px]">
              <span className="flex items-center gap-1.5">
                <CheckCircle className="h-4 w-4 text-[#10B981]" />
                {stats.success}
              </span>
              <span className="flex items-center gap-1.5">
                <Clock className="h-4 w-4 text-[#F59E0B]" />
                {stats.pending + stats.processing}
              </span>
              <span className="flex items-center gap-1.5">
                <AlertTriangle className="h-4 w-4 text-[#EF4444]" />
                {stats.failed}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Filters */}
      <Suspense fallback={null}>
        <SyncFilters />
      </Suspense>

      {/* Sync Events Table */}
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
                  {searchQuery || typeFilter || statusFilter || daysFilter
                    ? 'No sync events match your filters.'
                    : 'No sync events yet. Events will appear here when webhooks are triggered.'}
                </td>
              </tr>
            ) : (
              paginatedEvents.map((event) => (
                <tr key={event.id} className={`hover:bg-[#FAFAFA] transition-colors ${event.status === 'failed' ? 'bg-[#FEF2F2]' : ''}`}>
                  <td className="px-4 py-3">
                    <span className={`text-[11px] px-2 py-0.5 rounded ${
                      event.type === 'order' ? 'bg-[#DBEAFE] text-[#1E40AF]' :
                      event.type === 'product' ? 'bg-[#FEF3C7] text-[#92400E]' :
                      event.type === 'inventory' ? 'bg-[#D1FAE5] text-[#065F46]' :
                      event.type === 'fulfillment' ? 'bg-[#E0E7FF] text-[#3730A3]' :
                      'bg-[#F3F4F6] text-[#4B5563]'
                    }`}>
                      {event.type}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-[12px] text-[#1a1a1a] font-mono">{event.direction}</td>
                  <td className="px-4 py-3 text-[12px] text-[#666]">
                    {formatDirection(event.direction)}
                  </td>
                  <td className="px-4 py-3 text-[12px] text-[#1a1a1a]">{getEventDetails(event)}</td>
                  <td className="px-4 py-3 text-[12px] text-[#666] font-mono">{formatDuration(event.processing_time_ms)}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      {event.status === 'success' ? (
                        <CheckCircle className="h-4 w-4 text-[#10B981]" />
                      ) : event.status === 'pending' || event.status === 'processing' ? (
                        <Clock className="h-4 w-4 text-[#F59E0B]" />
                      ) : (
                        <AlertTriangle className="h-4 w-4 text-[#EF4444]" />
                      )}
                      <span className={`text-[11px] ${
                        event.status === 'success' ? 'text-[#10B981]' :
                        event.status === 'pending' || event.status === 'processing' ? 'text-[#F59E0B]' :
                        'text-[#EF4444]'
                      }`}>
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

      {/* Interactive Pagination */}
      <Suspense fallback={null}>
        <SyncPagination
          currentPage={currentPage}
          totalEvents={searchQuery ? totalEvents : stats.total}
          pageSize={PAGE_SIZE}
        />
      </Suspense>
    </div>
  )
}
