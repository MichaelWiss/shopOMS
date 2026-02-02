import Link from 'next/link'
import { Search, RefreshCw, CheckCircle, AlertTriangle, Clock } from 'lucide-react'

const products = [
  { id: 1, title: 'The Guildsman', shopifyId: 'gid://shopify/Product/1001', odooId: 'PROD-001', sku: 'GUILD-001', price: 90, inventory: 999, syncStatus: 'synced', lastSync: '2 hours ago' },
  { id: 2, title: 'The Modernist', shopifyId: 'gid://shopify/Product/1002', odooId: 'PROD-002', sku: 'MOD-001', price: 95, inventory: 999, syncStatus: 'synced', lastSync: '2 hours ago' },
  { id: 3, title: 'The Artisan', shopifyId: 'gid://shopify/Product/1003', odooId: 'PROD-003', sku: 'ART-001', price: 110, inventory: 999, syncStatus: 'synced', lastSync: '2 hours ago' },
  { id: 4, title: 'The Minimalist', shopifyId: 'gid://shopify/Product/1004', odooId: 'PROD-004', sku: 'MIN-001', price: 85, inventory: 999, syncStatus: 'synced', lastSync: '2 hours ago' },
  { id: 5, title: 'Classic Sample Pack', shopifyId: 'gid://shopify/Product/2001', odooId: 'SAMP-001', sku: 'SAMP-CL', price: 15, inventory: 50, syncStatus: 'synced', lastSync: '2 hours ago' },
  { id: 6, title: 'Modern Sample Pack', shopifyId: 'gid://shopify/Product/2002', odooId: 'SAMP-002', sku: 'SAMP-MD', price: 15, inventory: 45, syncStatus: 'pending', lastSync: '—' },
  { id: 7, title: 'Complete Sample Set', shopifyId: 'gid://shopify/Product/2003', odooId: null, sku: 'SAMP-ALL', price: 25, inventory: 30, syncStatus: 'error', lastSync: 'Failed' },
  { id: 8, title: 'PDF Proof Add-on', shopifyId: 'gid://shopify/Product/3001', odooId: 'SVC-001', sku: 'PDF-PROOF', price: 0, inventory: 999, syncStatus: 'synced', lastSync: '2 hours ago' },
]

const stats = {
  total: 48,
  synced: 45,
  pending: 2,
  errors: 1,
}

export default function ProductsPage() {
  return (
    <div className="max-w-[1400px] mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-[24px] font-medium text-[#1a1a1a]">Products</h1>
        <button className="flex items-center gap-2 bg-[#1a1a1a] text-white px-4 py-2 text-[13px] rounded hover:bg-[#333] transition-colors">
          <RefreshCw className="h-4 w-4" />
          Sync Products
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg border border-[#E5E5E5]">
          <p className="text-[12px] text-[#666] uppercase tracking-wide">Total Products</p>
          <p className="text-[28px] font-medium text-[#1a1a1a] mt-1">{stats.total}</p>
        </div>
        <div className="bg-white p-4 rounded-lg border border-[#E5E5E5]">
          <p className="text-[12px] text-[#666] uppercase tracking-wide">Synced</p>
          <p className="text-[28px] font-medium text-[#10B981] mt-1">{stats.synced}</p>
        </div>
        <div className="bg-white p-4 rounded-lg border border-[#E5E5E5]">
          <p className="text-[12px] text-[#666] uppercase tracking-wide">Pending</p>
          <p className="text-[28px] font-medium text-[#F59E0B] mt-1">{stats.pending}</p>
        </div>
        <div className="bg-white p-4 rounded-lg border border-[#E5E5E5]">
          <p className="text-[12px] text-[#666] uppercase tracking-wide">Errors</p>
          <p className="text-[28px] font-medium text-[#EF4444] mt-1">{stats.errors}</p>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white rounded-lg border border-[#E5E5E5] p-4 mb-4">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#999]" />
          <input
            type="text"
            placeholder="Search products..."
            className="w-full pl-10 pr-4 py-2 border border-[#E5E5E5] rounded text-[13px] focus:outline-none focus:border-[#1a1a1a]"
          />
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-lg border border-[#E5E5E5] overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[#E5E5E5] bg-[#FAFAFA]">
              <th className="text-left px-4 py-3 text-[11px] font-medium text-[#666] uppercase tracking-wide">Product</th>
              <th className="text-left px-4 py-3 text-[11px] font-medium text-[#666] uppercase tracking-wide">SKU</th>
              <th className="text-left px-4 py-3 text-[11px] font-medium text-[#666] uppercase tracking-wide">Shopify ID</th>
              <th className="text-left px-4 py-3 text-[11px] font-medium text-[#666] uppercase tracking-wide">Odoo ID</th>
              <th className="text-left px-4 py-3 text-[11px] font-medium text-[#666] uppercase tracking-wide">Price</th>
              <th className="text-left px-4 py-3 text-[11px] font-medium text-[#666] uppercase tracking-wide">Inventory</th>
              <th className="text-left px-4 py-3 text-[11px] font-medium text-[#666] uppercase tracking-wide">Sync Status</th>
              <th className="text-left px-4 py-3 text-[11px] font-medium text-[#666] uppercase tracking-wide">Last Sync</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E5E5E5]">
            {products.map((product) => (
              <tr key={product.id} className="hover:bg-[#FAFAFA] transition-colors">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-[#F5F0E8] rounded flex items-center justify-center flex-shrink-0">
                      <span className="text-[8px] text-[#999]">IMG</span>
                    </div>
                    <span className="text-[13px] font-medium text-[#1a1a1a]">{product.title}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-[12px] text-[#666] font-mono">{product.sku}</td>
                <td className="px-4 py-3 text-[11px] text-[#666] font-mono">{product.shopifyId.split('/').pop()}</td>
                <td className="px-4 py-3 text-[12px] text-[#666]">{product.odooId || '—'}</td>
                <td className="px-4 py-3 text-[13px] text-[#1a1a1a]">${product.price}</td>
                <td className="px-4 py-3 text-[13px] text-[#1a1a1a]">{product.inventory}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1.5">
                    {product.syncStatus === 'synced' ? (
                      <CheckCircle className="h-4 w-4 text-[#10B981]" />
                    ) : product.syncStatus === 'pending' ? (
                      <Clock className="h-4 w-4 text-[#F59E0B]" />
                    ) : (
                      <AlertTriangle className="h-4 w-4 text-[#EF4444]" />
                    )}
                    <span className={`text-[11px] ${
                      product.syncStatus === 'synced' ? 'text-[#10B981]' :
                      product.syncStatus === 'pending' ? 'text-[#F59E0B]' :
                      'text-[#EF4444]'
                    }`}>
                      {product.syncStatus}
                    </span>
                  </div>
                </td>
                <td className="px-4 py-3 text-[12px] text-[#666]">{product.lastSync}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
