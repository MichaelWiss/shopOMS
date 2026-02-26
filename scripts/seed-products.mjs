#!/usr/bin/env node
/**
 * Delete all products tagged with 'live-seed' then re-seed with proper variants.
 * Uses productVariantsBulkCreate / productVariantsBulkUpdate (2026-01 API).
 */

import { readFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))

// Load .env.local
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
  const { access_token } = await res.json()
  return access_token
}

async function gql(token, query, variables = {}) {
  const res = await fetch(`https://${SHOP}/admin/api/${API_VERSION}/graphql.json`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-Shopify-Access-Token': token },
    body: JSON.stringify({ query, variables }),
  })
  const json = await res.json()
  if (json.errors) {
    console.error('GQL errors:', JSON.stringify(json.errors, null, 2))
    throw new Error(json.errors[0].message)
  }
  return json.data
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)) }

// ---- Step 1: Delete existing live-seed products ----
async function deleteExisting(token) {
  const data = await gql(token, '{ products(first: 50, query: "tag:live-seed") { edges { node { id title } } } }')
  const prods = data.products.edges.map(e => e.node)
  if (prods.length === 0) { console.log('No existing live-seed products to delete.'); return }
  
  for (const p of prods) {
    console.log(`  Deleting ${p.title}...`)
    await gql(token, 'mutation($id: ID!) { productDelete(input: { id: $id }) { deletedProductId userErrors { field message } } }', { id: p.id })
    await sleep(300)
  }
  console.log(`Deleted ${prods.length} products.\n`)
}

