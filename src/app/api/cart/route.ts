import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { z } from 'zod'
import { createCart, getCart, addToCart, updateCartLine, removeFromCart } from '@/lib/shopify/cart'

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
    maxAge: 60 * 60 * 24 * 7,
    path: '/',
  })
}

const AddToCartSchema = z.object({
  variantId: z.string().min(1).startsWith('gid://shopify/'),
  quantity: z.number().int().min(1).max(100),
})

const UpdateSchema = z.object({
  lineId: z.string().min(1).startsWith('gid://shopify/'),
  quantity: z.number().int().min(0).max(100),
})

const RemoveSchema = z.object({
  lineId: z.string().min(1).startsWith('gid://shopify/'),
})

export async function GET(): Promise<NextResponse> {
  try {
    const cartId = await getCartId()
    if (!cartId) {
      return NextResponse.json({ cart: null })
    }
    const cart = await getCart(cartId)
    return NextResponse.json({ cart })
  } catch (error) {
    console.error('[Cart API] Failed to get cart:', error)
    return NextResponse.json({ cart: null }, { status: 500 })
  }
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json()
    const parsed = AddToCartSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ cart: null, error: 'Invalid input' }, { status: 400 })
    }

    let cartId = await getCartId()
    if (!cartId) {
      const newCart = await createCart()
      if (!newCart?.id) {
        return NextResponse.json({ cart: null, error: 'Failed to create cart' }, { status: 500 })
      }
      cartId = newCart.id
      await setCartId(cartId)
    }

    const updatedCart = await addToCart(cartId, parsed.data.variantId, parsed.data.quantity)
    return NextResponse.json({ cart: updatedCart })
  } catch (error) {
    console.error('[Cart API] Failed to add item:', error)
    return NextResponse.json({ cart: null, error: 'Failed to add item' }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json()
    const parsed = UpdateSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ cart: null, error: 'Invalid input' }, { status: 400 })
    }

    const cartId = await getCartId()
    if (!cartId) {
      return NextResponse.json({ cart: null, error: 'No cart found' }, { status: 404 })
    }

    const updatedCart = await updateCartLine(cartId, parsed.data.lineId, parsed.data.quantity)
    return NextResponse.json({ cart: updatedCart })
  } catch (error) {
    console.error('[Cart API] Failed to update item:', error)
    return NextResponse.json({ cart: null, error: 'Failed to update item' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json()
    const parsed = RemoveSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ cart: null, error: 'Invalid input' }, { status: 400 })
    }

    const cartId = await getCartId()
    if (!cartId) {
      return NextResponse.json({ cart: null, error: 'No cart found' }, { status: 404 })
    }

    const updatedCart = await removeFromCart(cartId, [parsed.data.lineId])
    return NextResponse.json({ cart: updatedCart })
  } catch (error) {
    console.error('[Cart API] Failed to remove item:', error)
    return NextResponse.json({ cart: null, error: 'Failed to remove item' }, { status: 500 })
  }
}
