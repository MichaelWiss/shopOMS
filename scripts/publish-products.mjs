#!/usr/bin/env node
/**
 * Publish all live-seed products to all sales channels.
 */
import { readFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const envPath = resolve(__dirname, '..', '.env.local')
const envLines = readFileSync(envPath, 'utf-8').split('\n')
const env = {}
for (const line of envLines) {
  const match = line.match(/^([^#=]+)=(.*)$/)
  if (match) env[match[1].trim()] = match[2].trim()
}

const SHOP = env.SHOPIFY_STORE_DOMAIN
const CLIENT_ID = env.SHOPIFY_CLIENT_ID
const CLIENT_SECRET = env.SHOPIFY_CLIENT_SECRET
const API_VERSION = env.SHOPIFY_API_VERSION || '2026-01'

async function getToken() {
  const res = await fetch(`https://${SHOP}/admin/oauth/access_token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ grant_type: 'client_credentials', client_id: CLIENT_ID, client_secret: CLIENT_SECRET }),
  })
  return (await res.json()).access_token
}

async function gql(token, query, variables = {}) {
  const res = await fetch(`https://${SHOP}/admin/api/${API_VERSION}/graphql.json`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-Shopify-Access-Token': token },
    body: JSON.stringify({ query, variables }),
  })
  return (await res.json())
}

async function main() {
  const token = await getToken()

  // Get publications
  const pubData = await gql(token, '{ publications(first: 10) { edges { node { id name } } } }')
  const publications = pubData.data.publications.edges.map(e => e.node)
  console.log('Publications:')
  publications.forEach(p => console.log(`  ${p.name} (${p.id})`))

  // Get products
  const prodData = await gql(token, '{ products(first: 50, query: "tag:live-seed") { edges { node { id title } } } }')
  const products = prodData.data.products.edges.map(e => e.node)
  console.log(`\nPublishing ${products.length} products to ${publications.length} channels...\n`)

  for (const product of products) {
    const input = publications.map(p => ({ publicationId: p.id }))
    const result = await gql(token, `
      mutation publishProduct($id: ID!, $input: [PublicationInput!]!) {
        publishablePublish(id: $id, input: $input) {
          publishable { ... on Product { title } }
          userErrors { field message }
        }
      }
    `, { id: product.id, input })

    const errors = result.data?.publishablePublish?.userErrors || []
    if (errors.length > 0) {
      console.log(`  ${product.title} — ERRORS: ${JSON.stringify(errors)}`)
    } else {
      console.log(`  ${product.title} — published`)
    }
  }

  // Verify via Storefront API
  console.log('\n--- Storefront API verification ---')
  const sfRes = await fetch(`https://${SHOP}/api/${API_VERSION}/graphql.json`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Shopify-Storefront-Private-Token': env.SHOPIFY_STOREFRONT_ACCESS_TOKEN },
    body: JSON.stringify({ query: '{ products(first: 20) { edges { node { title handle variants(first: 1) { edges { node { price { amount } } } } } } } }' }),
  })
  const sfData = await sfRes.json()
  const sfProducts = sfData.data?.products?.edges || []
  if (sfProducts.length === 0) {
    console.log('  No products visible via Storefront API yet (may take a moment to propagate)')
  } else {
    sfProducts.forEach(e => {
      const price = e.node.variants.edges[0]?.node?.price?.amount || '?'
      console.log(`  ${e.node.title} — $${price} (${e.node.handle})`)
    })
  }
}

main().catch(err => { console.error('Fatal:', err); process.exit(1) })