// ---- Product definitions ----
const products = [
  {
    title: '[LIVE] The Classicist', productType: 'Business Card', tags: ['CLASSIC', 'LETTERPRESS', 'live-seed'],
    descriptionHtml: '<p>The Classicist is set in the elegant Centaur, with contact information in Bell italics.</p><p>The card\'s contemporary layout is tempered with traditional typefaces, lending the design a clean and well crafted look.</p><h3>Specifications</h3><ul><li>U.S. Standard (2" x 3.5")</li><li>Neenah Cotton, Pearl White</li><li>Black ink</li><li>Hand printed on a 1945 Chandler &amp; Price</li></ul>',
    optionName: 'Quantity & Paper',
    variants: [
      { option: '50 cards / 110lb', price: '90.00', sku: 'CLASSIC-50-STD' },
      { option: '50 cards / 220lb', price: '110.00', sku: 'CLASSIC-50-DBL' },
      { option: '100 cards / 110lb', price: '140.00', sku: 'CLASSIC-100-STD' },
      { option: '100 cards / 220lb', price: '160.00', sku: 'CLASSIC-100-DBL' },
      { option: '250 cards / 110lb', price: '280.00', sku: 'CLASSIC-250-STD' },
      { option: '500 cards / 110lb', price: '480.00', sku: 'CLASSIC-500-STD' },
    ],
  },
  {
    title: '[LIVE] The Modernist', productType: 'Business Card', tags: ['MODERN', 'MINIMAL', 'live-seed'],
    descriptionHtml: '<p>The Modernist is set in clean Helvetica Neue, with generous white space throughout.</p><p>Clean lines and contemporary typography. Perfect for architects, designers, and minimalists.</p><h3>Specifications</h3><ul><li>U.S. Standard (2" x 3.5")</li><li>Neenah Cotton, Bright White</li><li>Black ink</li><li>Hand printed on a 1962 Heidelberg Windmill</li></ul>',
    optionName: 'Quantity & Paper',
    variants: [
      { option: '50 cards / 110lb', price: '95.00', sku: 'MODERN-50-STD' },
      { option: '50 cards / 220lb', price: '115.00', sku: 'MODERN-50-DBL' },
      { option: '100 cards / 110lb', price: '150.00', sku: 'MODERN-100-STD' },
      { option: '250 cards / 110lb', price: '300.00', sku: 'MODERN-250-STD' },
      { option: '500 cards / 110lb', price: '520.00', sku: 'MODERN-500-STD' },
    ],
  },
  {
    title: '[LIVE] The Artisan', productType: 'Business Card', tags: ['ARTISAN', 'TWO-COLOR', 'live-seed'],
    descriptionHtml: '<p>The Artisan features two-color letterpress printing with Bodoni and script accents.</p><p>Two-color printing adds depth and character. Perfect for creative professionals.</p><h3>Specifications</h3><ul><li>U.S. Standard (2" x 3.5")</li><li>Neenah Cotton, Ivory</li><li>Navy blue + Gold ink</li><li>Hand printed on a 1945 Chandler &amp; Price</li></ul>',
    optionName: 'Quantity & Paper',
    variants: [
      { option: '50 cards / 110lb', price: '110.00', sku: 'ARTISAN-50-STD' },
      { option: '50 cards / 220lb', price: '135.00', sku: 'ARTISAN-50-DBL' },
      { option: '100 cards / 110lb', price: '175.00', sku: 'ARTISAN-100-STD' },
      { option: '250 cards / 110lb', price: '350.00', sku: 'ARTISAN-250-STD' },
      { option: '500 cards / 110lb', price: '600.00', sku: 'ARTISAN-500-STD' },
    ],
  },
  {
    title: '[LIVE] The Minimalist', productType: 'Business Card', tags: ['MINIMAL', 'CLEAN', 'live-seed'],
    descriptionHtml: '<p>The Minimalist is stripped back to the essentials, set in contemporary Inter.</p><p>A design that lets the quality of the paper and print speak for itself.</p><h3>Specifications</h3><ul><li>U.S. Standard (2" x 3.5")</li><li>Neenah Cotton, Pearl White</li><li>Grey ink</li><li>Hand printed on a 1955 Vandercook Proof Press</li></ul>',
    optionName: 'Quantity & Paper',
    variants: [
      { option: '50 cards / 110lb', price: '85.00', sku: 'MINIMAL-50-STD' },
      { option: '50 cards / 220lb', price: '105.00', sku: 'MINIMAL-50-DBL' },
      { option: '100 cards / 110lb', price: '135.00', sku: 'MINIMAL-100-STD' },
      { option: '250 cards / 110lb', price: '270.00', sku: 'MINIMAL-250-STD' },
      { option: '500 cards / 110lb', price: '460.00', sku: 'MINIMAL-500-STD' },
    ],
  },
  {
    title: '[LIVE] The Correspondent', productType: 'Business Card', tags: ['CALLING CARD', 'SCRIPT', 'live-seed'],
    descriptionHtml: '<p>The Correspondent is set in graceful Bickham Script, recalling the tradition of the personal calling card.</p><p>A timeless format, elegant in its simplicity, perfect for social introductions.</p><h3>Specifications</h3><ul><li>U.S. Standard (2" x 3.5")</li><li>Neenah Cotton, Natural White</li><li>Black ink</li><li>Hand printed on a 1945 Chandler &amp; Price</li></ul>',
    optionName: 'Quantity & Paper',
    variants: [
      { option: '50 cards / 110lb', price: '75.00', sku: 'CORRESP-50-STD' },
      { option: '100 cards / 110lb', price: '120.00', sku: 'CORRESP-100-STD' },
      { option: '250 cards / 110lb', price: '240.00', sku: 'CORRESP-250-STD' },
      { option: '500 cards / 110lb', price: '400.00', sku: 'CORRESP-500-STD' },
    ],
  },
  {
    title: '[LIVE] The Bauhaus', productType: 'Business Card', tags: ['BAUHAUS', 'BOLD', 'live-seed'],
    descriptionHtml: '<p>The Bauhaus is set in bold Futura, inspired by the geometric clarity of the Bauhaus movement.</p><p>Strong, confident typography with generous ink coverage.</p><h3>Specifications</h3><ul><li>U.S. Standard (2" x 3.5")</li><li>Neenah Cotton, Bright White</li><li>Black ink</li><li>Hand printed on a 1962 Heidelberg Windmill</li></ul>',
    optionName: 'Quantity & Paper',
    variants: [
      { option: '50 cards / 110lb', price: '100.00', sku: 'BAUHAUS-50-STD' },
      { option: '100 cards / 110lb', price: '160.00', sku: 'BAUHAUS-100-STD' },
      { option: '250 cards / 110lb', price: '320.00', sku: 'BAUHAUS-250-STD' },
      { option: '500 cards / 110lb', price: '540.00', sku: 'BAUHAUS-500-STD' },
    ],
  },
  {
    title: '[LIVE] The Editor', productType: 'Business Card', tags: ['CLASSIC', 'EDITORIAL', 'live-seed'],
    descriptionHtml: '<p>The Editor is set in refined Caslon, the quintessential typeface of the publishing world.</p><p>Clean, authoritative, and understated. Perfect for editors, writers, and publishing professionals.</p><h3>Specifications</h3><ul><li>U.S. Standard (2" x 3.5")</li><li>Neenah Cotton, Pearl White</li><li>Black ink</li><li>Hand printed on a 1945 Chandler &amp; Price</li></ul>',
    optionName: 'Quantity & Paper',
    variants: [
      { option: '50 cards / 110lb', price: '90.00', sku: 'EDITOR-50-STD' },
      { option: '100 cards / 110lb', price: '140.00', sku: 'EDITOR-100-STD' },
      { option: '250 cards / 110lb', price: '280.00', sku: 'EDITOR-250-STD' },
      { option: '500 cards / 110lb', price: '480.00', sku: 'EDITOR-500-STD' },
    ],
  },
  {
    title: '[LIVE] The Architect', productType: 'Business Card', tags: ['MODERN', 'CORPORATE', 'live-seed'],
    descriptionHtml: '<p>The Architect is set in precise Univers, with structured layouts inspired by architectural blueprints.</p><p>Precision and structure. Ideal for architecture firms and design studios.</p><h3>Specifications</h3><ul><li>U.S. Standard (2" x 3.5")</li><li>Neenah Cotton, Bright White</li><li>Grey ink</li><li>Hand printed on a 1962 Heidelberg Windmill</li></ul>',
    optionName: 'Quantity & Paper',
    variants: [
      { option: '50 cards / 110lb', price: '95.00', sku: 'ARCHITECT-50-STD' },
      { option: '100 cards / 110lb', price: '150.00', sku: 'ARCHITECT-100-STD' },
      { option: '250 cards / 110lb', price: '300.00', sku: 'ARCHITECT-250-STD' },
      { option: '500 cards / 110lb', price: '520.00', sku: 'ARCHITECT-500-STD' },
    ],
  },
  // Sample Packs
  {
    title: '[LIVE] Classic Sample Pack', productType: 'Sample Pack', tags: ['SAMPLES', 'live-seed'],
    descriptionHtml: '<p>A curated selection of our classic letterpress designs on premium cotton paper.</p><p>Includes six of our most popular classic designs printed on 110lb Neenah Cotton.</p>',
    optionName: 'Pack',
    variants: [{ option: '1 pack', price: '15.00', sku: 'SAMPLE-CLASSIC' }],
  },
  {
    title: '[LIVE] Modern Sample Pack', productType: 'Sample Pack', tags: ['SAMPLES', 'live-seed'],
    descriptionHtml: '<p>A curated selection of our modern and minimal letterpress designs.</p><p>Includes six contemporary designs featuring clean sans-serif typography.</p>',
    optionName: 'Pack',
    variants: [{ option: '1 pack', price: '15.00', sku: 'SAMPLE-MODERN' }],
  },
  {
    title: '[LIVE] Complete Sample Set', productType: 'Sample Pack', tags: ['SAMPLES', 'COMPLETE', 'live-seed'],
    descriptionHtml: '<p>Every design in our collection. The definitive way to choose your perfect card.</p><p>Includes all twelve letterpress business card designs. Sample cost credited towards your first order.</p>',
    optionName: 'Pack',
    variants: [{ option: '1 set', price: '25.00', sku: 'SAMPLE-COMPLETE' }],
  },
]

