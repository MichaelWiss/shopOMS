import { CartContent } from '@/components/CartContent'

export default function CartPage() {
  return (
    <div className="px-6 py-10 min-h-[60vh] bg-white">
      <h1 className="text-[11px] uppercase tracking-[0.08em] text-[#1a1a1a]/60 mb-8">Your Cart</h1>
      <CartContent />
    </div>
  )
}
