import Link from 'next/link'
import { Playfair_Display } from 'next/font/google'

const playfair = Playfair_Display({ 
  subsets: ['latin'],
  weight: ['400', '500'],
})

// Letterpress business card products
const featuredCards = [
  { id: 1, title: 'The Classicist', price: 90, color: 'bg-[#F5F0E8]', textStyle: 'font-serif text-[#2A2A2A] text-[14px]', cardText: 'John Smith\nCreative Director', tags: ['CLASSIC', 'LETTERPRESS'] },
  { id: 2, title: 'The Modernist', price: 95, color: 'bg-[#FFFFFF] border border-[#E5E5E5]', textStyle: 'font-sans text-[#1a1a1a] text-[12px] tracking-widest uppercase', cardText: 'JANE DOE\nARCHITECT', tags: ['MODERN', 'MINIMAL'] },
  { id: 3, title: 'The Artisan', price: 110, color: 'bg-[#F8F5F0]', textStyle: 'font-serif italic text-[#1A365D] text-[14px]', cardText: 'Emma Rose\nFloral Design', tags: ['ARTISAN', 'TWO-COLOR'] },
  { id: 4, title: 'The Minimalist', price: 85, color: 'bg-[#FAFAFA]', textStyle: 'font-sans text-[#333] text-[11px] tracking-wider', cardText: 'M. CHEN\nSTUDIO', tags: ['MINIMAL', 'CLEAN'] },
]

const allCards = [
  { id: 5, title: 'The Correspondent', price: 75, color: 'bg-[#FFFEF8]', textStyle: 'font-serif italic text-[#1a1a1a] text-[16px]', cardText: 'William Hayes', tags: ['CALLING CARD', 'SCRIPT'] },
  { id: 6, title: 'The Bauhaus', price: 100, color: 'bg-[#F5F5F5]', textStyle: 'font-sans font-bold text-[#1a1a1a] text-[12px] uppercase tracking-widest', cardText: 'STUDIO\nBERLIN', tags: ['BAUHAUS', 'BOLD'] },
  { id: 7, title: 'The Editor', price: 90, color: 'bg-[#F0EDE8]', textStyle: 'font-serif text-[#3A3A3A] text-[13px]', cardText: 'Sarah James\nEditor', tags: ['CLASSIC', 'EDITORIAL'] },
  { id: 8, title: 'The Architect', price: 95, color: 'bg-[#FAFAFA] border border-[#E0E0E0]', textStyle: 'font-sans text-[#1a1a1a] text-[11px] tracking-[0.15em] uppercase', cardText: 'CHEN & CO\nARCHITECTURE', tags: ['MODERN', 'CORPORATE'] },
]

const samplePacks = [
  { id: 'sample-1', title: 'Classic Sample Pack', price: 15, color: 'bg-[#E8E4DC]', textStyle: 'font-serif text-[#4A4A4A] text-[11px]', cardText: '6 Card\nSamples', tags: ['SAMPLES'] },
  { id: 'sample-2', title: 'Modern Sample Pack', price: 15, color: 'bg-[#F0F0F0]', textStyle: 'font-sans text-[#333] text-[10px] uppercase tracking-wider', cardText: '6 CARD\nSAMPLES', tags: ['SAMPLES'] },
  { id: 'sample-3', title: 'Complete Sample Set', price: 25, color: 'bg-[#F5F0E8]', textStyle: 'font-serif text-[#5A5A5A] text-[11px]', cardText: 'All 12\nDesigns', tags: ['SAMPLES', 'COMPLETE'] },
]

function ProductCard({ 
  product 
}: { 
  product: {
    id: number | string
    title: string
    price: number
    tags: string[]
    color: string
    textStyle: string
    cardText: string
  }
}) {
  return (
    <Link href={`/product/${product.id}`} className="group block">
      <div className={`${product.color} aspect-[3/4] mb-3 flex items-center justify-center p-8`}>
        <span className={`whitespace-pre-line text-center leading-relaxed ${product.textStyle}`}>
          {product.cardText}
        </span>
      </div>
      <h3 className="text-[13px] tracking-[0.01em] text-[#1a1a1a] uppercase mt-2">{product.title}</h3>
      <p className="text-[13px] text-[#1a1a1a]">A${product.price}.00</p>
      <div className="flex flex-wrap gap-1.5 mt-2">
        {product.tags.map((tag) => (
          <span key={tag} className="text-[10px] text-[#1a1a1a] uppercase tracking-[0.03em] border border-[#ccc] px-2 py-0.5">
            {tag}
          </span>
        ))}
      </div>
    </Link>
  )
}

export default function HomePage() {
  return (
    <div>
      {/* Featured Cards */}
      <section className="max-w-[1400px] mx-auto px-6 pt-6 pb-10">
        <div className="flex justify-between items-baseline mb-4">
          <h2 className="text-[13px] text-[#1a1a1a] tracking-[0.02em]">Business Cards</h2>
          <Link href="/cards" className="text-[12px] text-[#1a1a1a]">See All</Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-5">
          {featuredCards.map(card => (
            <ProductCard key={card.id} product={card} />
          ))}
        </div>
      </section>

      {/* Lifestyle Images */}
      <section className="max-w-[1400px] mx-auto px-6 py-6">
        <div className="grid md:grid-cols-2 gap-4">
          <div className="aspect-[4/5] bg-[#E8DCD0] flex items-center justify-center">
            <span className="text-[#9A8A7A] text-[12px]">Lifestyle Image</span>
          </div>
          <div className="aspect-[4/5] bg-[#D8E4E8] flex items-center justify-center">
            <span className="text-[#6A8090] text-[12px]">Lifestyle Image</span>
          </div>
        </div>
      </section>

      {/* All Cards Grid */}
      <section className="max-w-[1400px] mx-auto px-6 py-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-5">
          {allCards.map(card => (
            <ProductCard key={card.id} product={card} />
          ))}
        </div>
      </section>

      {/* Sample Packs */}
      <section className="max-w-[1400px] mx-auto px-6 py-10">
        <div className="flex justify-between items-baseline mb-4">
          <h2 className="text-[13px] text-[#1a1a1a] tracking-[0.02em]">Samples</h2>
          <Link href="/samples" className="text-[12px] text-[#1a1a1a]">See all</Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-5">
          {samplePacks.map(pack => (
            <ProductCard key={pack.id} product={pack} />
          ))}
        </div>
      </section>

      {/* Feature Banner */}
      <section className="max-w-[1400px] mx-auto px-6 py-8">
        <div className="bg-[#D4A700] p-8 md:p-12">
          <span className="text-[10px] uppercase tracking-[0.08em] text-[#1a1a1a]/60">Hand-printed</span>
          <h3 className="text-[22px] md:text-[28px] mt-2 max-w-[480px] leading-[1.35] tracking-[-0.01em]">
            Cards for first impressions that last
          </h3>
        </div>
      </section>
    </div>
  )
}
