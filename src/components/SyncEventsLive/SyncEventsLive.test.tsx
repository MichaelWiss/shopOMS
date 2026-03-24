import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { SyncEventsLive } from '@/components/SyncEventsLive'
import type { UseSyncEventsLiveResult } from '@/hooks/useSyncEventsLive'

const retryConnectMock = vi.fn()

vi.mock('@/components/SyncFilters', () => ({
  SyncPagination: () => <div data-testid="sync-pagination" />,
}))

vi.mock('@/hooks/useSyncEventsLive', () => ({
  useSyncEventsLive: vi.fn((): UseSyncEventsLiveResult => ({
    events: [
      {
        id: 'sync-1',
        created_at: '2026-03-23T10:00:00.000Z',
        updated_at: '2026-03-23T10:00:00.000Z',
        type: 'order',
        direction: 'shopify_to_odoo',
        status: 'pending',
      },
    ],
    stats: {
      total: 1,
      pending: 1,
      processing: 0,
      success: 0,
      failed: 0,
      retry: 0,
      avgProcessingTime: 0,
    },
    connectionState: 'degraded',
    retryConnect: retryConnectMock,
  })),
}))

describe('SyncEventsLive', () => {
  it('shows degraded polling state and retries live connection on click', () => {
    render(
      <SyncEventsLive
        initialEvents={[]}
        initialStats={{
          total: 0,
          pending: 0,
          processing: 0,
          success: 0,
          failed: 0,
          retry: 0,
          avgProcessingTime: 0,
        }}
        filter={{}}
        searchQuery=""
        currentPage={1}
        pageSize={25}
      />,
    )

    const button = screen.getByRole('button', {
      name: 'Polling mode, click to try live reconnect',
    })

    expect(button.textContent).toContain('Polling (no live connection)')

    fireEvent.click(button)

    expect(retryConnectMock).toHaveBeenCalledTimes(1)
  })
})