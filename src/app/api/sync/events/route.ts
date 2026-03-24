import { NextRequest, NextResponse } from 'next/server'
import { getSyncEvents, getSyncStats } from '@/lib/supabase'
import { parseSyncFilterFromSearchParams } from '@/lib/sync/stream-contract'

export async function GET(request: NextRequest) {
  const filter = parseSyncFilterFromSearchParams(request.nextUrl.searchParams)

  // Fetch data
  try {
    const [events, stats] = await Promise.all([
      getSyncEvents(filter),
      getSyncStats(),
    ])

    return NextResponse.json({
      events,
      stats,
      filter,
    })
  } catch {
    return NextResponse.json(
      { error: 'Failed to fetch sync events' },
      { status: 500 }
    )
  }
}
