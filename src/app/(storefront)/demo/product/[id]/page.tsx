'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ChevronLeft, Minus, Plus } from 'lucide-react'
import { playfair } from '@/lib/fonts'

// Bespoke letterpress card products
const products: Record<string, {
  id: number
  title: string
  price: number
  description: string
  typefaces: string
  specifications: string[]
  details: string[]
  tags: string[]
  color: string
  textStyle: string
  cardText: string
}> = {
  '1': { 
    id: 1, 
    title: 'The Classicist', 
    price: 90, 
    description: 'The Classicist is set in the timeless Garamond, with contact details in a refined italic. A traditional layout that speaks to heritage and craftsmanship.',
    typefaces: 'Garamond with italic accents',
    specifications: ['Standard size (55 x 85mm)', 'Crane Lettra 220gsm cotton paper', 'Black ink', 'Hand printed on a 1962 Heidelberg Windmill'],
    details: ['Includes 100 cards', 'PDF proof for approval', 'Ships in 10-14 business days', 'Reorders receive 20% off'],
    tags: ['CLASSIC', 'LETTERPRESS', 'BUSINESS'],
    color: 'bg-[#F5F0E8]', 
    textStyle: 'font-serif text-[#2A2A2A]',
    cardText: 'John Smith\nCreative Director'
  },
  '2': { 
    id: 2, 
    title: 'The Modernist', 
    price: 95, 
    description: 'The Modernist features clean Futura typography with generous white space. Contemporary and bold, perfect for creative professionals.',
    typefaces: 'Futura Medium',
    specifications: ['Standard size (55 x 85mm)', 'Crane Lettra 220gsm cotton paper', 'Charcoal ink', 'Hand printed on a 1962 Heidelberg Windmill'],
    details: ['Includes 100 cards', 'PDF proof for approval', 'Ships in 10-14 business days', 'Reorders receive 20% off'],
    tags: ['MODERN', 'LETTERPRESS', 'MINIMAL'],
    color: 'bg-[#FFFFFF] border border-[#E5E5E5]', 
    textStyle: 'font-sans text-[#1a1a1a] tracking-wide',
    cardText: 'JANE DOE\nARCHITECT'
  },
  '3': { 
    id: 3, 
    title: 'The Artisan', 
    price: 110, 
    description: 'The Artisan combines hand-drawn script with classic serifs. Two-color printing on luxurious cotton stock for those who appreciate craft.',
    typefaces: 'Custom script with Caslon',
    specifications: ['Standard size (55 x 85mm)', 'Crane Lettra 300gsm cotton paper', 'Navy + Gold ink (2 colors)', 'Hand printed on a 1945 Chandler & Price'],
    details: ['Includes 100 cards', 'PDF proof for approval', 'Ships in 14-21 business days', 'Reorders receive 20% off'],
    tags: ['ARTISAN', 'TWO-COLOR', 'PREMIUM'],
    color: 'bg-[#F8F5F0]', 
    textStyle: 'font-serif italic text-[#1A365D]',
    cardText: 'Emma Rose\nFloral Design'
  },
  '4': { 
    id: 4, 
    title: 'The Minimalist', 
    price: 85, 
    description: 'The Minimalist strips away the unnecessary. Helvetica Neue in a single weight, positioned with mathematical precision.',
    typefaces: 'Helvetica Neue Light',
    specifications: ['Standard size (55 x 85mm)', 'Crane Lettra 220gsm cotton paper', 'Black ink', 'Hand printed on a 1962 Heidelberg Windmill'],
    details: ['Includes 100 cards', 'PDF proof for approval', 'Ships in 10-14 business days', 'Reorders receive 20% off'],
    tags: ['MINIMAL', 'LETTERPRESS', 'CLEAN'],
    color: 'bg-[#FAFAFA]', 
    textStyle: 'font-sans text-[#333] text-sm tracking-wider',
    cardText: 'M. CHEN\nSTUDIO'
  },
  '5': { 
    id: 5, 
    title: 'The Correspondent', 
    price: 75, 
    description: 'Personal calling cards in the tradition of Victorian correspondence. Elegant script centered on heavy cotton stock.',
    typefaces: 'Copperplate Script',
    specifications: ['Calling card size (50 x 75mm)', 'Crane Lettra 300gsm cotton paper', 'Black ink', 'Hand printed on a 1945 Chandler & Price'],
    details: ['Includes 100 cards', 'PDF proof for approval', 'Ships in 10-14 business days', 'Reorders receive 20% off'],
    tags: ['CALLING CARD', 'SCRIPT', 'TRADITIONAL'],
    color: 'bg-[#FFFEF8]', 
    textStyle: 'font-serif italic text-[#1a1a1a]',
    cardText: 'William Hayes'
  },
  '6': { 
    id: 6, 
    title: 'The Bauhaus', 
    price: 100, 
    description: 'Inspired by the Bauhaus movement. Bold geometric forms and primary colors meet precision letterpress printing.',
    typefaces: 'DIN with geometric accents',
    specifications: ['Standard size (55 x 85mm)', 'Crane Lettra 220gsm cotton paper', 'Black + Red ink (2 colors)', 'Hand printed on a 1962 Heidelberg Windmill'],
    details: ['Includes 100 cards', 'PDF proof for approval', 'Ships in 14-21 business days', 'Reorders receive 20% off'],
    tags: ['BAUHAUS', 'TWO-COLOR', 'BOLD'],
    color: 'bg-[#F5F5F5]', 
    textStyle: 'font-sans font-bold text-[#1a1a1a] uppercase tracking-widest',
    cardText: 'STUDIO\nBERLIN'
  },
}

