import Link from 'next/link'
import { Search, Filter, Download, RefreshCw } from 'lucide-react'

const orders = [
  { id: 'ORD-1234', shopifyId: '#1001', odooId: 'SO/2026/0042', customer: 'John Smith', email: 'john@example.com', items: 2, total: 180, status: 'synced', shopifyStatus: 'paid', odooStatus: 'confirmed', created: '2026-02-02 14:32' },
  { id: 'ORD-1233', shopifyId: '#1000', odooId: 'SO/2026/0041', customer: 'Emma Wilson', email: 'emma@example.com', items: 1, total: 95, status: 'synced', shopifyStatus: 'paid', odooStatus: 'confirmed', created: '2026-02-02 14:15' },
  { id: 'ORD-1232', shopifyId: '#999', odooId: null, customer: 'Michael Chen', email: 'michael@example.com', items: 3, total: 280, status: 'pending', shopifyStatus: 'paid', odooStatus: null, created: '2026-02-02 13:58' },
  { id: 'ORD-1231', shopifyId: '#998', odooId: 'SO/2026/0040', customer: 'Sarah Davis', email: 'sarah@example.com', items: 1, total: 110, status: 'synced', shopifyStatus: 'paid', odooStatus: 'confirmed', created: '2026-02-02 13:22' },
  { id: 'ORD-1230', shopifyId: '#997', odooId: null, customer: 'James Brown', email: 'james@example.com', items: 1, total: 90, status: 'error', shopifyStatus: 'paid', odooStatus: null, created: '2026-02-02 12:45' },
  { id: 'ORD-1229', shopifyId: '#996', odooId: 'SO/2026/0039', customer: 'Lisa Anderson', email: 'lisa@example.com', items: 2, total: 185, status: 'synced', shopifyStatus: 'paid', odooStatus: 'shipped', created: '2026-02-02 11:30' },
  { id: 'ORD-1228', shopifyId: '#995', odooId: 'SO/2026/0038', customer: 'Robert Taylor', email: 'robert@example.com', items: 1, total: 90, status: 'synced', shopifyStatus: 'paid', odooStatus: 'shipped', created: '2026-02-02 10:15' },
  { id: 'ORD-1227', shopifyId: '#994', odooId: 'SO/2026/0037', customer: 'Jennifer White', email: 'jennifer@example.com', items: 4, total: 360, status: 'synced', shopifyStatus: 'paid', odooStatus: 'delivered', created: '2026-02-01 16:45' },
]

export default function OrdersPage() {
  return (
    <div className="max-w-[1400px] mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-[24px] font-medium text-[#1a1a1a]">Orders</h1>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 border border-[#E5E5E5] bg-white px-3 py-2 text-[13px] rounded hover:bg-[#FAFAFA] transition-colors">
            <Download className="h-4 w-4" />
            Export
          </button>
          <button className="flex items-center gap-2 bg-[#1a1a1a] text-white px-4 py-2 text-[13px] rounded hover:bg-[#333] transition-colors">
            <RefreshCw className="h-4 w-4" />
            Sync Orders
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border border-[#E5E5E5] p-4 mb-4">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex-1 min-w-[200px] relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#999]" />
            <input
              type="text"
              placeholder="Search orders..."
              className="w-full pl-10 pr-4 py-2 border border-[#E5E5E5] rounded text-[13px] focus:outline-none focus:border-[#1a1a1a]"
            />
          </div>
          <select className="border border-[#E5E5E5] rounded px-3 py-2 text-[13px] bg-white">
            <option>All Status</option>
            <option>Synced</option>
            <option>Pending</option>
            <option>Error</option>
          </select>
          <select className="border border-[#E5E5E5] rounded px-3 py-2 text-[13px] bg-white">
            <option>Last 7 days</option>
            <option>Last 30 days</option>
            <option>Last 90 days</option>
            <option>All time</option>
          </select>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-lg border border-[#E5E5E5] overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[#E5E5E5] bg-[#FAFAFA]">
              <th className="text-left px-4 py-3 text-[11px] font-medium text-[#666] uppercase tracking-wide">Order</th>
              <th className="text-left px-4 py-3 text-[11px] font-medium text-[#666] uppercase tracking-wide">Customer</th>
              <th className="text-left px-4 py-3 text-[11px] font-medium text-[#666] uppercase tracking-wide">Shopify</th>
              <th className="text-left px-4 py-3 text-[11px] font-medium text-[#666] uppercase tracking-wide">Odoo</th>
              <th className="text-left px-4 py-3 text-[11px] font-medium text-[#666] uppercase tracking-wide">Total</th>
              <th className="text-left px-4 py-3 text-[11px] font-medium text-[#666] uppercase tracking-wide">Sync Status</th>
              <th className="text-left px-4 py-3 text-[11px] font-medium text-[#666] uppercase tracking-wide">Created</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E5E5E5]">
            {orders.map((order) => (
              <tr key={order.id} className="hover:bg-[#FAFAFA] transition-colors">
                <td className="px-4 py-3">
                  <Link href={`/admin/orders/${order.id}`} className="text-[13px] font-medium text-[#1a1a1a] hover:underline">
                    {order.id}
                  </Link>
                </td>
                <td className="px-4 py-3">
                  <p className="text-[13px] text-[#1a1a1a]">{order.customer}</p>
                  <p className="text-[11px] text-[#666]">{order.email}</p>
                </td>
                <td className="px-4 py-3">
                  <p className="text-[12px] text-[#1a1a1a]">{order.shopifyId}</p>
                  <span className="text-[10px] px-1.5 py-0.5 bg-[#D1FAE5] text-[#065F46] rounded">{order.shopifyStatus}</span>
                </td>
                <td className="px-4 py-3">
                  {order.odooId ? (
                    <>
                      <p className="text-[12px] text-[#1a1a1a]">{order.odooId}</p>
                      <span className="text-[10px] px-1.5 py-0.5 bg-[#DBEAFE] text-[#1E40AF] rounded">{order.odooStatus}</span>
                    </>
                  ) : (
                    <span className="text-[12px] text-[#999]">—</span>
                  )}
                </td>
                <td className="px-4 py-3 text-[13px] text-[#1a1a1a]">${order.total}</td>
                <td className="px-4 py-3">
                  <span className={`text-[11px] px-2 py-0.5 rounded ${
                    order.status === 'synced' ? 'bg-[#D1FAE5] text-[#065F46]' :
                    order.status === 'pending' ? 'bg-[#FEF3C7] text-[#92400E]' :
                    'bg-[#FEE2E2] text-[#991B1B]'
                  }`}>
                    {order.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-[12px] text-[#666]">{order.created}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between mt-4">
        <p className="text-[12px] text-[#666]">Showing 1-8 of 156 orders</p>
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
