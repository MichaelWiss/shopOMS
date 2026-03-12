'use server'

import { cookies } from 'next/headers'
import { z } from 'zod'
import { createCart, getCart, addToCart, updateCartLine, removeFromCart } from '@/lib/shopify/cart'
import type { ShopifyCart } from '@/types/shopify'

const AddToCartSchema = z.object({
  variantId: z.string().min(1).startsWith('gid://shopify/'),
  quantity: z.number().int().min(1).max(100),
})

const UpdateQuantitySchema = z.object({
  lineId: z.string().min(1).startsWith('gid://shopify/'),
  quantity: z.number().int().min(0).max(100),
})

const RemoveItemSchema = z.object({
  lineId: z.string().min(1).startsWith('gid://shopify/'),
})

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
  try {
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
  } catch (error) {
    console.error('[Cart] Failed to get or create cart:', error)
    return null
  }
}

export async function addItemToCart(variantId: string, quantity: number = 1): Promise<ShopifyCart | null> {
  const parsed = AddToCartSchema.safeParse({ variantId, quantity })
  if (!parsed.success) return null

  try {
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
    
    const updatedCart = await addToCart(cartId, parsed.data.variantId, parsed.data.quantity)
    return updatedCart
  } catch (error) {
    console.error('[Cart] Failed to add item:', error)
    return null
  }
}

export async function updateItemQuantity(lineId: string, quantity: number): Promise<ShopifyCart | null> {
  const parsed = UpdateQuantitySchema.safeParse({ lineId, quantity })
  if (!parsed.success) return null

  try {
    const cartId = await getCartId()
    if (!cartId) return null
    
    const updatedCart = await updateCartLine(cartId, parsed.data.lineId, parsed.data.quantity)
    return updatedCart
  } catch (error) {
    console.error('[Cart] Failed to update quantity:', error)
    return null
  }
}

export async function removeItem(lineId: string): Promise<ShopifyCart | null> {
  const parsed = RemoveItemSchema.safeParse({ lineId })
  if (!parsed.success) return null

  try {
    const cartId = await getCartId()
    if (!cartId) return null
    
    const updatedCart = await removeFromCart(cartId, [parsed.data.lineId])
    return updatedCart
  } catch (error) {
    console.error('[Cart] Failed to remove item:', error)
    return null
  }
}

export async function getCurrentCart(): Promise<ShopifyCart | null> {
  try {
    const cartId = await getCartId()
    if (!cartId) return null
    
    return getCart(cartId)
  } catch (error) {
    console.error('[Cart] Failed to get cart:', error)
    return null
  }
}
