import { vi, describe, it, expect, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'

// --- Mock setup (vi.hoisted ensures variables exist before factory functions run) ---

const { mockValidateSession, mockCookiesGet, mockGetInventorySnapshots } = vi.hoisted(() => ({
  mockValidateSession: vi.fn(),
  mockCookiesGet: vi.fn(),
  mockGetInventorySnapshots: vi.fn(),
}))

vi.mock('next/headers', () => ({
  cookies: vi.fn().mockResolvedValue({ get: mockCookiesGet }),
}))

vi.mock('@/lib/session', () => ({
  validateSession: (...a: unknown[]) => mockValidateSession(...a),
}))

vi.mock('@/lib/supabase/inventory-snapshots', () => ({
  getInventorySnapshots: (...a: unknown[]) => mockGetInventorySnapshots(...a),
}))

import { GET } from './route'

describe('GET /api/inventory', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockCookiesGet.mockReturnValue({ value: 'valid-token' })
    mockValidateSession.mockResolvedValue(true)
    mockGetInventorySnapshots.mockResolvedValue([])
  })

  it('returns 401 when no session cookie', async () => {
    mockCookiesGet.mockReturnValue(undefined)
    const res = await GET(new NextRequest('http://localhost/api/inventory'))
    expect(res.status).toBe(401)
    expect(await res.json()).toMatchObject({ error: 'Unauthorized' })
  })

  it('returns 401 when session is invalid', async () => {
    mockValidateSession.mockResolvedValueOnce(false)
    const res = await GET(new NextRequest('http://localhost/api/inventory'))
    expect(res.status).toBe(401)
  })

  it('returns 200 with snapshots array on success', async () => {
    const snapshot = { id: 'a', sku: 'SKU-1', location_id: '42', shopify_qty: 10, odoo_qty: 10, drift: 0, status: 'synced' }
    mockGetInventorySnapshots.mockResolvedValueOnce([snapshot])

    const res = await GET(new NextRequest('http://localhost/api/inventory'))
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body).toMatchObject({ snapshots: [snapshot], total: 1, limit: 50, offset: 0 })
  })

  it('returns 400 for non-numeric limit', async () => {
    const res = await GET(new NextRequest('http://localhost/api/inventory?limit=abc'))
    expect(res.status).toBe(400)
    const body = await res.json()
    expect(body).toHaveProperty('error', 'Invalid query parameters')
  })

  it('passes sku filter to query layer', async () => {
    await GET(new NextRequest('http://localhost/api/inventory?sku=MY-SKU'))
    expect(mockGetInventorySnapshots).toHaveBeenCalledWith(
      expect.objectContaining({ sku: 'MY-SKU' })
    )
  })

  it('passes drift_only=true to query layer as driftOnly', async () => {
    await GET(new NextRequest('http://localhost/api/inventory?drift_only=true'))
    expect(mockGetInventorySnapshots).toHaveBeenCalledWith(
      expect.objectContaining({ driftOnly: true })
    )
  })

  it('passes status filter to query layer', async () => {
    await GET(new NextRequest('http://localhost/api/inventory?status=failed'))
    expect(mockGetInventorySnapshots).toHaveBeenCalledWith(
      expect.objectContaining({ status: 'failed' })
    )
  })

  it('rejects invalid status enum values', async () => {
    const res = await GET(new NextRequest('http://localhost/api/inventory?status=invalid'))
    expect(res.status).toBe(400)
  })
})
