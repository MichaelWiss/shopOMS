import Link from 'next/link'
import { ArrowLeft, RefreshCw, ExternalLink, CheckCircle, Clock, AlertTriangle } from 'lucide-react'

// Mock order data
const order = {
  id: 'ORD-1234',
  shopifyId: '#1001',
  shopifyUrl: 'https://admin.shopify.com/store/pressandco/orders/1001',
  odooId: 'SO/2026/0042',
  odooUrl: 'https://pressandco.odoo.com/web#id=42&model=sale.order',
  status: 'synced',
  created: '2026-02-02 14:32:15',
  lastSync: '2026-02-02 14:32:45',
  
  customer: {
    name: 'John Smith',
    email: 'john@example.com',
    phone: '+1 555-123-4567',
  },
  
  shipping: {
    name: 'John Smith',
    address1: '123 Main Street',
    address2: 'Apt 4B',
    city: 'New York',
    state: 'NY',
    zip: '10001',
    country: 'United States',
  },
  
  items: [
    { id: 1, title: 'The Guildsman', variant: '100 cards / 110lb Cover', quantity: 1, price: 140 },
    { id: 2, title: 'PDF Proof', variant: 'Digital proof', quantity: 1, price: 0 },
  ],
  
  subtotal: 140,
  shipping_cost: 0,
  tax: 0,
  total: 140,
  
  timeline: [
    { time: '2026-02-02 14:32:45', event: 'Order synced to Odoo', status: 'success', details: 'Created as SO/2026/0042' },
    { time: '2026-02-02 14:32:30', event: 'Sync initiated', status: 'info', details: 'BullMQ job #4521' },
    { time: '2026-02-02 14:32:15', event: 'Webhook received from Shopify', status: 'info', details: 'orders/create' },
  ],
  
  customization: {
    name: 'John Smith',
    title: 'Creative Director',
    company: 'Smith Design Co.',
    email: 'john@smithdesign.co',
    phone: '(555) 123-4567',
    typeface: 'Centaur',
    pdfProof: true,
  },
}