export default function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const [quantity, setQuantity] = useState(100)
  const [paperWeight, setPaperWeight] = useState('220gsm')
  const [includeProof, setIncludeProof] = useState(true)
  
  // Unwrap params for client component
  const { id } = params as unknown as { id: string }
  const product = products[id] || products['1']

  const quantityOptions = [100, 250, 500]
  const paperOptions = ['220gsm', '300gsm (+$15)']

  // Calculate price
  const basePrice = product.price
  const quantityMultiplier = quantity === 250 ? 2.2 : quantity === 500 ? 4 : 1
  const paperUpcharge = paperWeight.includes('+') ? 15 : 0
  const totalPrice = Math.round(basePrice * quantityMultiplier + paperUpcharge)

  return (
    <div className="max-w-[1400px] mx-auto px-6 py-8">
      {/* Back Link */}
      <Link href="/demo" className="inline-flex items-center gap-1 text-[12px] text-[#999] mb-10">
        <ChevronLeft className="h-3 w-3" />
        Back to cards
      </Link>

      <div className="grid md:grid-cols-2 gap-10 md:gap-20">
        {/* Product Image */}
        <div>
          <div className={`${product.color} aspect-[3/4] flex items-center justify-center p-10`}>
            <div className="text-center">
              <span className={`text-[18px] whitespace-pre-line leading-relaxed ${product.textStyle}`}>
                {product.cardText}
              </span>
            </div>
          </div>
          <p className="text-[10px] text-[#999] mt-3 text-center">
            Hand printed on antique letterpress
          </p>
        </div>

        {/* Product Info */}
        <div className="py-2">
          <h1 className={`${playfair.className} text-[32px] mb-2`}>{product.title}</h1>
          <p className="text-[14px] text-[#1a1a1a] mb-8">From A${product.price}.00</p>

          {/* Description */}
          <div className="mb-10">
            <h3 className="text-[11px] tracking-[0.1em] mb-3 text-[#999] uppercase">Description</h3>
            <p className="text-[14px] text-[#666] leading-[1.7]">{product.description}</p>
            <p className="text-[13px] text-[#999] mt-3">Typefaces: {product.typefaces}</p>
          </div>

          {/* Specifications */}
          <div className="mb-10">
            <h3 className="text-[11px] tracking-[0.1em] mb-3 text-[#999] uppercase">Specifications</h3>
            <ul className="text-[13px] text-[#666] space-y-1.5 leading-[1.6]">
              {product.specifications.map((spec, i) => (
                <li key={i}>{spec}</li>
              ))}
            </ul>
          </div>

          {/* Quantity Selection */}
          <div className="mb-6">
            <h3 className="text-[11px] tracking-[0.1em] mb-3 text-[#999] uppercase">Quantity</h3>
            <div className="flex gap-2">
              {quantityOptions.map(q => (
                <button
                  key={q}
                  onClick={() => setQuantity(q)}
                  className={`px-4 py-2 text-[12px] border ${quantity === q ? 'border-[#1a1a1a] bg-[#1a1a1a] text-white' : 'border-[#E5E5E5] text-[#666]'}`}
                >
                  {q} cards
                </button>
              ))}
            </div>
          </div>

          {/* Paper Weight */}
          <div className="mb-6">
            <h3 className="text-[11px] tracking-[0.1em] mb-3 text-[#999] uppercase">Paper Weight</h3>
            <div className="flex gap-2">
              {paperOptions.map(p => (
                <button
                  key={p}
                  onClick={() => setPaperWeight(p)}
                  className={`px-4 py-2 text-[12px] border ${paperWeight === p ? 'border-[#1a1a1a] bg-[#1a1a1a] text-white' : 'border-[#E5E5E5] text-[#666]'}`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          {/* PDF Proof */}
          <div className="mb-8">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={includeProof}
                onChange={(e) => setIncludeProof(e.target.checked)}
                className="w-4 h-4 accent-[#1a1a1a]"
              />
              <span className="text-[13px] text-[#666]">PDF Proof for approval (Free)</span>
            </label>
            <p className="text-[11px] text-[#999] mt-1 ml-7">We'll email you a proof before printing</p>
          </div>

          {/* Add to Cart */}
          <button className="w-full bg-[#1a1a1a] text-white py-4 text-[12px] tracking-[0.1em] uppercase">
            Add to cart — A${totalPrice}.00
          </button>

          <p className="text-[11px] text-[#999] mt-4 text-center">
            Free shipping on all orders
          </p>

          {/* Tags */}
          <div className="mt-10 pt-8 border-t border-[#E5E5E5]">
            <div className="flex flex-wrap gap-2">
              {product.tags.map(tag => (
                <span key={tag} className="text-[10px] text-[#1a1a1a] uppercase tracking-[0.03em] border border-[#ccc] px-2 py-0.5">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Additional Info Sections */}
      <div className="grid md:grid-cols-3 gap-10 mt-20 pt-10 border-t border-[#E5E5E5]">
        <div>
          <h3 className={`${playfair.className} text-[20px] mb-4`}>Bulk Discounts</h3>
          <div className="text-[13px] text-[#666] space-y-2">
            <div className="flex justify-between py-2 border-b border-[#E5E5E5]">
              <span>2 Orders</span>
              <span>10% off</span>
            </div>
            <div className="flex justify-between py-2 border-b border-[#E5E5E5]">
              <span>3-5 Orders</span>
              <span>15% off</span>
            </div>
            <div className="flex justify-between py-2 border-b border-[#E5E5E5]">
              <span>6+ Orders</span>
              <span>20% off</span>
            </div>
          </div>
        </div>

        <div>
          <h3 className={`${playfair.className} text-[20px] mb-4`}>Why Letterpress?</h3>
          <p className="text-[13px] text-[#666] leading-[1.7]">
            Letterpress printing creates a tactile impression that digital printing cannot replicate. 
            Each card is hand-fed through antique presses, resulting in a subtle deboss that you can see and feel.
          </p>
        </div>

        <div>
          <h3 className={`${playfair.className} text-[20px] mb-4`}>Custom Design?</h3>
          <p className="text-[13px] text-[#666] leading-[1.7] mb-4">
            Need a custom layout, specific typeface, or want to add your logo? We offer fully bespoke design services.
          </p>
          <Link href="/demo" className="text-[12px] text-[#1a1a1a] border-b border-[#1a1a1a] pb-0.5">
            Request a quote
          </Link>
        </div>
      </div>

      {/* Other Cards */}
      <div className="mt-20 pt-10 border-t border-[#E5E5E5]">
        <h2 className={`${playfair.className} text-[24px] mb-8`}>Other Cards</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-5">
          {Object.values(products)
            .filter(p => p.id !== product.id)
            .slice(0, 3)
            .map(p => (
              <Link key={p.id} href={`/demo/product/${p.id}`} className="group">
                <div className={`${p.color} aspect-[3/4] flex items-center justify-center p-6 mb-3`}>
                  <span className={`text-[12px] whitespace-pre-line text-center leading-relaxed ${p.textStyle}`}>
                    {p.cardText}
                  </span>
                </div>
                <p className={`${playfair.className} text-[16px]`}>{p.title}</p>
                <p className="text-[12px] text-[#999] mt-0.5">From A${p.price}.00</p>
              </Link>
            ))}
        </div>
      </div>
    </div>
  )
}
