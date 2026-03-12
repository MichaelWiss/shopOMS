'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useCallback } from 'react'
import { Search } from 'lucide-react'

const TYPE_OPTIONS = [
  { label: 'All Types', value: '' },
  { label: 'Orders', value: 'order' },
  { label: 'Inventory', value: 'inventory' },
  { label: 'Fulfillment', value: 'fulfillment' },
]

const STATUS_OPTIONS = [
  { label: 'All Status', value: '' },
  { label: 'Success', value: 'success' },
  { label: 'Pending', value: 'pending' },
  { label: 'Failed', value: 'failed' },
  { label: 'Retry', value: 'retry' },
]

const DATE_OPTIONS = [
  { label: 'All Time', value: '' },
  { label: 'Last 24 hours', value: '1' },
  { label: 'Last 7 days', value: '7' },
  { label: 'Last 30 days', value: '30' },
]

export function SyncFilters() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const type = searchParams.get('type') ?? ''
  const status = searchParams.get('status') ?? ''
  const days = searchParams.get('days') ?? ''
  const search = searchParams.get('q') ?? ''

  const updateParams = useCallback(
    (updates: Record<string, string>) => {
      const params = new URLSearchParams(searchParams.toString())
      for (const [key, val] of Object.entries(updates)) {
        if (val) {
          params.set(key, val)
        } else {
          params.delete(key)
        }
      }
      // Reset to page 1 on filter change
      params.delete('page')
      router.push(`?${params.toString()}`)
    },
    [router, searchParams],
  )

  return (
    <div className="bg-white rounded-lg border border-[#E5E5E5] p-4 mb-4">
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex-1 min-w-[200px] relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#999]" aria-hidden="true" />
          <input
            type="text"
            placeholder="Search logs..."
            defaultValue={search}
            onChange={(e) => updateParams({ q: e.target.value })}
            className="w-full pl-10 pr-4 py-2 border border-[#E5E5E5] rounded text-[13px] focus:outline-none focus:border-[#1a1a1a]"
            aria-label="Search sync logs"
          />
        </div>
        <select
          value={type}
          onChange={(e) => updateParams({ type: e.target.value })}
          className="border border-[#E5E5E5] rounded px-3 py-2 text-[13px] bg-white"
          aria-label="Filter by sync type"
        >
          {TYPE_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
        <select
          value={status}
          onChange={(e) => updateParams({ status: e.target.value })}
          className="border border-[#E5E5E5] rounded px-3 py-2 text-[13px] bg-white"
          aria-label="Filter by status"
        >
          {STATUS_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
        <select
          value={days}
          onChange={(e) => updateParams({ days: e.target.value })}
          className="border border-[#E5E5E5] rounded px-3 py-2 text-[13px] bg-white"
          aria-label="Filter by date range"
        >
          {DATE_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </div>
    </div>
  )
}

export function SyncPagination({
  currentPage,
  totalEvents,
  pageSize,
}: {
  currentPage: number
  totalEvents: number
  pageSize: number
}) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const totalPages = Math.max(1, Math.ceil(totalEvents / pageSize))

  const goToPage = useCallback(
    (page: number) => {
      const params = new URLSearchParams(searchParams.toString())
      if (page <= 1) {
        params.delete('page')
      } else {
        params.set('page', String(page))
      }
      router.push(`?${params.toString()}`)
    },
    [router, searchParams],
  )

  return (
    <div className="flex items-center justify-between mt-4">
      <p className="text-[12px] text-[#666]">
        Page {currentPage} of {totalPages} ({totalEvents} events)
      </p>
      <div className="flex items-center gap-2">
        <button
          disabled={currentPage <= 1}
          onClick={() => goToPage(currentPage - 1)}
          className="px-3 py-1.5 text-[12px] border border-[#E5E5E5] rounded bg-white hover:bg-[#FAFAFA] disabled:opacity-40 disabled:cursor-not-allowed"
          aria-label="Previous page"
        >
          Previous
        </button>
        <span className="px-3 py-1.5 text-[12px] border border-[#E5E5E5] rounded bg-[#1a1a1a] text-white" aria-current="page">
          {currentPage}
        </span>
        <button
          disabled={currentPage >= totalPages}
          onClick={() => goToPage(currentPage + 1)}
          className="px-3 py-1.5 text-[12px] border border-[#E5E5E5] rounded bg-white hover:bg-[#FAFAFA] disabled:opacity-40 disabled:cursor-not-allowed"
          aria-label="Next page"
        >
          Next
        </button>
      </div>
    </div>
  )
}
