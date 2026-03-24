import { vi, describe, it, expect, beforeEach } from 'vitest'

// --- Mock setup (hoisted before imports) ---

const mockFrom = vi.fn()

vi.mock('@/lib/supabase/client', () => ({
  createServerClient: () => ({ from: mockFrom }),
}))

import { upsertProductMapping, getProductMappings, getProductMappingBySku } from './product-mappings'

function makeChain(resolved: { data: unknown; error: unknown }) {
  const chain: Record<string, unknown> = {
    then: (resolve: (v: unknown) => void) => Promise.resolve(resolved).then(resolve),
  }
  ;['upsert', 'select', 'single', 'maybeSingle', 'order', 'eq', 'ilike', 'in', 'limit', 'range'].forEach(
    (m) => { chain[m] = vi.fn().mockReturnValue(chain) }
  )
  return chain
}

describe('product-mappings', () => {
  beforeEach(() => vi.clearAllMocks())

  describe('upsertProductMapping', () => {
    it('returns null on supabase error', async () => {
      mockFrom.mockReturnValue(makeChain({ data: null, error: { message: 'error' } }))
      const result = await upsertProductMapping({ sku: 'SKU-1', mapping_status: 'pending' })
      expect(result).toBeNull()
    })

    it('returns data on success', async () => {
      const row = { id: '1', sku: 'SKU-1', mapping_status: 'mapped', odoo_product_id: 42 }
      mockFrom.mockReturnValue(makeChain({ data: row, error: null }))
      const result = await upsertProductMapping({ sku: 'SKU-1', mapping_status: 'mapped', odoo_product_id: 42 })
      expect(result).toEqual(row)
    })

    it('calls upsert on product_mappings with onConflict sku', async () => {
      const chain = makeChain({ data: {}, error: null })
      mockFrom.mockReturnValue(chain)

      await upsertProductMapping({ sku: 'SKU-1', mapping_status: 'mapped' })

      expect(mockFrom).toHaveBeenCalledWith('product_mappings')
      expect(chain.upsert as ReturnType<typeof vi.fn>).toHaveBeenCalledWith(
        expect.objectContaining({ sku: 'SKU-1' }),
        { onConflict: 'sku' }
      )
    })
  })

  describe('getProductMappings', () => {
    it('returns empty array on error', async () => {
      mockFrom.mockReturnValue(makeChain({ data: null, error: { message: 'err' } }))
      const result = await getProductMappings()
      expect(result).toEqual([])
    })

    it('applies sku ilike filter', async () => {
      const chain = makeChain({ data: [], error: null })
      mockFrom.mockReturnValue(chain)

      await getProductMappings({ sku: 'PRESS' })

      expect(chain.ilike as ReturnType<typeof vi.fn>).toHaveBeenCalledWith('sku', '%PRESS%')
    })

    it('applies status filter', async () => {
      const chain = makeChain({ data: [], error: null })
      mockFrom.mockReturnValue(chain)

      await getProductMappings({ status: 'missing_odoo' })

      expect(chain.eq as ReturnType<typeof vi.fn>).toHaveBeenCalledWith('mapping_status', 'missing_odoo')
    })

    it('applies missingOnly filter using in()', async () => {
      const chain = makeChain({ data: [], error: null })
      mockFrom.mockReturnValue(chain)

      await getProductMappings({ missingOnly: true })

      expect(chain.in as ReturnType<typeof vi.fn>).toHaveBeenCalledWith(
        'mapping_status',
        ['missing_odoo', 'missing_sku', 'error']
      )
    })
  })

  describe('getProductMappingBySku', () => {
    it('returns null on error', async () => {
      mockFrom.mockReturnValue(makeChain({ data: null, error: { message: 'err' } }))
      expect(await getProductMappingBySku('SKU-X')).toBeNull()
    })

    it('queries by sku', async () => {
      const row = { id: '1', sku: 'SKU-X', mapping_status: 'mapped' }
      const chain = makeChain({ data: row, error: null })
      mockFrom.mockReturnValue(chain)

      await getProductMappingBySku('SKU-X')

      expect(chain.eq as ReturnType<typeof vi.fn>).toHaveBeenCalledWith('sku', 'SKU-X')
    })
  })
})
