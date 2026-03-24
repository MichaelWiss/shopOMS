import { redirect } from 'next/navigation'
import { RefreshCw } from 'lucide-react'
import { siteConfig } from '@/lib/site-config'
import { getInventorySnapshots } from '@/lib/supabase/inventory-snapshots'
import { resyncInventoryRow } from '@/app/actions/inventory'
import type { InventorySnapshot } from '@/types/sync'

export const revalidate = 30

function StatusBadge({ status, drift }: { status: InventorySnapshot['status']; drift?: number | null }) {
  const hasDrift = typeof drift === 'number' && drift !== 0
  const display = hasDrift ? 'drift' : status
  const classes =
    display === 'synced' ? 'bg-[#D1FAE5] text-[#065F46]' :
    display === 'drift'  ? 'bg-[#FEF3C7] text-[#92400E]' :
    display === 'failed' ? 'bg-[#FEE2E2] text-[#991B1B]' :
                           'bg-[#F3F4F6] text-[#6B7280]'
  return <span className={`text-[11px] px-2 py-0.5 rounded ${classes}`}>{display}</span>
}

export default async function InventoryPage() {
  if (!siteConfig.flags.adminInventoryDashboard) {
    redirect('/admin/sync')
  }

  const snapshots = await getInventorySnapshots({ limit: 200 })

  const synced  = snapshots.filter(s => s.status === 'synced' && !s.drift).length
  const failed  = snapshots.filter(s => s.status === 'failed').length
  const drifted = snapshots.filter(s => typeof s.drift === 'number' && s.drift !== 0).length

  return (
    <div className="max-w-[1400px] mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-[24px] font-medium text-[#1a1a1a]">Inventory</h1>
      </div>

      {/* Summary strip */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Total SKUs', value: snapshots.length },
          { label: 'Synced', value: synced },
          { label: 'Drift', value: drifted },
          { label: 'Failed', value: failed },
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
              <th className="text-left px-4 py-3 text-[11px] font-medium text-[#666] uppercase tracking-wide">Location</th>
              <th className="text-right px-4 py-3 text-[11px] font-medium text-[#666] uppercase tracking-wide">Shopify Qty</th>
              <th className="text-right px-4 py-3 text-[11px] font-medium text-[#666] uppercase tracking-wide">Odoo Qty</th>
              <th className="text-right px-4 py-3 text-[11px] font-medium text-[#666] uppercase tracking-wide">Drift</th>
              <th className="text-left px-4 py-3 text-[11px] font-medium text-[#666] uppercase tracking-wide">Status</th>
              <th className="text-left px-4 py-3 text-[11px] font-medium text-[#666] uppercase tracking-wide">Last Synced</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E5E5E5]">
            {snapshots.length === 0 && (
              <tr>
                <td colSpan={8} className="px-4 py-12 text-center text-[13px] text-[#666]">
                  No inventory rows yet. Rows appear after Shopify inventory webhooks are received and processed.
                </td>
              </tr>
            )}
            {snapshots.map((snap) => {
              const driftVal = snap.drift ?? 0
              const resyncAction = resyncInventoryRow.bind(null, snap.sku, snap.location_id)
              return (
                <tr key={`${snap.sku}:${snap.location_id}`} className="hover:bg-[#FAFAFA] transition-colors">
                  <td className="px-4 py-3 text-[13px] font-mono text-[#1a1a1a]">{snap.sku}</td>
                  <td className="px-4 py-3 text-[12px] text-[#666] font-mono">{snap.location_id}</td>
                  <td className="px-4 py-3 text-[13px] text-right text-[#1a1a1a]">{snap.shopify_qty ?? '—'}</td>
                  <td className="px-4 py-3 text-[13px] text-right text-[#1a1a1a]">{snap.odoo_qty ?? '—'}</td>
                  <td className="px-4 py-3 text-[13px] text-right">
                    <span className={driftVal !== 0 ? 'text-[#B45309] font-medium' : 'text-[#6B7280]'}>
                      {driftVal > 0 ? `+${driftVal}` : driftVal}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={snap.status} drift={snap.drift} />
                    {snap.last_error && (
                      <p className="text-[11px] text-[#991B1B] mt-1 max-w-[200px] truncate" title={snap.last_error}>
                        {snap.last_error}
                      </p>
                    )}
                  </td>
                  <td className="px-4 py-3 text-[12px] text-[#666]">
                    {snap.last_synced_at ? new Date(snap.last_synced_at).toLocaleString() : '—'}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <form action={resyncAction}>
                      <button
                        type="submit"
                        className="flex items-center gap-1 text-[12px] px-3 py-1 rounded border border-[#E5E5E5] hover:border-[#1a1a1a] hover:text-[#1a1a1a] text-[#666] transition-colors"
                      >
                        <RefreshCw className="h-3 w-3" />
                        Resync
                      </button>
                    </form>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

