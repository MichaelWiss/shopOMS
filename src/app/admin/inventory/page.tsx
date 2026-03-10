import { RefreshCw, Package } from 'lucide-react'

export default function InventoryPage() {
  return (
    <div className="max-w-[1400px] mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-[24px] font-medium text-[#1a1a1a]">Inventory</h1>
        <button disabled className="flex items-center gap-2 bg-[#1a1a1a]/50 text-white px-4 py-2 text-[13px] rounded cursor-not-allowed">
          <RefreshCw className="h-4 w-4" />
          Sync Inventory
        </button>
      </div>

      <div className="bg-white rounded-lg border border-[#E5E5E5] p-12 text-center">
        <Package className="h-12 w-12 text-[#ccc] mx-auto mb-4" />
        <h2 className="text-[16px] font-medium text-[#1a1a1a] mb-2">Inventory sync coming soon</h2>
        <p className="text-[13px] text-[#666] max-w-md mx-auto">
          Inventory levels will be synced between Shopify and Odoo once the inventory sync pipeline is implemented.
        </p>
      </div>
    </div>
  )
}
