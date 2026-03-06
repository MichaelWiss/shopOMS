import { Search, RefreshCw, CheckCircle, AlertTriangle, Clock, Filter } from 'lucide-react'
import { getSyncEvents, getSyncStats } from '@/lib/supabase/sync-events'
import type { SyncEvent, SyncStats } from '@/types/sync'

export const revalidate = 10 // Revalidate every 10 seconds

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
    return event.error_message.slice(0, 50) + (event.error_message.length > 50 ? '...' : '')
  }
  if (event.odoo_id && event.shopify_id) {
    return `Shopify ${event.shopify_id.slice(-8)} → Odoo ${event.odoo_id}`
  }
  if (event.shopify_id) {
    return `Shopify ${event.shopify_id.slice(-8)}`
  }
  return event.type
}

export default async function SyncPage() {
  const [events, stats] = await Promise.all([
    getSyncEvents({ limit: 50 }),
    getSyncStats(),
  ])

  // Calculate today's stats
  const todayStart = new Date()
  todayStart.setHours(0, 0, 0, 0)
  const todayEvents = events.filter(e => new Date(e.created_at!) >= todayStart)
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
          <button className="flex items-center gap-2 border border-[#E5E5E5] bg-white px-3 py-2 text-[13px] rounded hover:bg-[#FAFAFA] transition-colors">
            Clear Logs
          </button>
          <button className="flex items-center gap-2 bg-[#1a1a1a] text-white px-4 py-2 text-[13px] rounded hover:bg-[#333] transition-colors">
            <RefreshCw className="h-4 w-4" />
            Retry Failed
          </button>
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

      {/* Filters */}
      <div className="bg-white rounded-lg border border-[#E5E5E5] p-4 mb-4">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex-1 min-w-[200px] relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#999]" />
            <input
              type="text"
              placeholder="Search logs..."
              className="w-full pl-10 pr-4 py-2 border border-[#E5E5E5] rounded text-[13px] focus:outline-none focus:border-[#1a1a1a]"
            />
          </div>
          <select className="border border-[#E5E5E5] rounded px-3 py-2 text-[13px] bg-white">
            <option>All Types</option>
            <option>Orders</option>
            <option>Products</option>
            <option>Inventory</option>
            <option>Webhooks</option>
          </select>
          <select className="border border-[#E5E5E5] rounded px-3 py-2 text-[13px] bg-white">
            <option>All Status</option>
            <option>Success</option>
            <option>Pending</option>
            <option>Error</option>
          </select>
          <select className="border border-[#E5E5E5] rounded px-3 py-2 text-[13px] bg-white">
            <option>Last 24 hours</option>
            <option>Last 7 days</option>
            <option>Last 30 days</option>
          </select>
        </div>
      </div>

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
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E5E5E5]">
            {events.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-[13px] text-[#666]">
                  No sync events yet. Events will appear here when webhooks are triggered.
                </td>
              </tr>
            ) : (
              events.map((event) => (
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
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between mt-4">
        <p className="text-[12px] text-[#666]">Showing {events.length} events</p>
        <div className="flex items-center gap-2">
          <button className="px-3 py-1.5 text-[12px] border border-[#E5E5E5] rounded bg-white hover:bg-[#FAFAFA]">Previous</button>
          <button className="px-3 py-1.5 text-[12px] border border-[#E5E5E5] rounded bg-[#1a1a1a] text-white">1</button>
          <button className="px-3 py-1.5 text-[12px] border border-[#E5E5E5] rounded bg-white hover:bg-[#FAFAFA]">Next</button>
        </div>
      </div>
    </div>
  )
}
