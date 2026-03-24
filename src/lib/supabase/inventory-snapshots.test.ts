import { vi, describe, it, expect, beforeEach } from 'vitest'

// --- Mock setup (hoisted before imports) ---

const mockFrom = vi.fn()

vi.mock('@/lib/supabase/client', () => ({
  createServerClient: () => ({ from: mockFrom }),
}))

import { upsertInventorySnapshot, getInventorySnapshots, getInventorySnapshotBySku } from './inventory-snapshots'

// Builds a fluent chain readable by `await query` (thenable)
function makeChain(resolved: { data: unknown; error: unknown }) {
  const chain: Record<string, unknown> = {
    then: (resolve: (v: unknown) => void) => Promise.resolve(resolved).then(resolve),
  }
  ;['upsert', 'select', 'single', 'maybeSingle', 'order', 'eq', 'ilike', 'neq', 'in', 'limit', 'range'].forEach(
    (m) => { chain[m] = vi.fn().mockReturnValue(chain) }
  )
  return chain
}

describe('inventory-snapshots', () => {
  beforeEach(() => vi.clearAllMocks())

  describe('upsertInventorySnapshot', () => {
    it('returns null and logs on supabase error', async () => {
      const chain = makeChain({ data: null, error: { message: 'DB error' } })
      mockFrom.mockReturnValue(chain)

      const result = await upsertInventorySnapshot({ sku: 'SKU-1', location_id: '42', status: 'synced' })

      expect(result).toBeNull()
    })

    it('returns data on success', async () => {
      const row = { id: 'abc', sku: 'SKU-1', location_id: '42', status: 'synced', drift: 0 }
      const chain = makeChain({ data: row, error: null })
      mockFrom.mockReturnValue(chain)

      const result = await upsertInventorySnapshot({ sku: 'SKU-1', location_id: '42', status: 'synced' })

      expect(result).toEqual(row)
    })

    it('calls upsert on the correct table', async () => {
      const chain = makeChain({ data: {}, error: null })
      mockFrom.mockReturnValue(chain)

      await upsertInventorySnapshot({ sku: 'SKU-1', location_id: '42', status: 'pending' })

      expect(mockFrom).toHaveBeenCalledWith('inventory_snapshots')
      expect(chain.upsert as ReturnType<typeof vi.fn>).toHaveBeenCalledWith(
        expect.objectContaining({ sku: 'SKU-1', location_id: '42' }),
        { onConflict: 'sku,location_id' }
      )
    })
  })

  describe('getInventorySnapshots', () => {
    it('returns empty array on supabase error', async () => {
      const chain = makeChain({ data: null, error: { message: 'DB error' } })
      mockFrom.mockReturnValue(chain)

      const result = await getInventorySnapshots()
      expect(result).toEqual([])
    })

    it('returns data on success', async () => {
      const rows = [{ id: '1', sku: 'A', location_id: '1', status: 'synced', drift: 0 }]
      const chain = makeChain({ data: rows, error: null })
      mockFrom.mockReturnValue(chain)

      const result = await getInventorySnapshots()
      expect(result).toEqual(rows)
    })

    it('applies sku filter', async () => {
      const chain = makeChain({ data: [], error: null })
      mockFrom.mockReturnValue(chain)

      await getInventorySnapshots({ sku: 'SKU-X' })

      expect(chain.ilike as ReturnType<typeof vi.fn>).toHaveBeenCalledWith('sku', '%SKU-X%')
    })

    it('applies status filter', async () => {
      const chain = makeChain({ data: [], error: null })
      mockFrom.mockReturnValue(chain)

      await getInventorySnapshots({ status: 'failed' })

      expect(chain.eq as ReturnType<typeof vi.fn>).toHaveBeenCalledWith('status', 'failed')
    })

    it('applies driftOnly filter', async () => {
      const chain = makeChain({ data: [], error: null })
      mockFrom.mockReturnValue(chain)

      await getInventorySnapshots({ driftOnly: true })

      expect(chain.neq as ReturnType<typeof vi.fn>).toHaveBeenCalledWith('drift', 0)
    })
  })

  describe('getInventorySnapshotBySku', () => {
    it('returns null on error', async () => {
      const chain = makeChain({ data: null, error: { message: 'not found' } })
      mockFrom.mockReturnValue(chain)

      const result = await getInventorySnapshotBySku('SKU-1', '42')
      expect(result).toBeNull()
    })

    it('queries by sku and location_id', async () => {
      const row = { id: 'x', sku: 'SKU-1', location_id: '42', status: 'synced' }
      const chain = makeChain({ data: row, error: null })
      mockFrom.mockReturnValue(chain)

      await getInventorySnapshotBySku('SKU-1', '42')

      const eqMock = chain.eq as ReturnType<typeof vi.fn>
      expect(eqMock).toHaveBeenCalledWith('sku', 'SKU-1')
      expect(eqMock).toHaveBeenCalledWith('location_id', '42')
    })
  })
})
