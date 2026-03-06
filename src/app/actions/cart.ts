'use server'

import { cookies } from 'next/headers'
import { createCart, getCart, addToCart, updateCartLine, removeFromCart } from '@/lib/shopify/cart'
import type { ShopifyCart } from '@/types/shopify'

const CART_COOKIE = 'shopify_cart_id'

async function getCartId(): Promise<string | undefined> {
  const cookieStore = await cookies()
  return cookieStore.get(CART_COOKIE)?.value
}

async function setCartId(cartId: string): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.set(CART_COOKIE, cartId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: '/',
  })
}

export async function getOrCreateCart(): Promise<ShopifyCart | null> {
  const cartId = await getCartId()
  
  if (cartId) {
    const existingCart = await getCart(cartId)
    if (existingCart) {
      return existingCart
    }
  }
  
  // Create new cart
  const newCart = await createCart()
  if (newCart?.id) {
    await setCartId(newCart.id)
  }
  return newCart
}

export async function addItemToCart(variantId: string, quantity: number = 1): Promise<ShopifyCart | null> {
  let cartId = await getCartId()
  
  // Create cart if doesn't exist
  if (!cartId) {
    const newCart = await createCart()
    if (!newCart?.id) {
      return null
    }
    cartId = newCart.id
    await setCartId(cartId)
  }
  
  const updatedCart = await addToCart(cartId, variantId, quantity)
  return updatedCart
}

export async function updateItemQuantity(lineId: string, quantity: number): Promise<ShopifyCart | null> {
  const cartId = await getCartId()
  if (!cartId) return null
  
  const updatedCart = await updateCartLine(cartId, lineId, quantity)
  return updatedCart
}

export async function removeItem(lineId: string): Promise<ShopifyCart | null> {
  const cartId = await getCartId()
  if (!cartId) return null
  
  const updatedCart = await removeFromCart(cartId, [lineId])
  return updatedCart
}

export async function getCurrentCart(): Promise<ShopifyCart | null> {
  const cartId = await getCartId()
  if (!cartId) return null
  
  return getCart(cartId)
}
