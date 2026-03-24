import type { NextRequest } from 'next/server'
import { getSyncEvents, getSyncStats } from '@/lib/supabase/sync-events'
import {
  parseSyncFilterFromSearchParams,
  SYNC_STREAM_CONFIG,
  toSseFrame,
} from '@/lib/sync/stream-contract'
import type { SyncStats, SyncStreamMessage } from '@/types/sync'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

function statsChanged(a: SyncStats, b: SyncStats): boolean {
  return (
    a.total !== b.total ||
    a.pending !== b.pending ||
    a.processing !== b.processing ||
    a.success !== b.success ||
    a.failed !== b.failed ||
    a.retry !== b.retry ||
    a.avgProcessingTime !== b.avgProcessingTime
  )
}

export async function GET(request: NextRequest): Promise<Response> {
  const filter = parseSyncFilterFromSearchParams(request.nextUrl.searchParams)
  const encoder = new TextEncoder()
  let closed = false

  const stream = new ReadableStream({
    async start(controller) {
      function enqueue(message: SyncStreamMessage): void {
        if (closed) return
        try {
          controller.enqueue(encoder.encode(toSseFrame(message)))
        } catch {
          closed = true
        }
      }

      request.signal.addEventListener('abort', () => { closed = true }, { once: true })

      // Send initial snapshot
      try {
        const [events, stats] = await Promise.all([getSyncEvents(filter), getSyncStats()])
        enqueue({ type: 'snapshot', at: new Date().toISOString(), events, stats })

        // Tell the browser how long to wait before auto-reconnecting on drop
        controller.enqueue(encoder.encode(`retry: ${SYNC_STREAM_CONFIG.sseRetryMs}\n\n`))

        // Track event revisions for change detection: id -> updated_at
        const knownRevisions = new Map<string, string | undefined>()
        for (const event of events) {
          if (event.id) knownRevisions.set(event.id, event.updated_at)
        }
        let lastStats: SyncStats = stats
        let lastFrameSentAt = Date.now()

        // Polling loop — runs until client disconnects
        while (!closed) {
          await sleep(SYNC_STREAM_CONFIG.pollIntervalMs)
          if (closed) break

          const now = Date.now()

          try {
            const [currentEvents, currentStats] = await Promise.all([
              getSyncEvents(filter),
              getSyncStats(),
            ])

            let framesSent = false

            // Emit upsert for any new or changed event
            for (const event of currentEvents) {
              if (!event.id) continue
              const knownUpdatedAt = knownRevisions.get(event.id)
              if (knownUpdatedAt === undefined || knownUpdatedAt !== event.updated_at) {
                enqueue({ type: 'upsert', at: new Date().toISOString(), event })
                knownRevisions.set(event.id, event.updated_at)
                framesSent = true
              }
            }

            // Emit stats frame when any counter changes
            if (statsChanged(lastStats, currentStats)) {
              enqueue({ type: 'stats', at: new Date().toISOString(), stats: currentStats })
              lastStats = currentStats
              framesSent = true
            }

            if (framesSent) lastFrameSentAt = now
          } catch {
            enqueue({
              type: 'error',
              at: new Date().toISOString(),
              message: 'Poll failed — stream will continue',
            })
          }

          // Heartbeat when idle for heartbeatMs
          if (now - lastFrameSentAt >= SYNC_STREAM_CONFIG.heartbeatMs) {
            enqueue({ type: 'heartbeat', at: new Date().toISOString() })
            lastFrameSentAt = now
          }
        }
      } catch {
        enqueue({
          type: 'error',
          at: new Date().toISOString(),
          message: 'Failed to load initial snapshot',
        })
      }
    },
    cancel() {
      closed = true
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    },
  })
}
