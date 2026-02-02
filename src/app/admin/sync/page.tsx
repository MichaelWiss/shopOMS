import { Search, RefreshCw, CheckCircle, AlertTriangle, Clock, Filter } from 'lucide-react'

const syncEvents = [
  { id: 1, type: 'order', action: 'orders/create', source: 'Shopify', target: 'Odoo', status: 'success', details: 'Order #1001 → SO/2026/0042', duration: '1.2s', timestamp: '2026-02-02 14:32:45' },
  { id: 2, type: 'order', action: 'orders/create', source: 'Shopify', target: 'Odoo', status: 'success', details: 'Order #1000 → SO/2026/0041', duration: '0.9s', timestamp: '2026-02-02 14:15:22' },
  { id: 3, type: 'order', action: 'orders/create', source: 'Shopify', target: 'Odoo', status: 'pending', details: 'Order #999 - queued', duration: '—', timestamp: '2026-02-02 13:58:10' },
  { id: 4, type: 'order', action: 'orders/create', source: 'Shopify', target: 'Odoo', status: 'error', details: 'Order #997 - Odoo connection timeout', duration: '30.0s', timestamp: '2026-02-02 12:45:33' },
  { id: 5, type: 'inventory', action: 'inventory/update', source: 'Odoo', target: 'Shopify', status: 'success', details: '12 items updated', duration: '2.4s', timestamp: '2026-02-02 12:00:00' },
  { id: 6, type: 'product', action: 'products/sync', source: 'Shopify', target: 'Odoo', status: 'success', details: 'Full catalog sync - 48 products', duration: '8.7s', timestamp: '2026-02-02 10:00:00' },
  { id: 7, type: 'order', action: 'orders/create', source: 'Shopify', target: 'Odoo', status: 'success', details: 'Order #996 → SO/2026/0039', duration: '1.1s', timestamp: '2026-02-02 09:45:12' },
  { id: 8, type: 'order', action: 'orders/update', source: 'Odoo', target: 'Supabase', status: 'success', details: 'SO/2026/0038 status → shipped', duration: '0.3s', timestamp: '2026-02-02 09:30:00' },
  { id: 9, type: 'webhook', action: 'webhook/verify', source: 'Shopify', target: 'Server', status: 'success', details: 'HMAC verification passed', duration: '0.1s', timestamp: '2026-02-02 09:15:00' },
  { id: 10, type: 'auth', action: 'auth/refresh', source: 'Server', target: 'Odoo', status: 'success', details: 'Session token refreshed', duration: '0.5s', timestamp: '2026-02-02 08:00:00' },
]

const stats = {
  today: { total: 24, success: 21, pending: 2, errors: 1 },
  week: { total: 156, success: 152, pending: 2, errors: 2 },
}

export default function SyncPage() {
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
              <p className="text-[24px] font-medium text-[#1a1a1a]">{stats.today.total}</p>
              <p className="text-[11px] text-[#666]">total events</p>
            </div>
            <div className="flex items-center gap-4 text-[13px]">
              <span className="flex items-center gap-1.5">
                <CheckCircle className="h-4 w-4 text-[#10B981]" />
                {stats.today.success}
              </span>
              <span className="flex items-center gap-1.5">
                <Clock className="h-4 w-4 text-[#F59E0B]" />
                {stats.today.pending}
              </span>
              <span className="flex items-center gap-1.5">
                <AlertTriangle className="h-4 w-4 text-[#EF4444]" />
                {stats.today.errors}
              </span>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-[#E5E5E5]">
          <p className="text-[12px] text-[#666] uppercase tracking-wide mb-3">This Week</p>
          <div className="flex items-center gap-6">
            <div>
              <p className="text-[24px] font-medium text-[#1a1a1a]">{stats.week.total}</p>
              <p className="text-[11px] text-[#666]">total events</p>
            </div>
            <div className="flex items-center gap-4 text-[13px]">
              <span className="flex items-center gap-1.5">
                <CheckCircle className="h-4 w-4 text-[#10B981]" />
                {stats.week.success}
              </span>
              <span className="flex items-center gap-1.5">
                <Clock className="h-4 w-4 text-[#F59E0B]" />
                {stats.week.pending}
              </span>
              <span className="flex items-center gap-1.5">
                <AlertTriangle className="h-4 w-4 text-[#EF4444]" />
                {stats.week.errors}
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
            {syncEvents.map((event) => (
              <tr key={event.id} className={`hover:bg-[#FAFAFA] transition-colors ${event.status === 'error' ? 'bg-[#FEF2F2]' : ''}`}>
                <td className="px-4 py-3">
                  <span className={`text-[11px] px-2 py-0.5 rounded ${
                    event.type === 'order' ? 'bg-[#DBEAFE] text-[#1E40AF]' :
                    event.type === 'product' ? 'bg-[#FEF3C7] text-[#92400E]' :
                    event.type === 'inventory' ? 'bg-[#D1FAE5] text-[#065F46]' :
                    event.type === 'webhook' ? 'bg-[#E0E7FF] text-[#3730A3]' :
                    'bg-[#F3F4F6] text-[#4B5563]'
                  }`}>
                    {event.type}
                  </span>
                </td>
                <td className="px-4 py-3 text-[12px] text-[#1a1a1a] font-mono">{event.action}</td>
                <td className="px-4 py-3 text-[12px] text-[#666]">
                  {event.source} → {event.target}
                </td>
                <td className="px-4 py-3 text-[12px] text-[#1a1a1a]">{event.details}</td>
                <td className="px-4 py-3 text-[12px] text-[#666] font-mono">{event.duration}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1.5">
                    {event.status === 'success' ? (
                      <CheckCircle className="h-4 w-4 text-[#10B981]" />
                    ) : event.status === 'pending' ? (
                      <Clock className="h-4 w-4 text-[#F59E0B]" />
                    ) : (
                      <AlertTriangle className="h-4 w-4 text-[#EF4444]" />
                    )}
                    <span className={`text-[11px] ${
                      event.status === 'success' ? 'text-[#10B981]' :
                      event.status === 'pending' ? 'text-[#F59E0B]' :
                      'text-[#EF4444]'
                    }`}>
                      {event.status}
                    </span>
                  </div>
                </td>
                <td className="px-4 py-3 text-[11px] text-[#666]">{event.timestamp}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between mt-4">
        <p className="text-[12px] text-[#666]">Showing 1-10 of 156 events</p>
        <div className="flex items-center gap-2">
          <button className="px-3 py-1.5 text-[12px] border border-[#E5E5E5] rounded bg-white hover:bg-[#FAFAFA]">Previous</button>
          <button className="px-3 py-1.5 text-[12px] border border-[#E5E5E5] rounded bg-[#1a1a1a] text-white">1</button>
          <button className="px-3 py-1.5 text-[12px] border border-[#E5E5E5] rounded bg-white hover:bg-[#FAFAFA]">2</button>
          <button className="px-3 py-1.5 text-[12px] border border-[#E5E5E5] rounded bg-white hover:bg-[#FAFAFA]">3</button>
          <button className="px-3 py-1.5 text-[12px] border border-[#E5E5E5] rounded bg-white hover:bg-[#FAFAFA]">Next</button>
        </div>
      </div>
    </div>
  )
}
