import Image from 'next/image'
import Link from 'next/link'
import { Playfair_Display } from 'next/font/google'

const playfair = Playfair_Display({ 
  subsets: ['latin'],
  weight: ['400', '500'],
})

const samplePacks = [
  { id: 'sample-1', title: 'Classic Sample Pack', price: 15, image: '/products/Stack-Letterpress-Business-Cards-Mockup.jpg', tags: ['SAMPLES'], description: 'A curated selection of our classic letterpress designs on premium cotton paper.' },
  { id: 'sample-2', title: 'Modern Sample Pack', price: 15, image: '/products/tp204-businesscard-04-ps.jpg', tags: ['SAMPLES'], description: 'Clean, contemporary designs featuring minimal typography and geometric elements.' },
  { id: 'sample-3', title: 'Complete Sample Set', price: 25, image: '/products/v900-sasi-businesscard-01.jpg', tags: ['SAMPLES', 'COMPLETE'], description: 'Every design in our collection, perfect for those who want to see and feel all options.' },
]

function SampleCard({ 
  product 
}: { 
  product: {
    id: string
    title: string
    price: number
    tags: string[]
    image: string
    description: string
  }
}) {
  return (
    <Link href={`/product/${product.id}`} className="group block">
      <div className="aspect-[3/4] mb-3 relative overflow-hidden bg-[#f5f5f5]">
        <Image
          src={product.image}
          alt={product.title}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-300"
        />
      </div>
      <h3 className="text-[13px] tracking-[0.01em] text-[#1a1a1a] uppercase mt-2">{product.title}</h3>
      <p className="text-[13px] text-[#1a1a1a]">A${product.price}.00</p>
      <p className="text-[13px] text-[#1a1a1a]/60 mt-2">{product.description}</p>
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
          <SampleCard key={pack.id} product={pack} />
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
