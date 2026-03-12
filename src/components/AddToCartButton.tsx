'use client'

import { useState } from 'react'
import { useCart } from '@/components/CartProvider'
import { Loader2, Check } from 'lucide-react'

interface AddToCartButtonProps {
  variantId: string
  variants?: Array<{
    id: string
    title: string
    price: string
  }>
  className?: string
}

export function AddToCartButton({ variantId, variants, className }: AddToCartButtonProps) {
  const { addItem, isPending } = useCart()
  const [selectedVariant, setSelectedVariant] = useState(variantId)
  const [justAdded, setJustAdded] = useState(false)

  const handleAddToCart = async () => {
    await addItem(selectedVariant, 1)
    setJustAdded(true)
    setTimeout(() => setJustAdded(false), 2000)
  }

  return (
    <div className={className}>
      {variants && variants.length > 1 && (
        <div className="mb-6">
          <label htmlFor="variant-select" className="text-[11px] uppercase tracking-[0.1em] text-[#666] block mb-2">
            Select Option
          </label>
          <select 
            id="variant-select"
            className="w-full border border-[#E5E5E5] px-4 py-3 text-[14px] bg-white appearance-none cursor-pointer"
            value={selectedVariant}
            onChange={(e) => setSelectedVariant(e.target.value)}
          >
            {variants.map((v) => (
              <option key={v.id} value={v.id}>
                {v.title} — ${parseFloat(v.price).toFixed(0)}
              </option>
            ))}
          </select>
        </div>
      )}
      
      <button 
        className="w-full bg-[#1a1a1a] text-white py-4 text-[13px] uppercase tracking-[0.1em] hover:bg-[#333] transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        onClick={handleAddToCart}
        disabled={isPending}
      >
        {isPending ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Adding...
          </>
        ) : justAdded ? (
          <>
            <Check className="h-4 w-4" />
            Added to Cart!
          </>
        ) : (
          'Add to Cart'
        )}
      </button>
    </div>
  )
}
