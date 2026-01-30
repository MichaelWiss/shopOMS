const SHOPIFY_STORE_DOMAIN = process.env.SHOPIFY_STORE_DOMAIN!
const SHOPIFY_STOREFRONT_ACCESS_TOKEN = process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN!
const SHOPIFY_API_VERSION = process.env.SHOPIFY_API_VERSION || '2024-01'

interface GraphQLResponse<T> {
  data?: T
  errors?: Array<{ message: string }>
}

export async function shopifyStorefrontFetch<T>(
  query: string,
  variables?: Record<string, unknown>
): Promise<T> {
  const endpoint = `https://${SHOPIFY_STORE_DOMAIN}/api/${SHOPIFY_API_VERSION}/graphql.json`

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Storefront-Access-Token': SHOPIFY_STOREFRONT_ACCESS_TOKEN,
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
const SHOPIFY_ADMIN_ACCESS_TOKEN = process.env.SHOPIFY_ADMIN_ACCESS_TOKEN!

export async function shopifyAdminFetch<T>(
  query: string,
  variables?: Record<string, unknown>
): Promise<T> {
  const endpoint = `https://${SHOPIFY_STORE_DOMAIN}/admin/api/${SHOPIFY_API_VERSION}/graphql.json`

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Access-Token': SHOPIFY_ADMIN_ACCESS_TOKEN,
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