// ---- Create a product with variants ----
async function createProduct(token, product) {
  // Create product
  const data = await gql(token, `
    mutation productCreate($product: ProductCreateInput!) {
      productCreate(product: $product) {
        product {
          id title handle
          options { id name values }
          variants(first: 1) { edges { node { id title } } }
        }
        userErrors { field message }
      }
    }
  `, {
    product: {
      title: product.title,
      productType: product.productType,
      tags: product.tags,
      descriptionHtml: product.descriptionHtml,
    },
  })

  if (data.productCreate.userErrors.length > 0) {
    throw new Error(JSON.stringify(data.productCreate.userErrors))
  }

  const created = data.productCreate.product
  const productId = created.id
  const optionId = created.options[0]?.id
  const defaultVariantId = created.variants.edges[0]?.node?.id

  // Update default variant with correct price/sku/option
  if (defaultVariantId && optionId) {
    await gql(token, `
      mutation variantsBulkUpdate($productId: ID!, $variants: [ProductVariantsBulkInput!]!) {
        productVariantsBulkUpdate(productId: $productId, variants: $variants) {
          productVariants { id title sku price }
          userErrors { field message }
        }
      }
    `, {
      productId,
      variants: [{
        id: defaultVariantId,
        price: product.variants[0].price,
        inventoryItem: { sku: product.variants[0].sku },
        optionValues: [{ optionId, name: product.variants[0].option }],
      }],
    })
  }

  // Create additional variants
  if (product.variants.length > 1 && optionId) {
    const bulkVariants = product.variants.slice(1).map(v => ({
      price: v.price,
      inventoryItem: { sku: v.sku },
      optionValues: [{ optionId, name: v.option }],
    }))

    const result = await gql(token, `
      mutation variantsBulkCreate($productId: ID!, $variants: [ProductVariantsBulkInput!]!) {
        productVariantsBulkCreate(productId: $productId, variants: $variants) {
          productVariants { id title sku price }
          userErrors { field message }
        }
      }
    `, { productId, variants: bulkVariants })

    if (result.productVariantsBulkCreate.userErrors.length > 0) {
      console.error('  Variant errors:', result.productVariantsBulkCreate.userErrors)
    }
  }

  return created
}