export default async function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  return (
    <div className="max-w-[1200px] mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Link href="/admin/orders" className="p-2 hover:bg-white rounded transition-colors">
            <ArrowLeft className="h-5 w-5 text-[#666]" />
          </Link>
          <div>
            <h1 className="text-[24px] font-medium text-[#1a1a1a]">{order.id}</h1>
            <p className="text-[13px] text-[#666]">Created {order.created}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className={`text-[12px] px-3 py-1 rounded ${
            order.status === 'synced' ? 'bg-[#D1FAE5] text-[#065F46]' :
            order.status === 'pending' ? 'bg-[#FEF3C7] text-[#92400E]' :
            'bg-[#FEE2E2] text-[#991B1B]'
          }`}>
            {order.status}
          </span>
          <button className="flex items-center gap-2 border border-[#E5E5E5] bg-white px-3 py-2 text-[13px] rounded hover:bg-[#FAFAFA] transition-colors">
            <RefreshCw className="h-4 w-4" />
            Re-sync
          </button>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="md:col-span-2 space-y-6">
          {/* External Links */}
          <div className="bg-white rounded-lg border border-[#E5E5E5] p-4">
            <div className="flex items-center gap-6">
              <a href={order.shopifyUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-[13px] text-[#1a1a1a] hover:underline">
                <span className="w-2 h-2 bg-[#95BF47] rounded-full" />
                Shopify {order.shopifyId}
                <ExternalLink className="h-3 w-3" />
              </a>
              {order.odooId && (
                <a href={order.odooUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-[13px] text-[#1a1a1a] hover:underline">
                  <span className="w-2 h-2 bg-[#714B67] rounded-full" />
                  Odoo {order.odooId}
                  <ExternalLink className="h-3 w-3" />
                </a>
              )}
            </div>
          </div>

          {/* Order Items */}
          <div className="bg-white rounded-lg border border-[#E5E5E5]">
            <div className="p-4 border-b border-[#E5E5E5]">
              <h2 className="text-[14px] font-medium">Order Items</h2>
            </div>
            <div className="divide-y divide-[#E5E5E5]">
              {order.items.map((item) => (
                <div key={item.id} className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-[#F5F0E8] rounded flex items-center justify-center">
                      <span className="text-[8px] text-[#999]">IMG</span>
                    </div>
                    <div>
                      <p className="text-[13px] font-medium text-[#1a1a1a]">{item.title}</p>
                      <p className="text-[12px] text-[#666]">{item.variant}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-[13px] text-[#1a1a1a]">${item.price > 0 ? item.price : 'Free'}</p>
                    <p className="text-[12px] text-[#666]">Qty: {item.quantity}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="p-4 bg-[#FAFAFA] border-t border-[#E5E5E5] space-y-2">
              <div className="flex justify-between text-[13px]">
                <span className="text-[#666]">Subtotal</span>
                <span>${order.subtotal}</span>
              </div>
              <div className="flex justify-between text-[13px]">
                <span className="text-[#666]">Shipping</span>
                <span>{order.shipping_cost > 0 ? `$${order.shipping_cost}` : 'Free'}</span>
              </div>
              <div className="flex justify-between text-[14px] font-medium pt-2 border-t border-[#E5E5E5]">
                <span>Total</span>
                <span>${order.total}</span>
              </div>
            </div>
          </div>

          {/* Customization Details */}
          <div className="bg-white rounded-lg border border-[#E5E5E5]">
            <div className="p-4 border-b border-[#E5E5E5]">
              <h2 className="text-[14px] font-medium">Card Customization</h2>
            </div>
            <div className="p-4 grid grid-cols-2 gap-4 text-[13px]">
              <div>
                <p className="text-[#666]">Name</p>
                <p className="text-[#1a1a1a]">{order.customization.name}</p>
              </div>
              <div>
                <p className="text-[#666]">Title</p>
                <p className="text-[#1a1a1a]">{order.customization.title}</p>
              </div>
              <div>
                <p className="text-[#666]">Company</p>
                <p className="text-[#1a1a1a]">{order.customization.company}</p>
              </div>
              <div>
                <p className="text-[#666]">Typeface</p>
                <p className="text-[#1a1a1a]">{order.customization.typeface}</p>
              </div>
              <div>
                <p className="text-[#666]">Email</p>
                <p className="text-[#1a1a1a]">{order.customization.email}</p>
              </div>
              <div>
                <p className="text-[#666]">Phone</p>
                <p className="text-[#1a1a1a]">{order.customization.phone}</p>
              </div>
              <div className="col-span-2">
                <p className="text-[#666]">PDF Proof</p>
                <p className="text-[#1a1a1a]">{order.customization.pdfProof ? 'Yes - proof requested' : 'No'}</p>
              </div>
            </div>
          </div>

          {/* Sync Timeline */}
          <div className="bg-white rounded-lg border border-[#E5E5E5]">
            <div className="p-4 border-b border-[#E5E5E5]">
              <h2 className="text-[14px] font-medium">Sync Timeline</h2>
            </div>
            <div className="p-4">
              <div className="space-y-4">
                {order.timeline.map((event, i) => (
                  <div key={i} className="flex gap-3">
                    <div className="flex flex-col items-center">
                      {event.status === 'success' ? (
                        <CheckCircle className="h-5 w-5 text-[#10B981]" />
                      ) : event.status === 'error' ? (
                        <AlertTriangle className="h-5 w-5 text-[#EF4444]" />
                      ) : (
                        <Clock className="h-5 w-5 text-[#3B82F6]" />
                      )}
                      {i < order.timeline.length - 1 && (
                        <div className="w-px h-full bg-[#E5E5E5] my-1" />
                      )}
                    </div>
                    <div className="pb-4">
                      <p className="text-[13px] font-medium text-[#1a1a1a]">{event.event}</p>
                      <p className="text-[12px] text-[#666]">{event.details}</p>
                      <p className="text-[11px] text-[#999] mt-1">{event.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Customer */}
          <div className="bg-white rounded-lg border border-[#E5E5E5]">
            <div className="p-4 border-b border-[#E5E5E5]">
              <h2 className="text-[14px] font-medium">Customer</h2>
            </div>
            <div className="p-4 space-y-2 text-[13px]">
              <p className="font-medium text-[#1a1a1a]">{order.customer.name}</p>
              <p className="text-[#666]">{order.customer.email}</p>
              <p className="text-[#666]">{order.customer.phone}</p>
            </div>
          </div>

          {/* Shipping Address */}
          <div className="bg-white rounded-lg border border-[#E5E5E5]">
            <div className="p-4 border-b border-[#E5E5E5]">
              <h2 className="text-[14px] font-medium">Shipping Address</h2>
            </div>
            <div className="p-4 text-[13px] text-[#666] leading-relaxed">
              <p className="text-[#1a1a1a]">{order.shipping.name}</p>
              <p>{order.shipping.address1}</p>
              {order.shipping.address2 && <p>{order.shipping.address2}</p>}
              <p>{order.shipping.city}, {order.shipping.state} {order.shipping.zip}</p>
              <p>{order.shipping.country}</p>
            </div>
          </div>

          {/* Sync Info */}
          <div className="bg-white rounded-lg border border-[#E5E5E5]">
            <div className="p-4 border-b border-[#E5E5E5]">
              <h2 className="text-[14px] font-medium">Sync Info</h2>
            </div>
            <div className="p-4 space-y-3 text-[13px]">
              <div className="flex justify-between">
                <span className="text-[#666]">Last Sync</span>
                <span className="text-[#1a1a1a]">{order.lastSync}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#666]">Shopify ID</span>
                <span className="text-[#1a1a1a]">{order.shopifyId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#666]">Odoo ID</span>
                <span className="text-[#1a1a1a]">{order.odooId || '—'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
