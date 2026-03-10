'use client'

import { useTransition } from 'react'
import { RefreshCw } from 'lucide-react'
import { retrySyncEvent, retryAllFailed } from '@/app/actions/sync'

export function RetryAllButton() {
  const [isPending, startTransition] = useTransition()

  return (
    <button
      onClick={() => startTransition(async () => { await retryAllFailed() })}
      disabled={isPending}
      className="flex items-center gap-2 bg-[#1a1a1a] text-white px-4 py-2 text-[13px] rounded hover:bg-[#333] transition-colors disabled:opacity-50"
    >
      <RefreshCw className={`h-4 w-4 ${isPending ? 'animate-spin' : ''}`} />
      {isPending ? 'Retrying...' : 'Retry Failed'}
    </button>
  )
}

export function RetryButton({ syncEventId }: { syncEventId: string }) {
  const [isPending, startTransition] = useTransition()

  return (
    <button
      onClick={() => startTransition(async () => { await retrySyncEvent(syncEventId) })}
      disabled={isPending}
      className="text-[11px] px-2 py-0.5 rounded bg-[#1a1a1a] text-white hover:bg-[#333] transition-colors disabled:opacity-50"
      title="Retry this sync"
    >
      {isPending ? <RefreshCw className="h-3 w-3 animate-spin" /> : 'Retry'}
    </button>
  )
}
