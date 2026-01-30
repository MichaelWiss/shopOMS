import { Queue, Worker, Job } from 'bullmq'
import Redis from 'ioredis'

const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379'

// Create Redis connection
export const redis = new Redis(REDIS_URL, {
  maxRetriesPerRequest: null,
})

// Queue names
export const QUEUE_NAMES = {
  ORDER_SYNC: 'order-sync',
  INVENTORY_SYNC: 'inventory-sync',
  FULFILLMENT_SYNC: 'fulfillment-sync',
  CUSTOMER_SYNC: 'customer-sync',
} as const

// Job types
export interface OrderSyncJob {
  type: 'order_create' | 'order_update' | 'order_cancel'
  shopifyOrder: Record<string, unknown>
  syncEventId: string
  webhookId: string
}

export interface InventorySyncJob {
  type: 'inventory_update'
  inventoryData: Record<string, unknown>
  syncEventId: string
  webhookId: string
}

export interface FulfillmentSyncJob {
  type: 'fulfillment_create' | 'fulfillment_update'
  fulfillmentData: Record<string, unknown>
  syncEventId: string
  webhookId: string
}

// Create queues
export const orderSyncQueue = new Queue<OrderSyncJob>(QUEUE_NAMES.ORDER_SYNC, {
  connection: redis,
  defaultJobOptions: {
    attempts: 5,
    backoff: {
      type: 'exponential',
      delay: 1000,
    },
    removeOnComplete: {
      count: 1000, // Keep last 1000 completed jobs
    },
    removeOnFail: {
      count: 5000, // Keep last 5000 failed jobs for debugging
    },
  },
})

export const inventorySyncQueue = new Queue<InventorySyncJob>(QUEUE_NAMES.INVENTORY_SYNC, {
  connection: redis,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 500,
    },
  },
})

export const fulfillmentSyncQueue = new Queue<FulfillmentSyncJob>(QUEUE_NAMES.FULFILLMENT_SYNC, {
  connection: redis,
  defaultJobOptions: {
    attempts: 5,
    backoff: {
      type: 'exponential',
      delay: 1000,
    },
  },
})

// Helper to add jobs
export async function addOrderSyncJob(data: OrderSyncJob, priority?: number) {
  return orderSyncQueue.add('order-sync', data, { priority })
}

export async function addInventorySyncJob(data: InventorySyncJob) {
  return inventorySyncQueue.add('inventory-sync', data)
}

export async function addFulfillmentSyncJob(data: FulfillmentSyncJob) {
  return fulfillmentSyncQueue.add('fulfillment-sync', data)
}

// Queue health check
export async function getQueueStats() {
  const [orderCounts, inventoryCounts, fulfillmentCounts] = await Promise.all([
    orderSyncQueue.getJobCounts(),
    inventorySyncQueue.getJobCounts(),
    fulfillmentSyncQueue.getJobCounts(),
  ])

  return {
    orderSync: orderCounts,
    inventorySync: inventoryCounts,
    fulfillmentSync: fulfillmentCounts,
  }
}
