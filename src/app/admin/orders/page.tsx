import Link from 'next/link'
import { getOrderMappings } from '@/lib/supabase/order-mappings'

export default async function OrdersPage() {
  const orders = await getOrderMappings()

  return (
    <div className="max-w-[1400px] mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-[24px] font-medium text-[#1a1a1a]">Orders</h1>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-lg border border-[#E5E5E5] overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[#E5E5E5] bg-[#FAFAFA]">
              <th className="text-left px-4 py-3 text-[11px] font-medium text-[#666] uppercase tracking-wide">Shopify Order</th>
              <th className="text-left px-4 py-3 text-[11px] font-medium text-[#666] uppercase tracking-wide">Odoo Order</th>
              <th className="text-left px-4 py-3 text-[11px] font-medium text-[#666] uppercase tracking-wide">Status</th>
              <th className="text-left px-4 py-3 text-[11px] font-medium text-[#666] uppercase tracking-wide">Created</th>
              <th className="text-left px-4 py-3 text-[11px] font-medium text-[#666] uppercase tracking-wide">Synced</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E5E5E5]">
            {orders.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-12 text-center text-[13px] text-[#666]">
                  No orders synced yet. Orders will appear here when Shopify webhooks fire.
                </td>
              </tr>
            )}
            {orders.map((order) => (
              <tr key={order.id} className="hover:bg-[#FAFAFA] transition-colors">
                <td className="px-4 py-3">
                  <Link href={`/admin/orders/${order.id}`} className="text-[13px] font-medium text-[#1a1a1a] hover:underline">
                    {order.shopify_order_number ? `#${order.shopify_order_number}` : order.shopify_order_id}
                  </Link>
                </td>
                <td className="px-4 py-3">
                  {order.odoo_order_name ? (
                    <span className="text-[13px] text-[#1a1a1a]">{order.odoo_order_name}</span>
                  ) : (
                    <span className="text-[12px] text-[#999]">—</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <span className={`text-[11px] px-2 py-0.5 rounded ${
                    order.status === 'synced' ? 'bg-[#D1FAE5] text-[#065F46]' :
                    order.status === 'pending' ? 'bg-[#FEF3C7] text-[#92400E]' :
                    order.status === 'cancelled' ? 'bg-[#F3F4F6] text-[#6B7280]' :
                    'bg-[#FEE2E2] text-[#991B1B]'
                  }`}>
                    {order.status ?? 'pending'}
                  </span>
                </td>
                <td className="px-4 py-3 text-[12px] text-[#666]">
                  {order.created_at ? new Date(order.created_at).toLocaleString() : '—'}
                </td>
                <td className="px-4 py-3 text-[12px] text-[#666]">
                  {order.synced_at ? new Date(order.synced_at).toLocaleString() : '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
