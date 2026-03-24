import { describe, it, expect } from 'vitest'
import type {
  SyncEvent, SyncStats, SyncStatus, SyncType, SyncDirection,
  InventorySnapshot, ProductMapping, InventorySnapshotStatus, MappingStatus,
} from '@/types/sync'

describe('Sync Types', () => {
  describe('SyncEvent structure', () => {
    it('should create valid sync event', () => {
      const event: SyncEvent = {
        type: 'order',
        direction: 'shopify_to_odoo',
        status: 'pending',
        shopify_id: 'gid://shopify/Order/123',
      }

      expect(event.type).toBe('order')
      expect(event.direction).toBe('shopify_to_odoo')
      expect(event.status).toBe('pending')
    })

    it('should support all sync types', () => {
      const types: SyncType[] = ['order', 'inventory', 'fulfillment', 'customer', 'product']
      types.forEach(type => {
        const event: SyncEvent = { type, direction: 'shopify_to_odoo', status: 'pending' }
        expect(event.type).toBe(type)
      })
    })

    it('should support all sync statuses', () => {
      const statuses: SyncStatus[] = ['pending', 'processing', 'success', 'failed', 'retry']
      statuses.forEach(status => {
        const event: SyncEvent = { type: 'order', direction: 'shopify_to_odoo', status }
        expect(event.status).toBe(status)
      })
    })

    it('should support both directions', () => {
      const directions: SyncDirection[] = ['shopify_to_odoo', 'odoo_to_shopify']
      directions.forEach(direction => {
        const event: SyncEvent = { type: 'order', direction, status: 'pending' }
        expect(event.direction).toBe(direction)
      })
    })

    it('should include error details', () => {
      const event: SyncEvent = {
        type: 'order',
        direction: 'shopify_to_odoo',
        status: 'failed',
        error_message: 'Connection timeout',
        error_stack: 'Error: Connection timeout\n    at ...',
        retry_count: 3,
        max_retries: 5,
      }

      expect(event.error_message).toBe('Connection timeout')
      expect(event.retry_count).toBe(3)
      expect(event.max_retries).toBe(5)
    })
  })

  describe('SyncStats structure', () => {
    it('should calculate stats correctly', () => {
      const stats: SyncStats = {
        total: 100,
        pending: 5,
        processing: 2,
        success: 90,
        failed: 3,
        retry: 0,
        avgProcessingTime: 1250,
      }

      expect(stats.total).toBe(100)
      expect(stats.pending + stats.processing + stats.success + stats.failed + stats.retry).toBe(100)
      expect(stats.avgProcessingTime).toBe(1250)
    })

    it('should handle zero stats', () => {
      const stats: SyncStats = {
        total: 0,
        pending: 0,
        processing: 0,
        success: 0,
        failed: 0,
        retry: 0,
        avgProcessingTime: 0,
      }

      expect(stats.total).toBe(0)
      expect(stats.avgProcessingTime).toBe(0)
    })
  })
})

describe('Sync Status Transitions', () => {
  it('should follow valid state transitions', () => {
    const validTransitions: Record<SyncStatus, SyncStatus[]> = {
      pending: ['processing'],
      processing: ['success', 'failed', 'retry'],
      success: [], // Terminal state
      failed: [], // Terminal state (or can retry manually)
      retry: ['processing'],
    }

    // Pending -> Processing
    expect(validTransitions.pending).toContain('processing')
    
    // Processing -> Success/Failed/Retry
    expect(validTransitions.processing).toContain('success')
    expect(validTransitions.processing).toContain('failed')
    expect(validTransitions.processing).toContain('retry')
    
    // Retry -> Processing
    expect(validTransitions.retry).toContain('processing')
  })
})

describe('Processing Time Calculations', () => {
  it('should calculate duration in milliseconds', () => {
    const startTime = Date.now()
    // Simulate some work
    const processingTimeMs = Date.now() - startTime
    
    expect(processingTimeMs).toBeGreaterThanOrEqual(0)
    expect(typeof processingTimeMs).toBe('number')
  })

  it('should format duration for display', () => {
    const formatDuration = (ms: number): string => {
      if (ms < 1000) return `${ms}ms`
      return `${(ms / 1000).toFixed(1)}s`
    }

    expect(formatDuration(500)).toBe('500ms')
    expect(formatDuration(1000)).toBe('1.0s')
    expect(formatDuration(1500)).toBe('1.5s')
    expect(formatDuration(12500)).toBe('12.5s')
  })
})

describe('InventorySnapshot types', () => {
  it('should accept all valid statuses', () => {
    const statuses: InventorySnapshotStatus[] = ['synced', 'failed', 'pending', 'drift']
    statuses.forEach(status => {
      const snap: InventorySnapshot = { sku: 'SKU-1', location_id: '42', status }
      expect(snap.status).toBe(status)
    })
  })

  it('should accept optional qty and drift fields', () => {
    const snap: InventorySnapshot = {
      sku: 'SKU-1',
      location_id: '42',
      status: 'synced',
      shopify_qty: 10,
      odoo_qty: 10,
      drift: 0,
      last_synced_at: '2026-03-23T00:00:00Z',
    }
    expect(snap.drift).toBe(0)
    expect(snap.shopify_qty).toBe(10)
  })

  it('should allow null for optional fields', () => {
    const snap: InventorySnapshot = {
      sku: 'MISSING',
      location_id: '1',
      status: 'failed',
      shopify_qty: null,
      odoo_qty: null,
      last_error: 'Odoo product not found',
      sync_event_id: null,
    }
    expect(snap.last_error).toBe('Odoo product not found')
    expect(snap.odoo_qty).toBeNull()
  })
})

describe('ProductMapping types', () => {
  it('should accept all valid mapping statuses', () => {
    const statuses: MappingStatus[] = ['mapped', 'missing_odoo', 'missing_sku', 'error', 'pending']
    statuses.forEach(mapping_status => {
      const m: ProductMapping = { sku: 'SKU-1', mapping_status }
      expect(m.mapping_status).toBe(mapping_status)
    })
  })

  it('should accept a fully mapped product', () => {
    const m: ProductMapping = {
      sku: 'PRESS-TEE-001',
      shopify_inventory_item_id: '123456789',
      odoo_product_id: 42,
      odoo_product_name: 'Press Tee',
      mapping_status: 'mapped',
      last_checked_at: '2026-03-23T00:00:00Z',
    }
    expect(m.odoo_product_id).toBe(42)
    expect(m.mapping_status).toBe('mapped')
  })

  it('should accept a mapping with missing Odoo side', () => {
    const m: ProductMapping = {
      sku: 'UNKNOWN-SKU',
      shopify_inventory_item_id: '987',
      odoo_product_id: null,
      mapping_status: 'missing_odoo',
      last_error: 'No product found with this SKU in Odoo',
    }
    expect(m.odoo_product_id).toBeNull()
    expect(m.mapping_status).toBe('missing_odoo')
  })
})
