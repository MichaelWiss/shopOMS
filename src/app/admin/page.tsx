import Link from 'next/link'
import { 
  ShoppingCart, 
  Package, 
  AlertTriangle, 
  CheckCircle, 
  Clock,
  ArrowUpRight,
  RefreshCw
} from 'lucide-react'
import { getSyncEvents, getSyncStats } from '@/lib/supabase/sync-events'

export const revalidate = 10

export default async function AdminDashboard() {
  const [recentEvents, allStats] = await Promise.all([
    getSyncEvents({ limit: 10 }),
    getSyncStats(),
  ])

  // Calculate today's stats
  const todayStart = new Date()
  todayStart.setHours(0, 0, 0, 0)
  const todayEvents = recentEvents.filter(e => new Date(e.created_at!) >= todayStart)
  
  const stats = [
    { label: 'Events Today', value: String(todayEvents.length), change: null, icon: ShoppingCart },
    { label: 'Pending Sync', value: String(allStats.pending + allStats.processing), change: null, icon: Clock, alert: (allStats.pending + allStats.processing) > 0 },
    { label: 'Total Synced', value: String(allStats.success), change: `${Math.round((allStats.success / Math.max(allStats.total, 1)) * 100)}%`, icon: Package },
    { label: 'Sync Errors', value: String(allStats.failed), change: null, icon: allStats.failed === 0 ? CheckCircle : AlertTriangle, success: allStats.failed === 0 },
  ]

  // Map recent events to order-like display
  const recentOrders = recentEvents.slice(0, 5).map(event => ({
    id: event.id?.slice(0, 8) || 'N/A',
    customer: event.type,
    total: event.odoo_id || 0,
    status: event.status === 'success' ? 'synced' : event.status === 'failed' ? 'error' : 'pending',
    time: event.created_at ? new Date(event.created_at).toLocaleTimeString() : '',
  }))

  const failedEvents = recentEvents.filter(e => e.status === 'failed').slice(0, 3)
  const alerts = failedEvents.map(e => ({
    type: 'warning' as const,
    message: e.error_message || `${e.type} sync failed`,
    time: e.created_at ? new Date(e.created_at).toLocaleTimeString() : '',
  }))
  return (
    <div className="max-w-[1400px] mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-[24px] font-medium text-[#1a1a1a]">Dashboard</h1>
        <button className="flex items-center gap-2 bg-[#1a1a1a] text-white px-4 py-2 text-[13px] rounded hover:bg-[#333] transition-colors">
          <RefreshCw className="h-4 w-4" />
          Sync Now
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-white p-5 rounded-lg border border-[#E5E5E5]">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[12px] text-[#666] uppercase tracking-wide">{stat.label}</p>
                <p className={`text-[32px] font-medium mt-1 ${stat.alert ? 'text-[#F59E0B]' : stat.success ? 'text-[#10B981]' : 'text-[#1a1a1a]'}`}>
                  {stat.value}
                </p>
              </div>
              <stat.icon className={`h-5 w-5 ${stat.alert ? 'text-[#F59E0B]' : stat.success ? 'text-[#10B981]' : 'text-[#999]'}`} />
            </div>
            {stat.change && (
              <p className="text-[12px] text-[#10B981] mt-2">{stat.change}</p>
            )}
          </div>
        ))}
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Recent Sync Events */}
        <div className="md:col-span-2 bg-white rounded-lg border border-[#E5E5E5]">
          <div className="flex items-center justify-between p-4 border-b border-[#E5E5E5]">
            <h2 className="text-[14px] font-medium">Recent Sync Events</h2>
            <Link href="/admin/sync" className="text-[12px] text-[#666] hover:text-[#1a1a1a] flex items-center gap-1">
              View All <ArrowUpRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="divide-y divide-[#E5E5E5]">
            {recentOrders.length === 0 ? (
              <div className="p-8 text-center text-[13px] text-[#666]">
                No sync events yet
              </div>
            ) : (
              recentOrders.map((order) => (
                <Link key={order.id} href="/admin/sync" className="flex items-center justify-between p-4 hover:bg-[#FAFAFA] transition-colors">
                  <div className="flex items-center gap-4">
                    <div>
                      <p className="text-[13px] font-medium text-[#1a1a1a]">{order.id}</p>
                      <p className="text-[12px] text-[#666]">{order.customer}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    {order.total > 0 && <span className="text-[13px] text-[#1a1a1a]">Odoo #{order.total}</span>}
                    <span className={`text-[11px] px-2 py-0.5 rounded ${
                      order.status === 'synced' ? 'bg-[#D1FAE5] text-[#065F46]' :
                      order.status === 'pending' ? 'bg-[#FEF3C7] text-[#92400E]' :
                      'bg-[#FEE2E2] text-[#991B1B]'
                    }`}>
                      {order.status}
                    </span>
                    <span className="text-[11px] text-[#999] w-20 text-right">{order.time}</span>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* System Status */}
          <div className="bg-white rounded-lg border border-[#E5E5E5]">
            <div className="p-4 border-b border-[#E5E5E5]">
              <h2 className="text-[14px] font-medium">System Status</h2>
            </div>
            <div className="p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#10B981]" />
                  <span className="text-[13px]">Shopify</span>
                </div>
                <span className="text-[11px] text-[#666]">Connected</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#10B981]" />
                  <span className="text-[13px]">Odoo</span>
                </div>
                <span className="text-[11px] text-[#666]">Connected</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#10B981]" />
                  <span className="text-[13px]">Supabase</span>
                </div>
                <span className="text-[11px] text-[#666]">Real-time</span>
              </div>
            </div>
          </div>

          {/* Alerts */}
          <div className="bg-white rounded-lg border border-[#E5E5E5]">
            <div className="flex items-center justify-between p-4 border-b border-[#E5E5E5]">
              <h2 className="text-[14px] font-medium">Alerts</h2>
              <Link href="/admin/sync" className="text-[12px] text-[#666] hover:text-[#1a1a1a]">
                View All
              </Link>
            </div>
            <div className="divide-y divide-[#E5E5E5]">
              {alerts.length === 0 ? (
                <div className="p-4 text-center text-[12px] text-[#666]">
                  No alerts
                </div>
              ) : (
                alerts.map((alert, i) => (
                  <div key={i} className="p-4">
                    <div className="flex items-start gap-2">
                      <AlertTriangle className={`h-4 w-4 mt-0.5 flex-shrink-0 ${alert.type === 'warning' ? 'text-[#F59E0B]' : 'text-[#3B82F6]'}`} />
                      <div>
                        <p className="text-[12px] text-[#1a1a1a] leading-relaxed">{alert.message}</p>
                        <p className="text-[11px] text-[#999] mt-1">{alert.time}</p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
