import { shopifyStorefrontFetch } from './client'
import type { ShopifyProduct } from '@/types/shopify'

interface ProductsResponse {
  products: {
    edges: Array<{
      node: ShopifyProduct
      cursor: string
    }>
    pageInfo: {
      hasNextPage: boolean
      hasPreviousPage: boolean
    }
  }
}

interface ProductResponse {
  product: ShopifyProduct | null
}

const PRODUCT_FRAGMENT = `
  fragment ProductFields on Product {
    id
    title
    handle
    description
    descriptionHtml
    vendor
    productType
    tags
    priceRange {
      minVariantPrice {
        amount
        currencyCode
      }
      maxVariantPrice {
        amount
        currencyCode
      }
    }
    featuredImage {
      url
      altText
      width
      height
    }
    images(first: 10) {
      edges {
        node {
          url
          altText
          width
          height
        }
      }
    }
    variants(first: 100) {
      edges {
        node {
          id
          title
          sku
          availableForSale
          price {
            amount
            currencyCode
          }
          compareAtPrice {
            amount
            currencyCode
          }
          selectedOptions {
            name
            value
          }
          image {
            url
            altText
            width
            height
          }
        }
      }
    }
  }
`

export async function getProducts(first: number = 20, cursor?: string): Promise<{
  products: ShopifyProduct[]
  pageInfo: { hasNextPage: boolean; hasPreviousPage: boolean }
  cursor?: string
}> {
  const query = `
    ${PRODUCT_FRAGMENT}
    query GetProducts($first: Int!, $after: String) {
      products(first: $first, after: $after) {
        edges {
          node {
            ...ProductFields
          }
          cursor
        }
        pageInfo {
          hasNextPage
          hasPreviousPage
        }
      }
    }
  `

  const data = await shopifyStorefrontFetch<ProductsResponse>(query, {
    first,
    after: cursor,
  })

  const edges = data.products.edges
  const lastCursor = edges.length > 0 ? edges[edges.length - 1].cursor : undefined

  return {
    products: edges.map(edge => edge.node),
    pageInfo: data.products.pageInfo,
    cursor: lastCursor,
  }
}

export async function getProductByHandle(handle: string): Promise<ShopifyProduct | null> {
  const query = `
    ${PRODUCT_FRAGMENT}
    query GetProduct($handle: String!) {
      product(handle: $handle) {
        ...ProductFields
      }
    }
  `

  const data = await shopifyStorefrontFetch<ProductResponse>(query, { handle })
  return data.product
}

export async function getProductById(id: string): Promise<ShopifyProduct | null> {
  const query = `
    ${PRODUCT_FRAGMENT}
    query GetProductById($id: ID!) {
      product(id: $id) {
        ...ProductFields
      }
    }
  `

  const data = await shopifyStorefrontFetch<ProductResponse>(query, { id })
  return data.product
}

export async function searchProducts(searchQuery: string, first: number = 20): Promise<ShopifyProduct[]> {
  const query = `
    ${PRODUCT_FRAGMENT}
    query SearchProducts($query: String!, $first: Int!) {
      products(first: $first, query: $query) {
        edges {
          node {
            ...ProductFields
          }
        }
      }
    }
  `

  const data = await shopifyStorefrontFetch<ProductsResponse>(query, {
    query: searchQuery,
    first,
  })

  return data.products.edges.map(edge => edge.node)
}
