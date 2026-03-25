import { NextResponse } from 'next/server'
import crypto from 'crypto'
import { shopifyEnv } from '@/lib/env'

const SCOPES = 'read_inventory,read_orders,read_products,write_inventory,write_orders,write_products'
const REDIRECT_URI = 'https://shop-oms.vercel.app/api/auth/callback'

export async function GET(): Promise<NextResponse> {
  const nonce = crypto.randomBytes(16).toString('hex')

  const params = new URLSearchParams({
    client_id: shopifyEnv.SHOPIFY_CLIENT_ID,
    scope: SCOPES,
    redirect_uri: REDIRECT_URI,
    state: nonce,
  })

  const authorizeUrl = `https://${shopifyEnv.SHOPIFY_STORE_DOMAIN}/admin/oauth/authorize?${params.toString()}`

  const response = NextResponse.redirect(authorizeUrl)

  // Store nonce in a short-lived cookie so callback can verify it
  response.cookies.set('shopify_install_state', nonce, {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    maxAge: 300, // 5 minutes — enough time to complete the OAuth flow
    path: '/',
  })

  return response
}
