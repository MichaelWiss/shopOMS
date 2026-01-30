import { NextResponse } from 'next/server'
import { checkHealth as checkOdoo } from '@/lib/odoo'
import { getQueueStats } from '@/lib/queue'
import { getSyncStats } from '@/lib/supabase'

export async function GET() {
  const checks: Record<string, { status: 'ok' | 'error'; message?: string; data?: unknown }> = {}

  // Check Odoo connection
  try {
    const odooHealthy = await checkOdoo()
    checks.odoo = odooHealthy
      ? { status: 'ok' }
      : { status: 'error', message: 'Failed to authenticate' }
  } catch (error) {
    checks.odoo = {
      status: 'error',
      message: error instanceof Error ? error.message : 'Unknown error',
    }
  }

  // Check queue stats
  try {
    const queueStats = await getQueueStats()
    checks.queues = { status: 'ok', data: queueStats }
  } catch (error) {
    checks.queues = {
      status: 'error',
      message: error instanceof Error ? error.message : 'Unknown error',
    }
  }

  // Check sync stats from Supabase
  try {
    const syncStats = await getSyncStats()
    checks.syncEvents = { status: 'ok', data: syncStats }
  } catch (error) {
    checks.syncEvents = {
      status: 'error',
      message: error instanceof Error ? error.message : 'Unknown error',
    }
  }

  const allHealthy = Object.values(checks).every(c => c.status === 'ok')

  return NextResponse.json(
    {
      status: allHealthy ? 'healthy' : 'degraded',
      timestamp: new Date().toISOString(),
      checks,
    },
    { status: allHealthy ? 200 : 503 }
  )
}
