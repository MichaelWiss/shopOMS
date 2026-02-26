import { shopifyEnv } from '@/lib/env'

/**
 * Shopify Admin API token manager using client credentials grant.
 *
 * Dev Dashboard apps don't get a static access token — they exchange
 * client_id + client_secret for a short-lived token (expires in 24h).
 * This module caches the token and auto-refreshes 60s before expiry.
 *
 * @see https://shopify.dev/docs/apps/build/dev-dashboard/get-api-access-tokens
 */

let cachedToken: string | null = null
let tokenExpiresAt = 0

export async function getAdminAccessToken(): Promise<string> {
  // Return cached token if still valid (with 60s buffer)
  if (cachedToken && Date.now() < tokenExpiresAt - 60_000) {
    return cachedToken
  }

  const domain = shopifyEnv.SHOPIFY_STORE_DOMAIN
  const response = await fetch(
    `https://${domain}/admin/oauth/access_token`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'client_credentials',
        client_id: shopifyEnv.SHOPIFY_CLIENT_ID,
        client_secret: shopifyEnv.SHOPIFY_CLIENT_SECRET,
      }),
    }
  )

  if (!response.ok) {
    const body = await response.text()
    throw new Error(
      `Shopify token request failed (${response.status}): ${body}`
    )
  }

  const { access_token, expires_in } = await response.json()
  cachedToken = access_token
  tokenExpiresAt = Date.now() + expires_in * 1000

  return cachedToken!
}
