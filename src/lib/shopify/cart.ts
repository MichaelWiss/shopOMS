import { shopifyStorefrontFetch } from './client'
import type { ShopifyCart } from '@/types/shopify'

interface CartResponse {
  cart: ShopifyCart | null
}

interface CartCreateResponse {
  cartCreate: {
    cart: ShopifyCart | null
    userErrors: Array<{ field: string[]; message: string }>
  }
}

interface CartLinesAddResponse {
  cartLinesAdd: {
    cart: ShopifyCart | null
    userErrors: Array<{ field: string[]; message: string }>
  }
}

interface CartLinesUpdateResponse {
  cartLinesUpdate: {
    cart: ShopifyCart | null
    userErrors: Array<{ field: string[]; message: string }>
  }
}

interface CartLinesRemoveResponse {
  cartLinesRemove: {
    cart: ShopifyCart | null
    userErrors: Array<{ field: string[]; message: string }>
  }
}

const CART_FRAGMENT = `
  fragment CartFields on Cart {
    id
    checkoutUrl
    totalQuantity
    cost {
      subtotalAmount {
        amount
        currencyCode
      }
      totalAmount {
        amount
        currencyCode
      }
      totalTaxAmount {
        amount
        currencyCode
      }
    }
    lines(first: 100) {
      edges {
        node {
          id
          quantity
          merchandise {
            ... on ProductVariant {
              id
              title
              price {
                amount
                currencyCode
              }
              product {
                title
                handle
                featuredImage {
                  url
                  altText
                  width
                  height
                }
              }
            }
          }
        }
      }
    }
  }
`

export async function createCart(): Promise<ShopifyCart | null> {
  const mutation = `
    ${CART_FRAGMENT}
    mutation CreateCart {
      cartCreate {
        cart {
          ...CartFields
        }
        userErrors {
          field
          message
        }
      }
    }
  `

  const data = await shopifyStorefrontFetch<CartCreateResponse>(mutation)
  
  if (data.cartCreate.userErrors.length > 0) {
    console.error('Cart creation errors:', data.cartCreate.userErrors)
    return null
  }

  return data.cartCreate.cart
}

export async function getCart(cartId: string): Promise<ShopifyCart | null> {
  const query = `
    ${CART_FRAGMENT}
    query GetCart($cartId: ID!) {
      cart(id: $cartId) {
        ...CartFields
      }
    }
  `

  const data = await shopifyStorefrontFetch<CartResponse>(query, { cartId })
  return data.cart
}

export async function addToCart(
  cartId: string,
  variantId: string,
  quantity: number = 1
): Promise<ShopifyCart | null> {
  const mutation = `
    ${CART_FRAGMENT}
    mutation AddToCart($cartId: ID!, $lines: [CartLineInput!]!) {
      cartLinesAdd(cartId: $cartId, lines: $lines) {
        cart {
          ...CartFields
        }
        userErrors {
          field
          message
        }
      }
    }
  `

  const data = await shopifyStorefrontFetch<CartLinesAddResponse>(mutation, {
    cartId,
    lines: [{ merchandiseId: variantId, quantity }],
  })

  if (data.cartLinesAdd.userErrors.length > 0) {
    console.error('Add to cart errors:', data.cartLinesAdd.userErrors)
    return null
  }

  return data.cartLinesAdd.cart
}

export async function updateCartLine(
  cartId: string,
  lineId: string,
  quantity: number
): Promise<ShopifyCart | null> {
  const mutation = `
    ${CART_FRAGMENT}
    mutation UpdateCartLine($cartId: ID!, $lines: [CartLineUpdateInput!]!) {
      cartLinesUpdate(cartId: $cartId, lines: $lines) {
        cart {
          ...CartFields
        }
        userErrors {
          field
          message
        }
      }
    }
  `

  const data = await shopifyStorefrontFetch<CartLinesUpdateResponse>(mutation, {
    cartId,
    lines: [{ id: lineId, quantity }],
  })

  if (data.cartLinesUpdate.userErrors.length > 0) {
    console.error('Update cart line errors:', data.cartLinesUpdate.userErrors)
    return null
  }

  return data.cartLinesUpdate.cart
}

export async function removeFromCart(
  cartId: string,
  lineIds: string[]
): Promise<ShopifyCart | null> {
  const mutation = `
    ${CART_FRAGMENT}
    mutation RemoveFromCart($cartId: ID!, $lineIds: [ID!]!) {
      cartLinesRemove(cartId: $cartId, lineIds: $lineIds) {
        cart {
          ...CartFields
        }
        userErrors {
          field
          message
        }
      }
    }
  `

  const data = await shopifyStorefrontFetch<CartLinesRemoveResponse>(mutation, {
    cartId,
    lineIds,
  })

  if (data.cartLinesRemove.userErrors.length > 0) {
    console.error('Remove from cart errors:', data.cartLinesRemove.userErrors)
    return null
  }

  return data.cartLinesRemove.cart
}
