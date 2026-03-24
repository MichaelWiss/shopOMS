import { RefreshCw, ShoppingBag } from 'lucide-react'
import { redirect } from 'next/navigation'
import { siteConfig } from '@/lib/site-config'

export default function ProductsPage() {
  if (!siteConfig.flags.adminStubsEnabled) {
    redirect('/admin/sync')
  }

  return (
    <div className="max-w-[1400px] mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-[24px] font-medium text-[#1a1a1a]">Products</h1>
        <button disabled className="flex items-center gap-2 bg-[#1a1a1a]/50 text-white px-4 py-2 text-[13px] rounded cursor-not-allowed">
          <RefreshCw className="h-4 w-4" />
          Sync Products
        </button>
      </div>

      <div className="bg-white rounded-lg border border-[#E5E5E5] p-12 text-center">
        <ShoppingBag className="h-12 w-12 text-[#ccc] mx-auto mb-4" />
        <h2 className="text-[16px] font-medium text-[#1a1a1a] mb-2">Product sync coming soon</h2>
        <p className="text-[13px] text-[#666] max-w-md mx-auto">
          Product mappings between Shopify and Odoo will be displayed here once the product sync pipeline is implemented.
        </p>
      </div>
    </div>
  )
}
