import { afterEach, describe, expect, it, vi } from 'vitest'
import { NextRequest } from 'next/server'
import { SYNC_STREAM_CONFIG } from '@/lib/sync/stream-contract'
import type { SyncEvent, SyncStats } from '@/types/sync'

const { getSyncEventsMock, getSyncStatsMock } = vi.hoisted(() => ({
  getSyncEventsMock: vi.fn<() => Promise<SyncEvent[]>>(),
  getSyncStatsMock: vi.fn<() => Promise<SyncStats>>(),
}))

vi.mock('@/lib/supabase/sync-events', () => ({
  getSyncEvents: getSyncEventsMock,
  getSyncStats: getSyncStatsMock,
}))

import { GET } from '@/app/api/sync/stream/route'

const decoder = new TextDecoder()

afterEach(() => {
  vi.clearAllMocks()
  vi.useRealTimers()
})

describe('GET /api/sync/stream', () => {
  it('returns an SSE response with snapshot and retry frames', async () => {
    vi.useFakeTimers()

    getSyncEventsMock.mockResolvedValue([
      {
        id: 'sync-1',
        created_at: '2026-03-23T10:00:00.000Z',
        updated_at: '2026-03-23T10:00:00.000Z',
        type: 'order',
        direction: 'shopify_to_odoo',
        status: 'pending',
      },
    ])
    getSyncStatsMock.mockResolvedValue({
      total: 1,
      pending: 1,
      processing: 0,
      success: 0,
      failed: 0,
      retry: 0,
      avgProcessingTime: 0,
    })

    const abortController = new AbortController()
    const request = new NextRequest('http://localhost:3000/api/sync/stream?type=order', {
      signal: abortController.signal,
    })

    const response = await GET(request)

    expect(response.headers.get('Content-Type')).toBe('text/event-stream')
    expect(response.headers.get('Cache-Control')).toBe('no-cache')
    expect(response.headers.get('Connection')).toBe('keep-alive')

    const reader = response.body?.getReader()

    expect(reader).toBeTruthy()

    const firstChunk = await reader!.read()
    const secondChunk = await reader!.read()
    const payload = decoder.decode(firstChunk.value) + decoder.decode(secondChunk.value)

    expect(payload).toContain('event: snapshot')
    expect(payload).toContain('"type":"snapshot"')
    expect(payload).toContain(`retry: ${SYNC_STREAM_CONFIG.sseRetryMs}`)

    abortController.abort()
    await vi.advanceTimersByTimeAsync(SYNC_STREAM_CONFIG.pollIntervalMs)
    await reader!.cancel()
  })
})