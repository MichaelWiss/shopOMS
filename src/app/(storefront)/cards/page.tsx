import { playfair } from '@/lib/fonts'
import { ProductCard } from '@/components/ProductCard'
import { featuredCards, allCards } from '@/lib/data/products'

const allCardsCombined = [...featuredCards, ...allCards]

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
        {allCardsCombined.map(card => (
          <ProductCard key={card.id} product={card} />
        ))}
      </div>
    </div>
  )
}
