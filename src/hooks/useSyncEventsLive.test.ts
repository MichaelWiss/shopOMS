import { describe, expect, it } from 'vitest'
import { applyBatch } from '@/hooks/useSyncEventsLive'
import type { SyncEvent } from '@/types/sync'

function makeEvent(id: string, createdAt: string, overrides: Partial<SyncEvent> = {}): SyncEvent {
  return {
    id,
    created_at: createdAt,
    updated_at: createdAt,
    type: 'order',
    direction: 'shopify_to_odoo',
    status: 'pending',
    ...overrides,
  }
}

describe('applyBatch', () => {
  it('updates existing rows and keeps newest-first order', () => {
    const previous = [
      makeEvent('older', '2026-03-22T09:00:00.000Z'),
      makeEvent('existing', '2026-03-22T08:00:00.000Z', { status: 'pending' }),
    ]

    const incoming = [
      makeEvent('existing', '2026-03-22T08:00:00.000Z', { status: 'success' }),
      makeEvent('newer', '2026-03-22T10:00:00.000Z'),
    ]

    const result = applyBatch(previous, incoming, 10)

    expect(result.map(event => event.id)).toEqual(['newer', 'older', 'existing'])
    expect(result.find(event => event.id === 'existing')?.status).toBe('success')
  })

  it('caps retained rows at the configured limit', () => {
    const previous = [
      makeEvent('1', '2026-03-22T09:00:00.000Z'),
      makeEvent('2', '2026-03-22T08:00:00.000Z'),
    ]

    const incoming = [
      makeEvent('3', '2026-03-22T10:00:00.000Z'),
      makeEvent('4', '2026-03-22T11:00:00.000Z'),
    ]

    const result = applyBatch(previous, incoming, 3)

    expect(result.map(event => event.id)).toEqual(['4', '3', '1'])
    expect(result).toHaveLength(3)
  })
})