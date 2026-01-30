import { NextRequest, NextResponse } from 'next/server'
import { getSyncEvents, getSyncStats } from '@/lib/supabase'
import type { SyncFilter } from '@/types/sync'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams

  // Parse query params
  const filter: SyncFilter = {}

  const type = searchParams.get('type')
  if (type && ['order', 'inventory', 'fulfillment', 'customer', 'product'].includes(type)) {
    filter.type = type as SyncFilter['type']
  }

  const status = searchParams.get('status')
  if (status && ['pending', 'processing', 'success', 'failed', 'retry'].includes(status)) {
    filter.status = status as SyncFilter['status']
  }

  const startDate = searchParams.get('startDate')
  if (startDate) {
    filter.startDate = startDate
  }

  const endDate = searchParams.get('endDate')
  if (endDate) {
    filter.endDate = endDate
  }

  const limit = searchParams.get('limit')
  filter.limit = limit ? parseInt(limit, 10) : 50

  const offset = searchParams.get('offset')
  if (offset) {
    filter.offset = parseInt(offset, 10)
  }

  // Fetch data
  const [events, stats] = await Promise.all([
    getSyncEvents(filter),
    getSyncStats(),
  ])

  return NextResponse.json({
    events,
    stats,
    filter,
  })
}
