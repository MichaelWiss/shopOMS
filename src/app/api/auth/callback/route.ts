import { type NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { shopifyEnv } from '@/lib/env'

/**
 * Shopify OAuth callback — completes the app installation handshake.
 *
 * Shopify calls this URL with: code, hmac, shop, state, timestamp
 * We verify the HMAC, exchange the code for a token (to complete install),
 * then redirect to /admin. The token is discarded — the app uses the
 * client_credentials grant for ongoing Admin API access.
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  const { searchParams } = request.nextUrl
  const code = searchParams.get('code')
  const shop = searchParams.get('shop')
  const hmac = searchParams.get('hmac')
  const state = searchParams.get('state')
  const timestamp = searchParams.get('timestamp')

  // --- Basic param validation ---
  if (!code || !shop || !hmac || !state || !timestamp) {
    return NextResponse.json({ error: 'Missing required OAuth parameters' }, { status: 400 })
  }

  // --- Validate the shop matches our store ---
  if (shop !== shopifyEnv.SHOPIFY_STORE_DOMAIN) {
    return NextResponse.json({ error: 'Shop domain mismatch' }, { status: 403 })
  }

  // --- Verify state nonce matches cookie to prevent CSRF ---
  const storedState = request.cookies.get('shopify_install_state')?.value
  if (!storedState || storedState !== state) {
    return NextResponse.json({ error: 'State mismatch — possible CSRF attack' }, { status: 403 })
  }

  // --- Verify Shopify HMAC ---
  // HMAC is computed over all query params EXCEPT hmac, sorted alphabetically, joined as key=value&...
  const params: Record<string, string> = {}
  searchParams.forEach((value, key) => {
    if (key !== 'hmac') params[key] = value
  })
  const message = Object.keys(params)
    .sort()
    .map((k) => `${k}=${params[k]}`)
    .join('&')

  const computedHmac = crypto
    .createHmac('sha256', shopifyEnv.SHOPIFY_CLIENT_SECRET)
    .update(message)
    .digest('hex')

  let hmacValid = false
  try {
    hmacValid = crypto.timingSafeEqual(Buffer.from(hmac, 'hex'), Buffer.from(computedHmac, 'hex'))
  } catch {
    hmacValid = false
  }

  if (!hmacValid) {
    return NextResponse.json({ error: 'Invalid HMAC — request may be forged' }, { status: 401 })
  }

  // --- Exchange authorization code for access token (completes install) ---
  const tokenResponse = await fetch(`https://${shop}/admin/oauth/access_token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      client_id: shopifyEnv.SHOPIFY_CLIENT_ID,
      client_secret: shopifyEnv.SHOPIFY_CLIENT_SECRET,
      code,
    }),
  })

  if (!tokenResponse.ok) {
    const body = await tokenResponse.text()
    console.error('[Auth] Token exchange failed:', tokenResponse.status, body)
    return NextResponse.json({ error: 'Token exchange failed — app may not be authorized' }, { status: 500 })
  }

  // Token is discarded — the app uses client_credentials for ongoing API access.
  // The exchange above is purely to complete the OAuth installation handshake.
  await tokenResponse.json()

  // --- Clear the nonce cookie and redirect to admin ---
  const redirect = NextResponse.redirect(new URL('/admin', request.nextUrl.origin))
  redirect.cookies.delete('shopify_install_state')
  return redirect
}
