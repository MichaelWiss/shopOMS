import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { notFound } from 'next/navigation'
import { createServerClient } from '@/lib/supabase/client'

async function getOrderMapping(id: string) {
  const supabase = createServerClient()
  const { data, error } = await supabase
    .from('order_mappings')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !data) return null
  return data
}

export default async function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const order = await getOrderMapping(id)

  if (!order) notFound()

  return (
    <div className="max-w-[900px] mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Link href="/admin/orders" className="p-2 hover:bg-white rounded transition-colors">
            <ArrowLeft className="h-5 w-5 text-[#666]" />
          </Link>
          <div>
            <h1 className="text-[24px] font-medium text-[#1a1a1a]">
              {order.shopify_order_number ? `Order #${order.shopify_order_number}` : `Order ${order.shopify_order_id}`}
            </h1>
            <p className="text-[13px] text-[#666]">
              Created {order.created_at ? new Date(order.created_at).toLocaleString() : '—'}
            </p>
          </div>
        </div>
        <span className={`text-[12px] px-3 py-1 rounded ${
          order.status === 'synced' ? 'bg-[#D1FAE5] text-[#065F46]' :
          order.status === 'pending' ? 'bg-[#FEF3C7] text-[#92400E]' :
          order.status === 'cancelled' ? 'bg-[#F3F4F6] text-[#6B7280]' :
          'bg-[#FEE2E2] text-[#991B1B]'
        }`}>
          {order.status ?? 'pending'}
        </span>
      </div>

      {/* Mapping Details */}
      <div className="bg-white rounded-lg border border-[#E5E5E5]">
        <div className="p-4 border-b border-[#E5E5E5]">
          <h2 className="text-[14px] font-medium">Sync Details</h2>
        </div>
        <div className="p-4 space-y-3 text-[13px]">
          <div className="flex justify-between">
            <span className="text-[#666]">Shopify Order ID</span>
            <span className="text-[#1a1a1a] font-mono text-[12px]">{order.shopify_order_id}</span>
          </div>
          {order.shopify_order_number && (
            <div className="flex justify-between">
              <span className="text-[#666]">Shopify Order #</span>
              <span className="text-[#1a1a1a]">#{order.shopify_order_number}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span className="text-[#666]">Odoo Order ID</span>
            <span className="text-[#1a1a1a]">{order.odoo_order_id ?? '—'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[#666]">Odoo Order Name</span>
            <span className="text-[#1a1a1a]">{order.odoo_order_name ?? '—'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[#666]">Synced At</span>
            <span className="text-[#1a1a1a]">{order.synced_at ? new Date(order.synced_at).toLocaleString() : '—'}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
