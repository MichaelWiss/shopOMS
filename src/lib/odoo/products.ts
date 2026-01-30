import { searchRead, write } from './client'
import type { OdooProduct } from '@/types/odoo'

const MODEL = 'product.product'

/**
 * Find product by SKU
 */
export async function findProductBySku(sku: string): Promise<OdooProduct | null> {
  const products = await searchRead<OdooProduct>(
    MODEL,
    [['default_code', '=', sku]],
    {
      fields: ['id', 'name', 'default_code', 'list_price', 'qty_available'],
      limit: 1,
    }
  )
  return products[0] || null
}

/**
 * Find product by Shopify variant ID
 */
export async function findProductByShopifyVariantId(variantId: string): Promise<OdooProduct | null> {
  const products = await searchRead<OdooProduct>(
    MODEL,
    [['shopify_variant_id', '=', variantId]],
    {
      fields: ['id', 'name', 'default_code', 'list_price', 'qty_available'],
      limit: 1,
    }
  )
  return products[0] || null
}

/**
 * Get product by ID
 */
export async function getProduct(productId: number): Promise<OdooProduct | null> {
  const products = await searchRead<OdooProduct>(
    MODEL,
    [['id', '=', productId]],
    {
      fields: [
        'id', 'name', 'default_code', 'list_price', 'standard_price',
        'qty_available', 'virtual_available', 'type',
        'shopify_product_id', 'shopify_variant_id',
      ],
      limit: 1,
    }
  )
  return products[0] || null
}

/**
 * Update product inventory
 */
export async function updateProductInventory(
  productId: number,
  quantity: number
): Promise<boolean> {
  // Note: In a real implementation, you'd use stock.quant or stock.move
  // This is simplified for demonstration
  return write(MODEL, [productId], { qty_available: quantity })
}

/**
 * Get all products with Shopify mapping
 */
export async function getShopifyMappedProducts(): Promise<OdooProduct[]> {
  return searchRead<OdooProduct>(
    MODEL,
    [['shopify_variant_id', '!=', false]],
    {
      fields: [
        'id', 'name', 'default_code', 'list_price',
        'qty_available', 'shopify_product_id', 'shopify_variant_id',
      ],
    }
  )
}

/**
 * Link product to Shopify
 */
export async function linkProductToShopify(
  productId: number,
  shopifyProductId: string,
  shopifyVariantId: string
): Promise<boolean> {
  return write(MODEL, [productId], {
    shopify_product_id: shopifyProductId,
    shopify_variant_id: shopifyVariantId,
  })
}
