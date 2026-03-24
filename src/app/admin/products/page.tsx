import { redirect } from 'next/navigation'
import { siteConfig } from '@/lib/site-config'
import { getProductMappings } from '@/lib/supabase/product-mappings'
import type { ProductMapping } from '@/types/sync'

export const revalidate = 60

function MappingBadge({ status }: { status: ProductMapping['mapping_status'] }) {
  const classes =
    status === 'mapped'        ? 'bg-[#D1FAE5] text-[#065F46]' :
    status === 'missing_odoo'  ? 'bg-[#FEE2E2] text-[#991B1B]' :
    status === 'missing_sku'   ? 'bg-[#FEE2E2] text-[#991B1B]' :
    status === 'error'         ? 'bg-[#FEE2E2] text-[#991B1B]' :
                                 'bg-[#F3F4F6] text-[#6B7280]'
  const label =
    status === 'missing_odoo' ? 'missing in Odoo' :
    status === 'missing_sku'  ? 'missing SKU' :
    status
  return <span className={`text-[11px] px-2 py-0.5 rounded ${classes}`}>{label}</span>
}

export default async function ProductsPage() {
  if (!siteConfig.flags.adminProductDashboard) {
    redirect('/admin/sync')
  }

  const mappings = await getProductMappings({ limit: 200 })

  const mapped  = mappings.filter(m => m.mapping_status === 'mapped').length
  const missing = mappings.filter(m => ['missing_odoo', 'missing_sku', 'error'].includes(m.mapping_status)).length
  const pending = mappings.filter(m => m.mapping_status === 'pending').length

  return (
    <div className="max-w-[1400px] mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-[24px] font-medium text-[#1a1a1a]">Product Mappings</h1>
      </div>

      {/* Summary strip */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Total SKUs', value: mappings.length },
          { label: 'Mapped', value: mapped },
          { label: 'Issues', value: missing },
          { label: 'Pending', value: pending },
        ].map(({ label, value }) => (
          <div key={label} className="bg-white rounded-lg border border-[#E5E5E5] px-4 py-3">
            <p className="text-[11px] text-[#666] uppercase tracking-wide">{label}</p>
            <p className="text-[22px] font-medium text-[#1a1a1a] mt-1">{value}</p>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg border border-[#E5E5E5] overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[#E5E5E5] bg-[#FAFAFA]">
              <th className="text-left px-4 py-3 text-[11px] font-medium text-[#666] uppercase tracking-wide">SKU</th>
              <th className="text-left px-4 py-3 text-[11px] font-medium text-[#666] uppercase tracking-wide">Shopify Inv. Item ID</th>
              <th className="text-left px-4 py-3 text-[11px] font-medium text-[#666] uppercase tracking-wide">Odoo Product ID</th>
              <th className="text-left px-4 py-3 text-[11px] font-medium text-[#666] uppercase tracking-wide">Odoo Product Name</th>
              <th className="text-left px-4 py-3 text-[11px] font-medium text-[#666] uppercase tracking-wide">Status</th>
              <th className="text-left px-4 py-3 text-[11px] font-medium text-[#666] uppercase tracking-wide">Last Checked</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E5E5E5]">
            {mappings.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-12 text-center text-[13px] text-[#666]">
                  No product mappings yet. Mappings are discovered automatically when Shopify inventory webhooks are processed.
                </td>
              </tr>
            )}
            {mappings.map((m) => (
              <tr key={m.sku} className="hover:bg-[#FAFAFA] transition-colors">
                <td className="px-4 py-3 text-[13px] font-mono text-[#1a1a1a]">{m.sku}</td>
                <td className="px-4 py-3 text-[12px] font-mono text-[#666]">
                  {m.shopify_inventory_item_id ?? <span className="text-[#999]">—</span>}
                </td>
                <td className="px-4 py-3 text-[12px] font-mono text-[#1a1a1a]">
                  {m.odoo_product_id ?? <span className="text-[#999]">—</span>}
                </td>
                <td className="px-4 py-3 text-[13px] text-[#1a1a1a]">
                  {m.odoo_product_name ?? <span className="text-[12px] text-[#999]">—</span>}
                </td>
                <td className="px-4 py-3">
                  <MappingBadge status={m.mapping_status} />
                  {m.last_error && (
                    <p className="text-[11px] text-[#991B1B] mt-1 max-w-[200px] truncate" title={m.last_error}>
                      {m.last_error}
                    </p>
                  )}
                </td>
                <td className="px-4 py-3 text-[12px] text-[#666]">
                  {m.last_checked_at ? new Date(m.last_checked_at).toLocaleString() : '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

