'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ChevronLeft, Minus, Plus } from 'lucide-react'

// Demo product data
const products: Record<string, {
  id: number
  title: string
  price: number
  description: string
  details: string[]
  tags: string[]
  color: string
  textStyle: string
}> = {
  '1': { id: 1, title: 'REAL LOVE BABY', price: 8, description: 'A letterpress printed card for your real love, baby.', details: ['A6 size (105 x 148mm)', 'Letterpress printed', 'Blank inside', 'Comes with kraft envelope'], tags: ['LOVE', 'LETTERPRESS', 'FRIENDSHIP'], color: 'bg-[#F5E6E0]', textStyle: 'italic text-[#8B4B5C]' },
  '2': { id: 2, title: 'AND THEN, I MET YOU', price: 8, description: 'For that special someone who changed everything.', details: ['A6 size (105 x 148mm)', 'Digital print on cotton stock', 'Blank inside', 'Comes with white envelope'], tags: ['LOVE', 'FRIENDSHIP', "VALENTINE'S DAY"], color: 'bg-[#C8E0C8]', textStyle: 'italic text-[#5A7A5A]' },
  '3': { id: 3, title: 'YOU AND ME', price: 8, description: 'Simple and sweet, just like your love.', details: ['A6 size (105 x 148mm)', 'Risograph printed', 'Blank inside', 'Comes with kraft envelope'], tags: ['LOVE', 'FRIENDSHIP', "VALENTINE'S DAY"], color: 'bg-[#F5D5C8]', textStyle: 'text-[#CC6B4A]' },
  '4': { id: 4, title: 'SMITTEN', price: 8, description: "When you're completely and utterly smitten.", details: ['A6 size (105 x 148mm)', 'Digital print', 'Blank inside', 'Comes with blush envelope'], tags: ['LOVE', 'FRIENDSHIP', "VALENTINE'S DAY"], color: 'bg-[#F0C8A8]', textStyle: 'italic text-[#996B4A]' },
  '5': { id: 5, title: 'TRULY MADLY DEEPLY', price: 8, description: "For a love that's truly, madly, deeply.", details: ['A6 size (105 x 148mm)', 'Letterpress printed', 'Blank inside', 'Comes with kraft envelope'], tags: ['LOVE', 'LETTERPRESS', 'WEDDING'], color: 'bg-[#F5F0E6]', textStyle: 'text-[#888]' },
  '6': { id: 6, title: 'SOULMATES', price: 8, description: 'For your person, your soulmate.', details: ['A6 size (105 x 148mm)', 'Letterpress printed', 'Blank inside', 'Comes with sage envelope'], tags: ['LOVE', 'FRIENDSHIP', 'LETTERPRESS'], color: 'bg-[#E8F0E8]', textStyle: 'italic text-[#4A6A4A]' },
  '7': { id: 7, title: 'I CHOOSE YOU', price: 8, description: 'Today, tomorrow, and every day after.', details: ['A6 size (105 x 148mm)', 'Screen printed', 'Blank inside', 'Comes with white envelope'], tags: ['LOVE', 'WEDDING'], color: 'bg-[#C83C3C]', textStyle: 'text-white' },
  '8': { id: 8, title: 'SWOON', price: 8, description: 'Make them swoon.', details: ['A6 size (105 x 148mm)', 'Digital print on cotton stock', 'Blank inside', 'Comes with blush envelope'], tags: ['LOVE', "VALENTINE'S DAY", 'ENGAGEMENT'], color: 'bg-[#F8E8E8]', textStyle: 'italic text-[#CC6B8A]' },
  '9': { id: 9, title: 'THANKFUL', price: 8, description: 'Express your gratitude beautifully.', details: ['A6 size (105 x 148mm)', 'Letterpress printed', 'Blank inside', 'Comes with kraft envelope'], tags: ['FRIENDSHIP', 'THANKS'], color: 'bg-[#C8C0B8]', textStyle: 'italic text-[#5A4A3A]' },
  '10': { id: 10, title: 'YAY', price: 8, description: 'Celebrate the wins, big and small.', details: ['A6 size (105 x 148mm)', 'Screen printed', 'Blank inside', 'Comes with yellow envelope'], tags: ['HAPPY', 'CONGRATULATIONS', 'NEW BEGINNINGS'], color: 'bg-[#F5E8C8]', textStyle: 'font-bold text-[#8B7A4A]' },
  '11': { id: 11, title: "YOU'RE A GEM", price: 8, description: 'For someone who truly shines.', details: ['A6 size (105 x 148mm)', 'Digital print', 'Blank inside', 'Comes with white envelope'], tags: ['LOVE', 'FRIENDSHIP', 'BRIGHT'], color: 'bg-[#F8E0E0]', textStyle: 'text-[#CC4A4A]' },
  '12': { id: 12, title: 'MY PERSON', price: 8, description: 'For your person, whoever that may be.', details: ['A6 size (105 x 148mm)', 'Letterpress printed', 'Blank inside', 'Comes with kraft envelope'], tags: ['LETTERPRESS', 'LOVE', 'BRIGHT'], color: 'bg-[#F5E5A0]', textStyle: 'italic text-[#6B5A2A]' },
}

