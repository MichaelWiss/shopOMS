import { Queue } from 'bullmq'
import Redis from 'ioredis'
import { redisEnv } from '@/lib/env'

// Create Redis connection lazily
let _redis: Redis | null = null

export function getRedis(): Redis {
  if (!_redis) {
    _redis = new Redis(redisEnv.REDIS_URL, {
      maxRetriesPerRequest: null,
    })
    _redis.on('error', (err) => {
      console.error('[Redis] Connection error:', err.message)
    })
  }
  return _redis
}

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

// Shared default job options for memory management
const defaultRetentionOptions = {
  removeOnComplete: {
    count: 1000, // Keep last 1000 completed jobs
  },
  removeOnFail: {
    count: 5000, // Keep last 5000 failed jobs for debugging
  },
}

// Lazy queue creation (avoids Redis connection at module import time)
let _orderSyncQueue: Queue<OrderSyncJob> | null = null
let _inventorySyncQueue: Queue<InventorySyncJob> | null = null
let _fulfillmentSyncQueue: Queue<FulfillmentSyncJob> | null = null

export function getOrderSyncQueue(): Queue<OrderSyncJob> {
  if (!_orderSyncQueue) {
    _orderSyncQueue = new Queue<OrderSyncJob>(QUEUE_NAMES.ORDER_SYNC, {
      connection: getRedis(),
      defaultJobOptions: {
        attempts: 5,
        backoff: { type: 'exponential', delay: 1000 },
        ...defaultRetentionOptions,
      },
    })
  }
  return _orderSyncQueue
}

export function getInventorySyncQueue(): Queue<InventorySyncJob> {
  if (!_inventorySyncQueue) {
    _inventorySyncQueue = new Queue<InventorySyncJob>(QUEUE_NAMES.INVENTORY_SYNC, {
      connection: getRedis(),
      defaultJobOptions: {
        attempts: 3,
        backoff: { type: 'exponential', delay: 500 },
        ...defaultRetentionOptions,
      },
    })
  }
  return _inventorySyncQueue
}

export function getFulfillmentSyncQueue(): Queue<FulfillmentSyncJob> {
  if (!_fulfillmentSyncQueue) {
    _fulfillmentSyncQueue = new Queue<FulfillmentSyncJob>(QUEUE_NAMES.FULFILLMENT_SYNC, {
      connection: getRedis(),
      defaultJobOptions: {
        attempts: 5,
        backoff: { type: 'exponential', delay: 1000 },
        ...defaultRetentionOptions,
      },
    })
  }
  return _fulfillmentSyncQueue
}

// Helper to add jobs
export async function addOrderSyncJob(data: OrderSyncJob, priority?: number) {
  return getOrderSyncQueue().add('order-sync', data, { priority })
}

export async function addInventorySyncJob(data: InventorySyncJob) {
  return getInventorySyncQueue().add('inventory-sync', data)
}

export async function addFulfillmentSyncJob(data: FulfillmentSyncJob) {
  return getFulfillmentSyncQueue().add('fulfillment-sync', data)
}

// Queue health check
export async function getQueueStats() {
  const [orderCounts, inventoryCounts, fulfillmentCounts] = await Promise.all([
    getOrderSyncQueue().getJobCounts(),
    getInventorySyncQueue().getJobCounts(),
    getFulfillmentSyncQueue().getJobCounts(),
  ])

  return {
    orderSync: orderCounts,
    inventorySync: inventoryCounts,
    fulfillmentSync: fulfillmentCounts,
  }
}

// Get job by ID with progress
export async function getJobWithProgress(queueName: string, jobId: string) {
  let queue: Queue
  switch (queueName) {
    case QUEUE_NAMES.ORDER_SYNC:
      queue = getOrderSyncQueue()
      break
    case QUEUE_NAMES.INVENTORY_SYNC:
      queue = getInventorySyncQueue()
      break
    case QUEUE_NAMES.FULFILLMENT_SYNC:
      queue = getFulfillmentSyncQueue()
      break
    default:
      return null
  }

  const job = await queue.getJob(jobId)
  if (!job) return null

  const state = await job.getState()
  const progress = job.progress

  return {
    id: job.id,
    name: job.name,
    data: job.data,
    progress: typeof progress === 'number' ? progress : 0,
    state,
    attemptsMade: job.attemptsMade,
    failedReason: job.failedReason,
    processedOn: job.processedOn,
    finishedOn: job.finishedOn,
  }
}

// Get active jobs with progress
export async function getActiveJobsWithProgress() {
  const [orderJobs, inventoryJobs, fulfillmentJobs] = await Promise.all([
    getOrderSyncQueue().getJobs(['active', 'waiting', 'delayed']),
    getInventorySyncQueue().getJobs(['active', 'waiting', 'delayed']),
    getFulfillmentSyncQueue().getJobs(['active', 'waiting', 'delayed']),
  ])

  const formatJob = async (job: Awaited<ReturnType<Queue['getJob']>>, queueName: string) => {
    if (!job) return null
    const state = await job.getState()
    return {
      id: job.id,
      queue: queueName,
      progress: typeof job.progress === 'number' ? job.progress : 0,
      state,
      attemptsMade: job.attemptsMade,
      data: {
        type: (job.data as Record<string, unknown>).type,
        syncEventId: (job.data as Record<string, unknown>).syncEventId,
      },
    }
  }

  const [order, inventory, fulfillment] = await Promise.all([
    Promise.all(orderJobs.map(j => formatJob(j, QUEUE_NAMES.ORDER_SYNC))),
    Promise.all(inventoryJobs.map(j => formatJob(j, QUEUE_NAMES.INVENTORY_SYNC))),
    Promise.all(fulfillmentJobs.map(j => formatJob(j, QUEUE_NAMES.FULFILLMENT_SYNC))),
  ])

  return [...order, ...inventory, ...fulfillment].filter(Boolean)
}
