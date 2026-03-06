'use client'

import Link from 'next/link'
import Image from 'next/image'
import { playfair } from '@/lib/fonts'
import { useCart } from '@/components/CartProvider'
import { Loader2 } from 'lucide-react'

export function CartContent() {
  const { cart, isLoading, isPending, updateQuantity, removeFromCart } = useCart()

  if (isLoading) {
    return (
      <div className="py-20 flex justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-[#999]" />
      </div>
    )
  }

  const cartItems = cart?.lines.edges.map(e => e.node) ?? []
  const subtotal = parseFloat(cart?.cost.subtotalAmount.amount ?? '0')
  const total = parseFloat(cart?.cost.totalAmount.amount ?? '0')
  const checkoutUrl = cart?.checkoutUrl

  if (cartItems.length === 0) {
    return (
      <div className="py-20">
        <p className={`${playfair.className} text-[28px] md:text-[36px] leading-[1.3] mb-8`}>
          Your cart is empty
        </p>
        <Link 
          href="/cards" 
          className="inline-block px-6 py-3 bg-[#1a1a1a] text-white text-[11px] uppercase tracking-[0.06em]"
        >
          Browse Cards
        </Link>
      </div>
    )
  }

  return (
    <div className="grid lg:grid-cols-3 gap-12">
      {/* Cart Items */}
      <div className={`lg:col-span-2 ${isPending ? 'opacity-60 pointer-events-none' : ''}`}>
        {cartItems.map((item) => {
          const unitPrice = parseFloat(item.merchandise.price.amount)
          const totalPrice = unitPrice * item.quantity
          const imageUrl = item.merchandise.product.featuredImage?.url
          
          return (
            <div key={item.id} className="flex gap-6 border-b border-[#1a1a1a]/20 py-6">
              {imageUrl ? (
                <div className="w-24 h-32 relative overflow-hidden bg-[#E8E4DC]">
                  <Image
                    src={imageUrl}
                    alt={item.merchandise.product.title}
                    fill
                    className="object-cover"
                  />
                </div>
              ) : (
                <div className="w-24 h-32 bg-[#E8E4DC] flex items-center justify-center">
                  <span className="text-[10px] text-[#999]">Image</span>
                </div>
              )}
              <div className="flex-1">
                <h3 className="text-[15px]">{item.merchandise.product.title}</h3>
                <p className="text-[13px] text-[#1a1a1a]/60 mt-1">{item.merchandise.title}</p>
                <div className="flex items-center gap-4 mt-4">
                  <div className="flex items-center border border-[#1a1a1a]/30">
                    <button 
                      className="px-3 py-1 text-[14px] hover:bg-[#f5f5f0] transition-colors"
                      onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                      disabled={item.quantity <= 1}
                    >
                      −
                    </button>
                    <span className="px-3 py-1 text-[14px] border-x border-[#1a1a1a]/30 min-w-[40px] text-center">
                      {item.quantity}
                    </span>
                    <button 
                      className="px-3 py-1 text-[14px] hover:bg-[#f5f5f0] transition-colors"
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    >
                      +
                    </button>
                  </div>
                  <button 
                    className="text-[12px] text-[#1a1a1a]/60 underline hover:text-[#1a1a1a] transition-colors"
                    onClick={() => removeFromCart(item.id)}
                  >
                    Remove
                  </button>
                </div>
              </div>
              <div className="text-right">
                <p className="text-[15px]">A${totalPrice.toFixed(2)}</p>
              </div>
            </div>
          )
        })}
      </div>

      {/* Order Summary */}
      <div className="bg-[#F5F5F0] p-6 h-fit">
        <h2 className="text-[11px] uppercase tracking-[0.08em] text-[#1a1a1a]/60 mb-6">Order Summary</h2>
        
        <div className="space-y-3 text-[14px]">
          <div className="flex justify-between">
            <span className="text-[#1a1a1a]/60">Subtotal</span>
            <span>A${subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[#1a1a1a]/60">Shipping</span>
            <span className="text-[#1a1a1a]/60">Calculated at checkout</span>
          </div>
        </div>

        <div className="border-t border-[#1a1a1a]/20 mt-6 pt-6">
          <div className="flex justify-between text-[15px]">
            <span>Total</span>
            <span>A${total.toFixed(2)}</span>
          </div>
        </div>

        {checkoutUrl ? (
          <a 
            href={checkoutUrl}
            className="block w-full mt-6 px-6 py-3 bg-[#1a1a1a] text-white text-[11px] uppercase tracking-[0.06em] text-center hover:bg-[#333] transition-colors"
          >
            Proceed to Checkout
          </a>
        ) : (
          <button 
            className="w-full mt-6 px-6 py-3 bg-[#1a1a1a] text-white text-[11px] uppercase tracking-[0.06em] opacity-50 cursor-not-allowed"
            disabled
          >
            Proceed to Checkout
          </button>
        )}

        <p className="text-[11px] text-[#1a1a1a]/50 text-center mt-4">
          Secure checkout powered by Shopify
        </p>
      </div>
    </div>
  )
}
