'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ChevronLeft, Minus, Plus, X } from 'lucide-react'

// Demo cart items
const initialCartItems = [
  { id: 1, title: 'REAL LOVE BABY', price: 8, quantity: 2, color: 'bg-[#F5E6E0]', textStyle: 'italic text-[#8B4B5C]' },
  { id: 6, title: 'SOULMATES', price: 8, quantity: 1, color: 'bg-[#E8F0E8]', textStyle: 'italic text-[#4A6A4A]' },
  { id: 9, title: 'THANKFUL', price: 8, quantity: 3, color: 'bg-[#C8C0B8]', textStyle: 'italic text-[#5A4A3A]' },
]

export default function CartPage() {
  const [cartItems, setCartItems] = useState(initialCartItems)

  const updateQuantity = (id: number, delta: number) => {
    setCartItems(items => 
      items.map(item => 
        item.id === id 
          ? { ...item, quantity: Math.max(1, item.quantity + delta) }
          : item
      )
    )
  }

  const removeItem = (id: number) => {
    setCartItems(items => items.filter(item => item.id !== id))
  }

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const shipping = subtotal >= 50 ? 0 : 8
  const total = subtotal + shipping

  return (
    <div className="max-w-[680px] mx-auto px-6 py-8">
      {/* Back Link */}
      <Link href="/demo" className="inline-flex items-center gap-1 text-[12px] text-[#999] hover:text-black transition-colors mb-10">
        <ChevronLeft className="h-3 w-3" />
        Continue shopping
      </Link>

      <h1 className="text-[15px] font-medium tracking-[0.02em] mb-10">Your Cart</h1>

      {cartItems.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-[13px] text-[#999] mb-6">Your cart is empty</p>
          <Link href="/demo" className="inline-block bg-black text-white py-3.5 px-8 text-[11px] font-medium tracking-[0.1em] uppercase rounded-[2px] hover:bg-[#333] transition-colors">
            Browse Products
          </Link>
        </div>
      ) : (
        <>
          {/* Cart Items */}
          <div className="divide-y divide-[#E5E5E5]">
            {cartItems.map(item => (
              <div key={item.id} className="py-6 flex gap-5">
                {/* Product Image */}
                <div className={`${item.color} w-20 h-28 rounded-[2px] flex-shrink-0 flex items-center justify-center`}>
                  <span className={`text-[10px] font-serif ${item.textStyle} opacity-60`}>
                    {item.title.split(' ')[0]}
                  </span>
                </div>

                {/* Product Info */}
                <div className="flex-1 pt-1">
                  <div className="flex justify-between items-start">
                    <Link href={`/demo/product/${item.id}`} className="text-[12px] font-medium tracking-[0.02em] hover:underline underline-offset-2">
                      {item.title}
                    </Link>
                    <button 
                      onClick={() => removeItem(item.id)}
                      className="text-[#999] hover:text-black transition-colors p-1 -m-1"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <p className="text-[12px] text-[#999] mt-1">A${item.price}.00</p>

                  {/* Quantity */}
                  <div className="flex items-center gap-3 mt-4">
                    <button 
                      onClick={() => updateQuantity(item.id, -1)}
                      className="p-1.5 border border-[#E5E5E5] rounded-[2px] hover:bg-[#F5F5F3] transition-colors"
                    >
                      <Minus className="h-2.5 w-2.5 text-[#666]" />
                    </button>
                    <span className="text-[12px] font-medium w-6 text-center">{item.quantity}</span>
                    <button 
                      onClick={() => updateQuantity(item.id, 1)}
                      className="p-1.5 border border-[#E5E5E5] rounded-[2px] hover:bg-[#F5F5F3] transition-colors"
                    >
                      <Plus className="h-2.5 w-2.5 text-[#666]" />
                    </button>
                    <span className="text-[12px] text-[#666] ml-3">
                      A${item.price * item.quantity}.00
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary */}
          <div className="border-t border-[#E5E5E5] pt-8 mt-2">
            <div className="space-y-3 text-[12px]">
              <div className="flex justify-between">
                <span className="text-[#666]">Subtotal</span>
                <span>A${subtotal}.00</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#666]">Shipping</span>
                <span>{shipping === 0 ? 'FREE' : `A$${shipping}.00`}</span>
              </div>
              {shipping > 0 && (
                <p className="text-[10px] text-[#999] tracking-[0.02em]">
                  Add A${50 - subtotal}.00 more for free shipping
                </p>
              )}
              <div className="flex justify-between font-medium text-[13px] pt-5 border-t border-[#E5E5E5]">
                <span>Total</span>
                <span>A${total}.00</span>
              </div>
            </div>

            {/* Checkout Button */}
            <button className="w-full bg-black text-white py-3.5 text-[11px] font-medium tracking-[0.1em] uppercase mt-8 hover:bg-[#333] transition-colors rounded-[2px]">
              Proceed to Checkout
            </button>
            <p className="text-[10px] text-[#999] text-center mt-4 tracking-[0.02em]">
              You'll be redirected to Shopify's secure checkout
            </p>
          </div>

          {/* Gift Note */}
          <div className="mt-10 p-5 bg-[#F5F5F3] rounded-[2px]">
            <h3 className="text-[11px] font-medium tracking-[0.02em] mb-3 uppercase text-[#999]">Add a gift note</h3>
            <textarea 
              className="w-full p-3.5 text-[12px] border border-[#E5E5E5] rounded-[2px] resize-none bg-white placeholder:text-[#BBB] focus:outline-none focus:border-[#999]"
              rows={3}
              placeholder="Write a personal message..."
            />
          </div>
        </>
      )}
    </div>
  )
}
