import Link from 'next/link'
import { playfair } from '@/lib/fonts'

export default function CartPage() {
  // TODO: Replace with actual cart state from Shopify
  const cartItems: Array<{
    id: string
    title: string
    variant: string
    quantity: number
    price: number
  }> = []

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0)

  return (
    <div className="px-6 py-10 min-h-[60vh] bg-white">
      <h1 className="text-[11px] uppercase tracking-[0.08em] text-[#1a1a1a]/60 mb-8">Your Cart</h1>

      {cartItems.length === 0 ? (
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
      ) : (
        <div className="grid lg:grid-cols-3 gap-12">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            {cartItems.map((item) => (
              <div key={item.id} className="flex gap-6 border-b border-[#1a1a1a]/20 py-6">
                <div className="w-24 h-32 bg-[#E8E4DC] flex items-center justify-center">
                  <span className="text-[10px] text-[#999]">Image</span>
                </div>
                <div className="flex-1">
                  <h3 className="text-[15px]">{item.title}</h3>
                  <p className="text-[13px] text-[#1a1a1a]/60 mt-1">{item.variant}</p>
                  <div className="flex items-center gap-4 mt-4">
                    <div className="flex items-center border border-[#1a1a1a]/30">
                      <button className="px-3 py-1 text-[14px]">−</button>
                      <span className="px-3 py-1 text-[14px] border-x border-[#1a1a1a]/30">
                        {item.quantity}
                      </span>
                      <button className="px-3 py-1 text-[14px]">+</button>
                    </div>
                    <button className="text-[12px] text-[#1a1a1a]/60 underline">Remove</button>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-[15px]">A${(item.price * item.quantity).toFixed(2)}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary */}
          <div className="bg-[#F5F5F0] p-6">
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
                <span>A${subtotal.toFixed(2)}</span>
              </div>
            </div>

            <button className="w-full mt-6 px-6 py-3 bg-[#1a1a1a] text-white text-[11px] uppercase tracking-[0.06em]">
              Proceed to Checkout
            </button>

            <p className="text-[11px] text-[#1a1a1a]/50 text-center mt-4">
              Secure checkout powered by Shopify
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
