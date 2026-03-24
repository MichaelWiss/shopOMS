import { Suspense } from 'react'
import { CheckCircle, AlertTriangle, Clock } from 'lucide-react'
import { getSyncEvents, getSyncStats } from '@/lib/supabase/sync-events'
import { RetryAllButton } from '@/components/SyncActions'
import { SyncFilters } from '@/components/SyncFilters'
import { SyncEventsLive } from '@/components/SyncEventsLive'
import type { SyncType, SyncStatus as SyncStatusType } from '@/types/sync'

export const revalidate = 10

const PAGE_SIZE = 25

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

  // Always fetch up to 200 events so SyncEventsLive can paginate client-side
  // and the initial dataset matches the stream snapshot size.
  const [allEvents, stats] = await Promise.all([
    getSyncEvents({
      type: typeFilter,
      status: statusFilter,
      startDate,
      limit: 200,
    }),
    getSyncStats(),
  ])

  // Calculate today's stats from the fetched event window
  const todayStart = new Date()
  todayStart.setHours(0, 0, 0, 0)
  const todayEvents = allEvents.filter(e => new Date(e.created_at!) >= todayStart)
  const todayStats = {
    total: todayEvents.length,
    success: todayEvents.filter(e => e.status === 'success').length,
    pending: todayEvents.filter(e => e.status === 'pending' || e.status === 'processing').length,
    errors: todayEvents.filter(e => e.status === 'failed').length,
  }

  // Stable key: remounts SyncEventsLive (resets live state) when filters change,
  // but NOT when only the page number changes.
  const filterKey = [typeFilter ?? '', statusFilter ?? '', daysFilter ?? '', searchQuery].join('|')
  const filter = { type: typeFilter, status: statusFilter, startDate }

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

      {/* Live events table + pagination */}
      <SyncEventsLive
        key={filterKey}
        initialEvents={allEvents}
        initialStats={stats}
        filter={filter}
        searchQuery={searchQuery}
        currentPage={currentPage}
        pageSize={PAGE_SIZE}
      />
    </div>
  )
}
