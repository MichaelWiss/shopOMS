import Link from 'next/link'
import Image from 'next/image'
import { ProductCard } from '@/components/ProductCard'
import { featuredCards, allCards, samplePacks } from '@/lib/data/products'

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
          <div className="aspect-[4/5] relative overflow-hidden bg-[#F5F5F5]">
            <Image
              src="/products/11633523.jpg"
              alt="Letterpress business cards lifestyle"
              fill
              className="object-cover"
            />
          </div>
          <div className="aspect-[4/5] relative overflow-hidden bg-[#F5F5F5]">
            <Image
              src="/products/beautiful-inspirational-quote-message.jpg"
              alt="Letterpress cards detail"
              fill
              className="object-cover"
            />
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
