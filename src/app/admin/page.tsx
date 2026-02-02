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

// Mock data
const stats = [
  { label: 'Orders Today', value: '12', change: '+3', icon: ShoppingCart },
  { label: 'Pending Sync', value: '2', change: null, icon: Clock, alert: true },
  { label: 'Products Synced', value: '48', change: '100%', icon: Package },
  { label: 'Sync Errors', value: '0', change: null, icon: CheckCircle, success: true },
]

const recentOrders = [
  { id: 'ORD-1234', customer: 'John Smith', total: 180, status: 'synced', time: '2 min ago' },
  { id: 'ORD-1233', customer: 'Emma Wilson', total: 95, status: 'synced', time: '15 min ago' },
  { id: 'ORD-1232', customer: 'Michael Chen', total: 280, status: 'pending', time: '32 min ago' },
  { id: 'ORD-1231', customer: 'Sarah Davis', total: 110, status: 'synced', time: '1 hour ago' },
  { id: 'ORD-1230', customer: 'James Brown', total: 90, status: 'error', time: '2 hours ago' },
]

const syncStatus = {
  shopify: { status: 'connected', lastSync: '2 min ago' },
  odoo: { status: 'connected', lastSync: '2 min ago' },
  supabase: { status: 'connected', lastSync: 'Real-time' },
}

const alerts = [
  { type: 'warning', message: 'Order ORD-1230 failed to sync to Odoo - retry scheduled', time: '2 hours ago' },
  { type: 'info', message: 'Product inventory updated for 12 items', time: '4 hours ago' },
]

export default function AdminDashboard() {
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
        {/* Recent Orders */}
        <div className="md:col-span-2 bg-white rounded-lg border border-[#E5E5E5]">
          <div className="flex items-center justify-between p-4 border-b border-[#E5E5E5]">
            <h2 className="text-[14px] font-medium">Recent Orders</h2>
            <Link href="/admin/orders" className="text-[12px] text-[#666] hover:text-[#1a1a1a] flex items-center gap-1">
              View All <ArrowUpRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="divide-y divide-[#E5E5E5]">
            {recentOrders.map((order) => (
              <Link key={order.id} href={`/admin/orders/${order.id}`} className="flex items-center justify-between p-4 hover:bg-[#FAFAFA] transition-colors">
                <div className="flex items-center gap-4">
                  <div>
                    <p className="text-[13px] font-medium text-[#1a1a1a]">{order.id}</p>
                    <p className="text-[12px] text-[#666]">{order.customer}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-[13px] text-[#1a1a1a]">${order.total}</span>
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
            ))}
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
              {Object.entries(syncStatus).map(([system, data]) => (
                <div key={system} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${data.status === 'connected' ? 'bg-[#10B981]' : 'bg-[#EF4444]'}`} />
                    <span className="text-[13px] capitalize">{system}</span>
                  </div>
                  <span className="text-[11px] text-[#666]">{data.lastSync}</span>
                </div>
              ))}
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
              {alerts.map((alert, i) => (
                <div key={i} className="p-4">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className={`h-4 w-4 mt-0.5 flex-shrink-0 ${alert.type === 'warning' ? 'text-[#F59E0B]' : 'text-[#3B82F6]'}`} />
                    <div>
                      <p className="text-[12px] text-[#1a1a1a] leading-relaxed">{alert.message}</p>
                      <p className="text-[11px] text-[#999] mt-1">{alert.time}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