export default function ProductPage({ params }: { params: { id: string } }) {
  const [quantity, setQuantity] = useState(1)
  const product = products[params.id] || products['1']

  return (
    <div className="max-w-[1400px] mx-auto px-6 py-8">
      {/* Back Link */}
      <Link href="/demo" className="inline-flex items-center gap-1 text-[12px] text-[#999] hover:text-black transition-colors mb-10">
        <ChevronLeft className="h-3 w-3" />
        Back to store
      </Link>

      <div className="grid md:grid-cols-2 gap-10 md:gap-20">
        {/* Product Image */}
        <div className={`${product.color} aspect-[3/4] rounded-[2px] flex items-center justify-center`}>
          <span className={`text-[32px] md:text-[42px] font-serif ${product.textStyle} opacity-80`}>
            {product.title}
          </span>
        </div>

        {/* Product Info */}
        <div className="py-2">
          <h1 className="text-[13px] font-medium tracking-[0.02em] mb-2">{product.title}</h1>
          <p className="text-[13px] text-[#666] mb-8">A${product.price}.00</p>

          <p className="text-[13px] text-[#666] leading-[1.7] mb-8">{product.description}</p>

          {/* Details */}
          <div className="mb-8">
            <h3 className="text-[11px] font-medium tracking-[0.02em] mb-3 text-[#999] uppercase">Details</h3>
            <ul className="text-[12px] text-[#666] space-y-1.5 leading-[1.6]">
              {product.details.map((detail, i) => (
                <li key={i}>• {detail}</li>
              ))}
            </ul>
          </div>

          {/* Tags */}
          <div className="mb-10">
            <h3 className="text-[11px] font-medium tracking-[0.02em] mb-3 text-[#999] uppercase">Tags</h3>
            <div className="flex flex-wrap gap-2">
              {product.tags.map(tag => (
                <span key={tag} className="text-[10px] bg-[#F5F5F3] text-[#666] px-2.5 py-1.5 rounded-[2px] uppercase tracking-[0.03em]">
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* Quantity */}
          <div className="mb-8">
            <h3 className="text-[11px] font-medium tracking-[0.02em] mb-3 text-[#999] uppercase">Quantity</h3>
            <div className="flex items-center gap-5">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="p-2 border border-[#E5E5E5] rounded-[2px] hover:bg-[#F5F5F3] transition-colors"
              >
                <Minus className="h-3.5 w-3.5 text-[#666]" />
              </button>
              <span className="text-[14px] font-medium w-6 text-center">{quantity}</span>
              <button
                onClick={() => setQuantity(quantity + 1)}
                className="p-2 border border-[#E5E5E5] rounded-[2px] hover:bg-[#F5F5F3] transition-colors"
              >
                <Plus className="h-3.5 w-3.5 text-[#666]" />
              </button>
            </div>
          </div>

          {/* Add to Cart */}
          <button className="w-full bg-black text-white py-3.5 text-[11px] font-medium tracking-[0.1em] uppercase hover:bg-[#333] transition-colors rounded-[2px]">
            Add to cart — A${product.price * quantity}.00
          </button>

          <p className="text-[10px] text-[#999] mt-5 text-center tracking-[0.02em]">
            Checkout powered by Shopify
          </p>
        </div>
      </div>

      {/* Related Products */}
      <div className="mt-20 pt-10 border-t border-[#E5E5E5]">
        <h2 className="text-[13px] font-medium tracking-[0.02em] mb-8">You might also like</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
          {Object.values(products)
            .filter(p => p.id !== product.id)
            .slice(0, 4)
            .map(p => (
              <Link key={p.id} href={`/demo/product/${p.id}`} className="group">
                <div className={`${p.color} aspect-[3/4] rounded-[2px] flex items-center justify-center mb-3`}>
                  <span className={`text-[14px] font-serif ${p.textStyle} opacity-60`}>{p.title}</span>
                </div>
                <p className="text-[11px] font-medium tracking-[0.02em] group-hover:underline underline-offset-2">{p.title}</p>
                <p className="text-[11px] text-[#999] mt-0.5">A${p.price}.00</p>
              </Link>
            ))}
        </div>
      </div>
    </div>
  )
}
