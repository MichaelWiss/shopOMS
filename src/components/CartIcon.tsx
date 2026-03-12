'use client'

import Link from 'next/link'
import { ShoppingBag } from 'lucide-react'
import { useCartCount } from './CartProvider'

export function CartIcon() {
  const count = useCartCount()

  return (
    <Link href="/cart" className="flex items-center gap-1.5 text-[13px] relative" aria-label={count > 0 ? `Cart, ${count} ${count === 1 ? 'item' : 'items'}` : 'Cart, empty'}>
      <span aria-hidden="true">Cart</span>
      <ShoppingBag className="h-[14px] w-[14px]" strokeWidth={1.5} aria-hidden="true" />
      {count > 0 && (
        <span className="absolute -top-1.5 -right-2.5 bg-[#1a1a1a] text-white text-[9px] min-w-[16px] h-[16px] rounded-full flex items-center justify-center" aria-hidden="true">
          {count > 99 ? '99+' : count}
        </span>
      )}
    </Link>
  )
}