// ---- Main ----
async function main() {
  console.log('Getting Admin API token...')
  const token = await getToken()
  console.log('Token acquired\n')

  console.log('--- Cleaning up existing live-seed products ---')
  await deleteExisting(token)

  console.log('--- Creating products ---')
  let created = 0, failed = 0

  for (const product of products) {
    try {
      process.stdout.write(`  ${product.title}...`)
      const result = await createProduct(token, product)
      console.log(` OK (${product.variants.length} variants)`)
      created++
      await sleep(500)
    } catch (err) {
      console.log(` FAILED: ${err.message}`)
      failed++
    }
  }

  console.log(`\nDone! Created: ${created}, Failed: ${failed}`)

  // Verify via Storefront API
  console.log('\n--- Verifying via Storefront API ---')
  const sfRes = await fetch(`https://${SHOP}/api/${API_VERSION}/graphql.json`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Shopify-Storefront-Private-Token': env.SHOPIFY_STOREFRONT_ACCESS_TOKEN },
    body: JSON.stringify({ query: '{ products(first: 20) { edges { node { title handle variants(first: 1) { edges { node { price { amount } } } } } } } }' }),
  })
  const sfData = await sfRes.json()
  for (const edge of sfData.data?.products?.edges || []) {
    const price = edge.node.variants.edges[0]?.node?.price?.amount || '?'
    console.log(`  ${edge.node.title} — $${price} (${edge.node.handle})`)
  }
}

main().catch(err => { console.error('Fatal:', err); process.exit(1) })
