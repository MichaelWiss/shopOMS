#!/usr/bin/env npx tsx
/**
 * Register Shopify webhooks via Admin API
 * 
 * Usage:
 *   npx tsx scripts/register-webhooks.ts [--list] [--delete-all]
 * 
 * Environment:
 *   WEBHOOK_BASE_URL - Base URL for webhook endpoints (e.g., https://your-app.vercel.app)
 *                      Falls back to NEXT_PUBLIC_APP_URL
 */

import { config } from 'dotenv'
config({ path: '.env.local' })

const SHOPIFY_STORE_DOMAIN = process.env.SHOPIFY_STORE_DOMAIN!
const SHOPIFY_CLIENT_ID = process.env.SHOPIFY_CLIENT_ID!
const SHOPIFY_CLIENT_SECRET = process.env.SHOPIFY_CLIENT_SECRET!
const SHOPIFY_API_VERSION = process.env.SHOPIFY_API_VERSION || '2024-01'
const WEBHOOK_BASE_URL = process.env.WEBHOOK_BASE_URL || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

// Webhooks to register
const WEBHOOKS = [
  { topic: 'ORDERS_CREATE', path: '/api/webhooks/orders/create' },
  { topic: 'ORDERS_CANCELLED', path: '/api/webhooks/orders/cancelled' },
  { topic: 'INVENTORY_LEVELS_UPDATE', path: '/api/webhooks/inventory/update' },
]

async function getAccessToken(): Promise<string> {
  const response = await fetch(
    `https://${SHOPIFY_STORE_DOMAIN}/admin/oauth/access_token`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'client_credentials',
        client_id: SHOPIFY_CLIENT_ID,
        client_secret: SHOPIFY_CLIENT_SECRET,
      }),
    }
  )

  if (!response.ok) {
    throw new Error(`Failed to get access token: ${response.status} ${await response.text()}`)
  }

  const { access_token } = await response.json()
  return access_token
}

async function graphql<T>(accessToken: string, query: string, variables?: Record<string, unknown>): Promise<T> {
  const response = await fetch(
    `https://${SHOPIFY_STORE_DOMAIN}/admin/api/${SHOPIFY_API_VERSION}/graphql.json`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Access-Token': accessToken,
      },
      body: JSON.stringify({ query, variables }),
    }
  )

  if (!response.ok) {
    throw new Error(`GraphQL request failed: ${response.status} ${await response.text()}`)
  }

  const json = await response.json()
  
  if (json.errors) {
    console.error('GraphQL errors:', JSON.stringify(json.errors, null, 2))
    throw new Error(`GraphQL errors: ${json.errors.map((e: { message: string }) => e.message).join(', ')}`)
  }

  return json.data
}

async function listWebhooks(accessToken: string) {
  const query = `
    query {
      webhookSubscriptions(first: 50) {
        edges {
          node {
            id
            topic
            endpoint {
              ... on WebhookHttpEndpoint {
                callbackUrl
              }
            }
            createdAt
          }
        }
      }
    }
  `

  interface WebhookNode {
    id: string
    topic: string
    endpoint: { callbackUrl: string }
    createdAt: string
  }

  const data = await graphql<{ webhookSubscriptions: { edges: Array<{ node: WebhookNode }> } }>(accessToken, query)
  return data.webhookSubscriptions.edges.map(e => e.node)
}

async function deleteWebhook(accessToken: string, id: string) {
  const mutation = `
    mutation webhookSubscriptionDelete($id: ID!) {
      webhookSubscriptionDelete(id: $id) {
        deletedWebhookSubscriptionId
        userErrors {
          field
          message
        }
      }
    }
  `

  interface DeleteResponse {
    webhookSubscriptionDelete: {
      deletedWebhookSubscriptionId: string | null
      userErrors: Array<{ field: string[]; message: string }>
    }
  }

  const data = await graphql<DeleteResponse>(accessToken, mutation, { id })
  
  if (data.webhookSubscriptionDelete.userErrors.length > 0) {
    console.error('Delete errors:', data.webhookSubscriptionDelete.userErrors)
    return false
  }
  
  return true
}

async function createWebhook(accessToken: string, topic: string, callbackUrl: string) {
  const mutation = `
    mutation webhookSubscriptionCreate($topic: WebhookSubscriptionTopic!, $webhookSubscription: WebhookSubscriptionInput!) {
      webhookSubscriptionCreate(topic: $topic, webhookSubscription: $webhookSubscription) {
        webhookSubscription {
          id
          topic
          endpoint {
            ... on WebhookHttpEndpoint {
              callbackUrl
            }
          }
        }
        userErrors {
          field
          message
        }
      }
    }
  `

  interface CreateResponse {
    webhookSubscriptionCreate: {
      webhookSubscription: {
        id: string
        topic: string
        endpoint: { callbackUrl: string }
      } | null
      userErrors: Array<{ field: string[]; message: string }>
    }
  }

  const data = await graphql<CreateResponse>(accessToken, mutation, {
    topic,
    webhookSubscription: {
      callbackUrl,
      format: 'JSON',
    },
  })

  if (data.webhookSubscriptionCreate.userErrors.length > 0) {
    console.error(`Failed to create webhook for ${topic}:`, data.webhookSubscriptionCreate.userErrors)
    return null
  }

  return data.webhookSubscriptionCreate.webhookSubscription
}

async function main() {
  const args = process.argv.slice(2)
  const listOnly = args.includes('--list')
  const deleteAll = args.includes('--delete-all')

  console.log('🔑 Getting access token...')
  const accessToken = await getAccessToken()
  console.log('✅ Got access token\n')

  // List existing webhooks
  console.log('📋 Current webhooks:')
  const existing = await listWebhooks(accessToken)
  
  if (existing.length === 0) {
    console.log('   (none)\n')
  } else {
    for (const wh of existing) {
      console.log(`   • ${wh.topic} → ${wh.endpoint.callbackUrl}`)
    }
    console.log()
  }

  if (listOnly) {
    return
  }

  // Delete all if requested
  if (deleteAll) {
    console.log('🗑️  Deleting all webhooks...')
    for (const wh of existing) {
      const deleted = await deleteWebhook(accessToken, wh.id)
      console.log(`   ${deleted ? '✅' : '❌'} Deleted ${wh.topic}`)
    }
    console.log()
  }

  // Register webhooks
  console.log(`📝 Registering webhooks (base URL: ${WEBHOOK_BASE_URL})...\n`)
  
  for (const { topic, path } of WEBHOOKS) {
    const callbackUrl = `${WEBHOOK_BASE_URL}${path}`
    
    // Check if already exists
    const existingWebhook = existing.find(
      wh => wh.topic === topic && wh.endpoint.callbackUrl === callbackUrl
    )
    
    if (existingWebhook && !deleteAll) {
      console.log(`   ⏭️  ${topic} already registered`)
      continue
    }

    const created = await createWebhook(accessToken, topic, callbackUrl)
    if (created) {
      console.log(`   ✅ ${topic} → ${callbackUrl}`)
    } else {
      console.log(`   ❌ ${topic} failed`)
    }
  }

  console.log('\n✨ Done!')
}

main().catch(err => {
  console.error('Error:', err.message)
  process.exit(1)
})
