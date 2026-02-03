import Link from 'next/link'
import Image from 'next/image'
import { Playfair_Display } from 'next/font/google'

const playfair = Playfair_Display({ 
  subsets: ['latin'],
  weight: ['400', '500'],
})

const allCards = [
  { id: 1, title: 'The Classicist', price: 90, image: '/products/tp204-businesscard-04-ps.jpg', color: 'bg-[#F5F0E8]', textStyle: 'font-serif text-[#2A2A2A] text-[14px]', cardText: 'John Smith\nCreative Director', tags: ['CLASSIC', 'LETTERPRESS'] },
  { id: 2, title: 'The Modernist', price: 95, image: '/products/v900-sasi-businesscard-01.jpg', color: 'bg-[#FFFFFF] border border-[#E5E5E5]', textStyle: 'font-sans text-[#1a1a1a] text-[12px] tracking-widest uppercase', cardText: 'JANE DOE\nARCHITECT', tags: ['MODERN', 'MINIMAL'] },
  { id: 3, title: 'The Artisan', price: 110, image: '/products/10591621.jpg', color: 'bg-[#F8F5F0]', textStyle: 'font-serif italic text-[#1A365D] text-[14px]', cardText: 'Emma Rose\nFloral Design', tags: ['ARTISAN', 'TWO-COLOR'] },
  { id: 4, title: 'The Minimalist', price: 85, image: '/products/3285075.jpg', color: 'bg-[#FAFAFA]', textStyle: 'font-sans text-[#333] text-[11px] tracking-wider', cardText: 'M. CHEN\nSTUDIO', tags: ['MINIMAL', 'CLEAN'] },
  { id: 5, title: 'The Correspondent', price: 75, image: '/products/tp204-businesscard-04-ps.jpg', color: 'bg-[#FFFEF8]', textStyle: 'font-serif italic text-[#1a1a1a] text-[16px]', cardText: 'William Hayes', tags: ['CALLING CARD', 'SCRIPT'] },
  { id: 6, title: 'The Bauhaus', price: 100, image: '/products/v900-sasi-businesscard-01.jpg', color: 'bg-[#F5F5F5]', textStyle: 'font-sans font-bold text-[#1a1a1a] text-[12px] uppercase tracking-widest', cardText: 'STUDIO\nBERLIN', tags: ['BAUHAUS', 'BOLD'] },
  { id: 7, title: 'The Editor', price: 90, image: '/products/10591621.jpg', color: 'bg-[#F0EDE8]', textStyle: 'font-serif text-[#3A3A3A] text-[13px]', cardText: 'Sarah James\nEditor', tags: ['CLASSIC', 'EDITORIAL'] },
  { id: 8, title: 'The Architect', price: 95, image: '/products/3285075.jpg', color: 'bg-[#FAFAFA] border border-[#E0E0E0]', textStyle: 'font-sans text-[#1a1a1a] text-[11px] tracking-[0.15em] uppercase', cardText: 'CHEN & CO\nARCHITECTURE', tags: ['MODERN', 'CORPORATE'] },
]

function ProductCard({ 
  product 
}: { 
  product: {
    id: number | string
    title: string
    price: number
    image: string
    tags: string[]
    color: string
    textStyle: string
    cardText: string
  }
}) {
  return (
    <Link href={`/product/${product.id}`} className="group block">
      <div className="aspect-[3/4] mb-3 relative overflow-hidden bg-[#F5F5F5]">
        <Image
          src={product.image}
          alt={product.title}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-300"
        />
      </div>
      <h3 className="text-[13px] tracking-[0.01em] text-[#1a1a1a] uppercase mt-2">{product.title}</h3>
      <p className="text-[13px] text-[#1a1a1a]">A${product.price}.00</p>
      <div className="flex flex-wrap gap-1.5 mt-2">
        {product.tags.map((tag) => (
          <span key={tag} className="text-[10px] text-[#1a1a1a]/70 uppercase tracking-[0.03em] border border-[#1a1a1a]/30 px-2 py-0.5">
            {tag}
          </span>
        ))}
      </div>
    </Link>
  )
}

export default function CardsPage() {
  return (
    <div className="px-6 py-10">
      {/* Header */}
      <div className="mb-12">
        <h1 className="text-[11px] uppercase tracking-[0.08em] text-[#1a1a1a]/60 mb-4">Business Cards</h1>
        <p className={`${playfair.className} text-[28px] md:text-[36px] leading-[1.3] max-w-[700px]`}>
          Hand-pressed letterpress business cards, crafted with care in Melbourne.
        </p>
      </div>
      
      {/* Product Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
        {allCards.map(card => (
          <ProductCard key={card.id} product={card} />
        ))}
      </div>
    </div>
  )
}
