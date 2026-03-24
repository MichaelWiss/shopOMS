'use client'

import { createContext, useContext, useState, useCallback, useTransition, useEffect, type ReactNode } from 'react'
import type { ShopifyCart } from '@/types/shopify'

interface CartApiResponse {
  cart: ShopifyCart | null
}

async function apiFetchCart(): Promise<ShopifyCart | null> {
  try {
    const res = await fetch('/api/cart')
    if (!res.ok) return null
    const data: CartApiResponse = await res.json()
    return data.cart
  } catch {
    return null
  }
}

async function apiAddItem(variantId: string, quantity: number): Promise<ShopifyCart | null> {
  try {
    const res = await fetch('/api/cart', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ variantId, quantity }),
    })
    if (!res.ok) return null
    const data: CartApiResponse = await res.json()
    return data.cart
  } catch {
    return null
  }
}

async function apiUpdateQuantity(lineId: string, quantity: number): Promise<ShopifyCart | null> {
  try {
    const res = await fetch('/api/cart', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ lineId, quantity }),
    })
    if (!res.ok) return null
    const data: CartApiResponse = await res.json()
    return data.cart
  } catch {
    return null
  }
}

async function apiRemoveItem(lineId: string): Promise<ShopifyCart | null> {
  try {
    const res = await fetch('/api/cart', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ lineId }),
    })
    if (!res.ok) return null
    const data: CartApiResponse = await res.json()
    return data.cart
  } catch {
    return null
  }
}

interface CartContextValue {
  cart: ShopifyCart | null
  isLoading: boolean
  isPending: boolean
  cartError: string | null
  addItem: (variantId: string, quantity?: number) => Promise<ShopifyCart | null>
  updateQuantity: (lineId: string, quantity: number) => Promise<void>
  removeFromCart: (lineId: string) => Promise<void>
  refreshCart: () => Promise<void>
}

const CartContext = createContext<CartContextValue | undefined>(undefined)

export function CartProvider({ children, initialCart }: { children: ReactNode; initialCart?: ShopifyCart | null }) {
  const [cart, setCart] = useState<ShopifyCart | null>(initialCart ?? null)
  const [isLoading, setIsLoading] = useState(!initialCart)
  const [cartError, setCartError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  // Load cart on mount if not provided
  useEffect(() => {
    if (!initialCart) {
      apiFetchCart()
        .then(c => {
          setCart(c)
          setIsLoading(false)
        })
        .catch(() => setIsLoading(false))
    }
  }, [initialCart])

  const addItem = useCallback(async (variantId: string, quantity: number = 1): Promise<ShopifyCart | null> => {
    setCartError(null)
    return new Promise((resolve) => {
      startTransition(async () => {
        try {
          const updatedCart = await apiAddItem(variantId, quantity)
          if (updatedCart) {
            setCart(updatedCart)
          } else {
            setCartError('Failed to add item to cart. Please try again.')
          }
          resolve(updatedCart ?? null)
        } catch {
          setCartError('Failed to add item to cart. Please try again.')
          resolve(null)
        }
      })
    })
  }, [])

  const updateQuantity = useCallback(async (lineId: string, quantity: number) => {
    startTransition(async () => {
      const updatedCart = await apiUpdateQuantity(lineId, quantity)
      if (updatedCart) {
        setCart(updatedCart)
      }
    })
  }, [])

  const removeFromCart = useCallback(async (lineId: string) => {
    startTransition(async () => {
      const updatedCart = await apiRemoveItem(lineId)
      if (updatedCart) {
        setCart(updatedCart)
      }
    })
  }, [])

  const refreshCart = useCallback(async () => {
    setIsLoading(true)
    const freshCart = await apiFetchCart()
    setCart(freshCart)
    setIsLoading(false)
  }, [])

  return (
    <CartContext.Provider value={{ 
      cart, 
      isLoading, 
      isPending,
      cartError,
      addItem, 
      updateQuantity, 
      removeFromCart, 
      refreshCart 
    }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
}

// Helper to get cart line count
export function useCartCount() {
  const { cart } = useCart()
  return cart?.totalQuantity ?? 0
}
