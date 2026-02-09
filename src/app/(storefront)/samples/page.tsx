import { playfair } from '@/lib/fonts'
import { ProductCard } from '@/components/ProductCard'
import { samplePacks } from '@/lib/data/products'

export default function SamplesPage() {
  return (
    <div className="px-6 py-10 bg-[#F8B4C4] min-h-screen">
      {/* Header */}
      <div className="mb-12">
        <h1 className="text-[11px] uppercase tracking-[0.08em] text-[#1a1a1a]/60 mb-4">Sample Packs</h1>
        <p className={`${playfair.className} text-[28px] md:text-[36px] leading-[1.3] max-w-[700px]`}>
          Not sure which design is right for you? Order a sample pack to feel the quality and see the details up close.
        </p>
      </div>
      
      {/* Product Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 mb-16">
        {samplePacks.map(pack => (
          <ProductCard key={pack.id} product={{ ...pack, description: pack.sampleDescription }} />
        ))}
      </div>

      {/* Why Samples Section */}
      <div className="bg-[#D4A700] p-8 md:p-12">
        <h2 className="text-[11px] uppercase tracking-[0.08em] text-[#1a1a1a]/60 mb-6">Why Order Samples?</h2>
        <div className="grid md:grid-cols-2 gap-8">
          <ul className="text-[15px] leading-[1.8] text-[#1a1a1a]/80 space-y-2">
            <li>— Feel the weight and texture of our 600gsm cotton paper</li>
            <li>— See the depth of the letterpress impression</li>
          </ul>
          <ul className="text-[15px] leading-[1.8] text-[#1a1a1a]/80 space-y-2">
            <li>— Compare different design styles side by side</li>
            <li>— Sample cost credited towards your first order</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
