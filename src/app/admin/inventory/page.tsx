import { Search, RefreshCw, AlertTriangle, ArrowUpDown } from 'lucide-react'

const inventoryItems = [
  { id: 1, title: 'The Guildsman', sku: 'GUILD-001', shopify: 999, odoo: 999, diff: 0, status: 'synced' },
  { id: 2, title: 'The Modernist', sku: 'MOD-001', shopify: 999, odoo: 999, diff: 0, status: 'synced' },
  { id: 3, title: 'The Artisan', sku: 'ART-001', shopify: 999, odoo: 999, diff: 0, status: 'synced' },
  { id: 4, title: 'The Minimalist', sku: 'MIN-001', shopify: 999, odoo: 999, diff: 0, status: 'synced' },
  { id: 5, title: 'Classic Sample Pack', sku: 'SAMP-CL', shopify: 50, odoo: 50, diff: 0, status: 'synced' },
  { id: 6, title: 'Modern Sample Pack', sku: 'SAMP-MD', shopify: 45, odoo: 42, diff: -3, status: 'mismatch' },
  { id: 7, title: 'Complete Sample Set', sku: 'SAMP-ALL', shopify: 30, odoo: 30, diff: 0, status: 'synced' },
  { id: 8, title: '110lb Cover Paper', sku: 'MAT-110', shopify: null, odoo: 5000, diff: null, status: 'odoo-only' },
  { id: 9, title: '220lb Cover Paper', sku: 'MAT-220', shopify: null, odoo: 3500, diff: null, status: 'odoo-only' },
  { id: 10, title: 'Black Ink (Gallon)', sku: 'INK-BLK', shopify: null, odoo: 8, diff: null, status: 'odoo-only' },
  { id: 11, title: 'Navy Ink (Gallon)', sku: 'INK-NVY', shopify: null, odoo: 4, diff: null, status: 'odoo-only' },
]

const stats = {
  totalItems: 48,
  synced: 45,
  mismatches: 1,
  odooOnly: 12,
}

export default function InventoryPage() {
  return (
    <div className="max-w-[1400px] mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-[24px] font-medium text-[#1a1a1a]">Inventory</h1>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 border border-[#E5E5E5] bg-white px-3 py-2 text-[13px] rounded hover:bg-[#FAFAFA] transition-colors">
            <ArrowUpDown className="h-4 w-4" />
            Reconcile
          </button>
          <button className="flex items-center gap-2 bg-[#1a1a1a] text-white px-4 py-2 text-[13px] rounded hover:bg-[#333] transition-colors">
            <RefreshCw className="h-4 w-4" />
            Sync Inventory
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg border border-[#E5E5E5]">
          <p className="text-[12px] text-[#666] uppercase tracking-wide">Total Items</p>
          <p className="text-[28px] font-medium text-[#1a1a1a] mt-1">{stats.totalItems}</p>
        </div>
        <div className="bg-white p-4 rounded-lg border border-[#E5E5E5]">
          <p className="text-[12px] text-[#666] uppercase tracking-wide">Synced</p>
          <p className="text-[28px] font-medium text-[#10B981] mt-1">{stats.synced}</p>
        </div>
        <div className="bg-white p-4 rounded-lg border border-[#E5E5E5]">
          <p className="text-[12px] text-[#666] uppercase tracking-wide">Mismatches</p>
          <p className="text-[28px] font-medium text-[#EF4444] mt-1">{stats.mismatches}</p>
        </div>
        <div className="bg-white p-4 rounded-lg border border-[#E5E5E5]">
          <p className="text-[12px] text-[#666] uppercase tracking-wide">Odoo Only</p>
          <p className="text-[28px] font-medium text-[#6B7280] mt-1">{stats.odooOnly}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border border-[#E5E5E5] p-4 mb-4">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex-1 min-w-[200px] relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#999]" />
            <input
              type="text"
              placeholder="Search inventory..."
              className="w-full pl-10 pr-4 py-2 border border-[#E5E5E5] rounded text-[13px] focus:outline-none focus:border-[#1a1a1a]"
            />
          </div>
          <select className="border border-[#E5E5E5] rounded px-3 py-2 text-[13px] bg-white">
            <option>All Items</option>
            <option>Products</option>
            <option>Materials (Odoo Only)</option>
          </select>
          <select className="border border-[#E5E5E5] rounded px-3 py-2 text-[13px] bg-white">
            <option>All Status</option>
            <option>Synced</option>
            <option>Mismatches</option>
          </select>
        </div>
      </div>

      {/* Inventory Table */}
      <div className="bg-white rounded-lg border border-[#E5E5E5] overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[#E5E5E5] bg-[#FAFAFA]">
              <th className="text-left px-4 py-3 text-[11px] font-medium text-[#666] uppercase tracking-wide">Item</th>
              <th className="text-left px-4 py-3 text-[11px] font-medium text-[#666] uppercase tracking-wide">SKU</th>
              <th className="text-right px-4 py-3 text-[11px] font-medium text-[#666] uppercase tracking-wide">
                <span className="flex items-center justify-end gap-1">
                  <span className="w-2 h-2 bg-[#95BF47] rounded-full" />
                  Shopify
                </span>
              </th>
              <th className="text-right px-4 py-3 text-[11px] font-medium text-[#666] uppercase tracking-wide">
                <span className="flex items-center justify-end gap-1">
                  <span className="w-2 h-2 bg-[#714B67] rounded-full" />
                  Odoo
                </span>
              </th>
              <th className="text-right px-4 py-3 text-[11px] font-medium text-[#666] uppercase tracking-wide">Difference</th>
              <th className="text-left px-4 py-3 text-[11px] font-medium text-[#666] uppercase tracking-wide">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E5E5E5]">
            {inventoryItems.map((item) => (
              <tr key={item.id} className={`hover:bg-[#FAFAFA] transition-colors ${item.status === 'mismatch' ? 'bg-[#FEF2F2]' : ''}`}>
                <td className="px-4 py-3">
                  <span className="text-[13px] font-medium text-[#1a1a1a]">{item.title}</span>
                </td>
                <td className="px-4 py-3 text-[12px] text-[#666] font-mono">{item.sku}</td>
                <td className="px-4 py-3 text-right text-[13px] text-[#1a1a1a]">
                  {item.shopify !== null ? item.shopify.toLocaleString() : <span className="text-[#999]">—</span>}
                </td>
                <td className="px-4 py-3 text-right text-[13px] text-[#1a1a1a]">
                  {item.odoo.toLocaleString()}
                </td>
                <td className="px-4 py-3 text-right">
                  {item.diff !== null ? (
                    <span className={`text-[13px] ${item.diff !== 0 ? 'text-[#EF4444] font-medium' : 'text-[#10B981]'}`}>
                      {item.diff === 0 ? '✓' : item.diff > 0 ? `+${item.diff}` : item.diff}
                    </span>
                  ) : (
                    <span className="text-[12px] text-[#999]">—</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  {item.status === 'synced' ? (
                    <span className="text-[11px] px-2 py-0.5 bg-[#D1FAE5] text-[#065F46] rounded">synced</span>
                  ) : item.status === 'mismatch' ? (
                    <span className="text-[11px] px-2 py-0.5 bg-[#FEE2E2] text-[#991B1B] rounded flex items-center gap-1 w-fit">
                      <AlertTriangle className="h-3 w-3" />
                      mismatch
                    </span>
                  ) : (
                    <span className="text-[11px] px-2 py-0.5 bg-[#F3F4F6] text-[#4B5563] rounded">odoo only</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
