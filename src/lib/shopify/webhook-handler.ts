import { NextRequest, NextResponse } from 'next/server'
import { verifyWebhookSignature, extractWebhookMetadata } from '@/lib/shopify/webhooks'
import { createSyncEvent, updateSyncStatus } from '@/lib/supabase/sync-events'
import { inngest } from '@/lib/inngest/client'
import { rateLimiters, getClientIp } from '@/lib/rate-limit'
import type { SyncEvent } from '@/types/sync'
import type { ZodSchema } from 'zod'

interface WebhookConfig {
  /** Sync event type: 'order' | 'inventory' */
  syncType: SyncEvent['type']
  /** Inngest event name to dispatch */
  inngestEvent: string
  /** Extract the Shopify ID from the parsed payload */
  extractShopifyId: (payload: Record<string, unknown>) => string
  /** Build the Inngest event data from the payload + sync event */
  buildEventData: (payload: Record<string, unknown>, syncEventId: string, webhookId: string) => Record<string, unknown>
  /** Label for log messages, e.g. "Order created" */
  logLabel: string
  /** Optional Zod schema to validate the parsed payload */
  schema?: ZodSchema
}

/**
 * Shared handler for Shopify webhook POST routes.
 * Handles rate limiting, HMAC verification, sync event creation, and Inngest dispatch.
 */
export async function handleShopifyWebhook(request: NextRequest, config: WebhookConfig) {
  const ip = getClientIp(request.headers)
  const rateLimit = rateLimiters.webhook(ip)
  if (!rateLimit.success) {
    console.warn(`[Webhook] Rate limited IP: ${ip}`)
    return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 })
  }

  try {
    const rawBody = await request.text()
    const metadata = extractWebhookMetadata(request.headers)

    if (!verifyWebhookSignature(rawBody, metadata.hmacSha256)) {
      console.error('[Webhook] Invalid signature')
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
    }

    const payload: Record<string, unknown> = JSON.parse(rawBody)

    // Validate payload structure if schema provided
    if (config.schema) {
      const result = config.schema.safeParse(payload)
      if (!result.success) {
        console.error(`[Webhook] Invalid ${config.logLabel} payload:`, result.error.issues)
        return NextResponse.json({ error: 'Invalid webhook payload' }, { status: 400 })
      }
    }

    console.log(`[Webhook] ${config.logLabel}`)

    const syncEvent = await createSyncEvent({
      type: config.syncType,
      direction: 'shopify_to_odoo',
      status: 'pending',
      shopify_id: config.extractShopifyId(payload),
      source_payload: payload,
      webhook_id: metadata.webhookId || undefined,
    })

    if (!syncEvent) {
      console.error('[Webhook] Failed to create sync event')
      return NextResponse.json({ error: 'Failed to log event' }, { status: 500 })
    }

    try {
      await inngest.send({
        name: config.inngestEvent,
        data: config.buildEventData(payload, syncEvent.id!, metadata.webhookId || ''),
      })
    } catch (inngestError) {
      console.error('[Webhook] Failed to dispatch Inngest event:', inngestError)
      await updateSyncStatus(
        syncEvent.id!,
        'failed',
        { error_message: `Inngest dispatch failed: ${inngestError instanceof Error ? inngestError.message : 'Unknown error'}` },
      ).catch(() => {}) // best-effort update
      return NextResponse.json({ error: 'Failed to dispatch sync job' }, { status: 500 })
    }

    return NextResponse.json({ success: true, syncEventId: syncEvent.id })
  } catch (error) {
    console.error(`[Webhook] Error processing ${config.logLabel}:`, error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
