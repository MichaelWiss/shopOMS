'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { SYNC_STREAM_CONFIG } from '@/lib/sync/stream-contract'
import type { SyncEvent, SyncFilter, SyncStats, SyncStreamMessage } from '@/types/sync'

export type LiveConnectionState = 'connecting' | 'live' | 'degraded' | 'error'

export interface UseSyncEventsLiveResult {
  events: SyncEvent[]
  stats: SyncStats | null
  connectionState: LiveConnectionState
  retryConnect: () => void
}

// ── Pure helpers (testable in isolation) ──────────────────────────────────────

function buildStreamUrl(filter: SyncFilter): string {
  const params = new URLSearchParams()
  if (filter.type) params.set('type', filter.type)
  if (filter.status) params.set('status', filter.status)
  if (filter.startDate) params.set('startDate', filter.startDate)
  if (filter.endDate) params.set('endDate', filter.endDate)
  params.set('limit', String(SYNC_STREAM_CONFIG.maxRetainedRows))
  return `/api/sync/stream?${params.toString()}`
}

function buildEventsUrl(filter: SyncFilter): string {
  const params = new URLSearchParams()
  if (filter.type) params.set('type', filter.type)
  if (filter.status) params.set('status', filter.status)
  if (filter.startDate) params.set('startDate', filter.startDate)
  if (filter.endDate) params.set('endDate', filter.endDate)
  params.set('limit', String(SYNC_STREAM_CONFIG.maxRetainedRows))
  return `/api/sync/events?${params.toString()}`
}

/** Merge incoming events into prev, then cap at maxRows (newest-first). */
export function applyBatch(
  prev: SyncEvent[],
  incoming: SyncEvent[],
  maxRows: number,
): SyncEvent[] {
  const byId = new Map<string, SyncEvent>()
  for (const e of prev) {
    if (e.id) byId.set(e.id, e)
  }
  for (const e of incoming) {
    if (e.id) byId.set(e.id, e)
  }
  return Array.from(byId.values())
    .sort((a, b) => (b.created_at ?? '').localeCompare(a.created_at ?? ''))
    .slice(0, maxRows)
}

// ── Hook ──────────────────────────────────────────────────────────────────────

export function useSyncEventsLive(
  initialEvents: SyncEvent[],
  initialStats: SyncStats | null,
  filter: SyncFilter,
): UseSyncEventsLiveResult {
  const [events, setEvents] = useState<SyncEvent[]>(initialEvents)
  const [stats, setStats] = useState<SyncStats | null>(initialStats)
  const [connectionState, setConnectionState] = useState<LiveConnectionState>('connecting')

  const filterRef = useRef(filter)
  const esRef = useRef<EventSource | null>(null)
  const degradedTimerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // rAF buffering: accumulate upserts between animation frames
  const pendingUpserts = useRef<SyncEvent[]>([])
  const rafId = useRef<number | null>(null)

  const flushUpserts = useCallback(() => {
    rafId.current = null
    const batch = pendingUpserts.current
    if (batch.length === 0) return
    pendingUpserts.current = []
    setEvents(prev => applyBatch(prev, batch, SYNC_STREAM_CONFIG.maxRetainedRows))
  }, [])

  const scheduleFlush = useCallback(() => {
    if (rafId.current === null) {
      rafId.current = requestAnimationFrame(flushUpserts)
    }
  }, [flushUpserts])

  // ── Degraded polling fallback ────────────────────────────────────────────

  const startDegradedPolling = useCallback(() => {
    if (degradedTimerRef.current) return
    setConnectionState('degraded')

    const poll = async (): Promise<void> => {
      try {
        const res = await fetch(buildEventsUrl(filterRef.current))
        if (!res.ok) return
        const data = (await res.json()) as { events: SyncEvent[]; stats: SyncStats }
        setEvents(data.events.slice(0, SYNC_STREAM_CONFIG.maxRetainedRows))
        setStats(data.stats)
      } catch {
        // Keeps showing stale data until the next tick
      }
    }

    void poll()
    degradedTimerRef.current = setInterval(poll, SYNC_STREAM_CONFIG.degradedPollMs)
  }, [])

  const stopDegradedPolling = useCallback(() => {
    if (degradedTimerRef.current) {
      clearInterval(degradedTimerRef.current)
      degradedTimerRef.current = null
    }
  }, [])

  // ── SSE connection ───────────────────────────────────────────────────────

  const connect = useCallback(() => {
    esRef.current?.close()
    stopDegradedPolling()
    if (rafId.current !== null) cancelAnimationFrame(rafId.current)
    pendingUpserts.current = []
    rafId.current = null

    setConnectionState('connecting')
    const url = buildStreamUrl(filterRef.current)
    const es = new EventSource(url)
    esRef.current = es

    function handleMessage(e: MessageEvent): void {
      try {
        const msg = JSON.parse(e.data) as SyncStreamMessage
        switch (msg.type) {
          case 'snapshot':
            setEvents(msg.events.slice(0, SYNC_STREAM_CONFIG.maxRetainedRows))
            setStats(msg.stats)
            setConnectionState('live')
            break
          case 'upsert':
            pendingUpserts.current.push(msg.event)
            scheduleFlush()
            break
          case 'stats':
            setStats(msg.stats)
            break
          case 'heartbeat':
          case 'error':
            break
        }
      } catch {
        // ignore malformed frames
      }
    }

    es.addEventListener('snapshot', handleMessage)
    es.addEventListener('upsert', handleMessage)
    es.addEventListener('stats', handleMessage)
    es.addEventListener('heartbeat', handleMessage)
    es.addEventListener('error', handleMessage)

    es.onerror = () => {
      // readyState 0 = CONNECTING → browser is auto-reconnecting (retry: field controls interval)
      // readyState 2 = CLOSED → server rejected or permanent failure
      if (es.readyState === EventSource.CLOSED) {
        es.close()
        esRef.current = null
        startDegradedPolling()
      } else {
        setConnectionState('connecting')
      }
    }
  }, [scheduleFlush, startDegradedPolling, stopDegradedPolling])

  const retryConnect = useCallback(() => {
    connect()
  }, [connect])

  useEffect(() => {
    connect()
    return () => {
      esRef.current?.close()
      esRef.current = null
      stopDegradedPolling()
      if (rafId.current !== null) cancelAnimationFrame(rafId.current)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return { events, stats, connectionState, retryConnect }
}
