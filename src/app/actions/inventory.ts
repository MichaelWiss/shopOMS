'use server'

import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'
import { inngest } from '@/lib/inngest/client'
import { validateSession } from '@/lib/session'
import { getSyncEventById, updateSyncStatus } from '@/lib/supabase/sync-events'
import { getInventorySnapshotBySku } from '@/lib/supabase/inventory-snapshots'

async function requireAdmin() {
  const cookieStore = await cookies()
  const token = cookieStore.get('admin_session')?.value
  if (!token || !(await validateSession(token))) {
    return { authorized: false as const, error: 'Unauthorized' }
  }
  return { authorized: true as const }
}

export async function resyncInventoryRow(
  sku: string,
  locationId: string
): Promise<void> {
  const auth = await requireAdmin()
  if (!auth.authorized) return

  const snapshot = await getInventorySnapshotBySku(sku, locationId)
  if (!snapshot?.sync_event_id) return

  const event = await getSyncEventById(snapshot.sync_event_id)
  if (!event?.source_payload) return

  await updateSyncStatus(snapshot.sync_event_id, 'pending', {
    retry_count: (event.retry_count ?? 0) + 1,
    error_message: undefined,
    error_stack: undefined,
  })

  await inngest.send({
    name: 'shop-oms/inventory.sync',
    data: {
      type: 'inventory_update',
      inventoryData: event.source_payload,
      syncEventId: snapshot.sync_event_id,
      webhookId: event.webhook_id ?? '',
    },
  })

  revalidatePath('/admin/inventory')
}
