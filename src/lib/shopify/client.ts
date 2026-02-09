import { shopifyEnv } from '@/lib/env'

interface GraphQLResponse<T> {
  data?: T
  errors?: Array<{ message: string }>
}

export async function shopifyStorefrontFetch<T>(
  query: string,
  variables?: Record<string, unknown>
): Promise<T> {
  const domain = shopifyEnv.SHOPIFY_STORE_DOMAIN
  const apiVersion = shopifyEnv.SHOPIFY_API_VERSION
  const endpoint = `https://${domain}/api/${apiVersion}/graphql.json`

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Storefront-Access-Token': shopifyEnv.SHOPIFY_STOREFRONT_ACCESS_TOKEN,
    },
    body: JSON.stringify({ query, variables }),
  })

  if (!response.ok) {
    throw new Error(`Shopify Storefront API error: ${response.status} ${response.statusText}`)
  }

  const json: GraphQLResponse<T> = await response.json()

  if (json.errors) {
    throw new Error(`GraphQL errors: ${json.errors.map(e => e.message).join(', ')}`)
  }

  if (!json.data) {
    throw new Error('No data returned from Shopify')
  }

  return json.data
}

// Admin API client for webhook management and order updates
export async function shopifyAdminFetch<T>(
  query: string,
  variables?: Record<string, unknown>
): Promise<T> {
  const domain = shopifyEnv.SHOPIFY_STORE_DOMAIN
  const apiVersion = shopifyEnv.SHOPIFY_API_VERSION
  const endpoint = `https://${domain}/admin/api/${apiVersion}/graphql.json`

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Access-Token': shopifyEnv.SHOPIFY_ADMIN_ACCESS_TOKEN,
    },
    body: JSON.stringify({ query, variables }),
  })

  if (!response.ok) {
    throw new Error(`Shopify Admin API error: ${response.status} ${response.statusText}`)
  }

  const json: GraphQLResponse<T> = await response.json()

  if (json.errors) {
    throw new Error(`GraphQL errors: ${json.errors.map(e => e.message).join(', ')}`)
  }

  if (!json.data) {
    throw new Error('No data returned from Shopify Admin')
  }

  return json.data
}
