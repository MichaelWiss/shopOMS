import Link from 'next/link'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import { getProductById, getAllProductIds, productDetails } from '@/lib/data/products'

export function generateStaticParams() {
  return getAllProductIds().map((id) => ({ id }))
}

export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const product = getProductById(id)

  if (!product) {
    notFound()
  }

  return (
    <div className="max-w-[1200px] mx-auto px-6 py-10">
      <div className="grid md:grid-cols-2 gap-10 md:gap-16">
        {/* Product Image */}
        <div>
          <div className="aspect-[3/4] relative overflow-hidden bg-[#F5F5F5]">
            <Image
              src={product.image}
              alt={product.title}
              fill
              className="object-cover"
              priority
            />
          </div>
        </div>

        {/* Product Details */}
        <div>
          <h1 className="text-[28px] md:text-[32px] font-normal tracking-[-0.01em] text-[#1a1a1a]">{product.title}</h1>
          
          {/* Description Section */}
          <div className="mt-8">
            <h3 className="text-[11px] uppercase tracking-[0.1em] text-[#1a1a1a] font-medium mb-3">Description</h3>
            <p className="text-[14px] text-[#666] leading-[1.7]">
              {product.description.split(/(\w+)(?=,)/).map((part, i) => {
                const typeface = product.typefaces.find(t => product.description.includes(t.name) && part.includes(t.name))
                if (typeface?.link) {
                  return <Link key={i} href={typeface.link} className="underline" target="_blank">{part}</Link>
                }
                return part
              })}
              {' '}{product.descriptionDetails}
            </p>
          </div>

          {/* Specifications Section */}
          <div className="mt-8">
            <h3 className="text-[11px] uppercase tracking-[0.1em] text-[#1a1a1a] font-medium mb-3">Specifications</h3>
            <div className="text-[14px] text-[#666] leading-[1.8]">
              <p>{product.specifications.size}</p>
              <p>{product.specifications.paper}</p>
              <p>{product.specifications.ink}</p>
              <p>{product.specifications.press}</p>
            </div>
          </div>

          {/* Price */}
          <p className="text-[24px] text-[#1a1a1a] mt-8">${product.price}</p>

          {/* Quantity Selection */}
          <div className="mt-6">
            <label className="text-[11px] uppercase tracking-[0.1em] text-[#666] block mb-2">Quantity</label>
            <select className="w-full border border-[#E5E5E5] px-4 py-3 text-[14px] bg-white appearance-none cursor-pointer">
              {product.quantities.map((q) => (
                <option key={q.qty} value={q.qty}>
                  {q.qty} cards — ${q.price}
                </option>
              ))}
            </select>
          </div>

          {/* Paper Weight Selection */}
          <div className="mt-4">
            <label className="text-[11px] uppercase tracking-[0.1em] text-[#666] block mb-2">Paper Weight</label>
            <select className="w-full border border-[#E5E5E5] px-4 py-3 text-[14px] bg-white appearance-none cursor-pointer">
              {product.paperWeights.map((paper) => (
                <option key={paper.name} value={paper.name}>
                  {paper.name}{paper.price > 0 ? ` (+$${paper.price})` : ''}
                </option>
              ))}
            </select>
          </div>

          {/* Customize Your Card */}
          <div className="mt-6">
            <h4 className="text-[12px] uppercase tracking-[0.05em] text-[#1a1a1a] font-medium mb-3">Customize Your Card</h4>
            <label className="flex items-start gap-3 cursor-pointer">
              <input type="checkbox" defaultChecked className="w-4 h-4 mt-0.5 accent-[#1a1a1a]" />
              <div>
                <span className="text-[14px]">PDF Proof (Free)</span>
                <p className="text-[13px] text-[#999] mt-0.5">Before printing, we&apos;ll email you a PDF proof for approval. <Link href="#" className="underline">Details</Link></p>
              </div>
            </label>
          </div>

          {/* Add to Cart */}
          <button className="w-full bg-[#1a1a1a] text-white py-4 mt-6 text-[13px] uppercase tracking-[0.1em] hover:bg-[#333] transition-colors">
            Add to Cart
          </button>

          {/* Free Shipping */}
          <p className="text-[13px] text-[#666] text-center mt-3">Free US Shipping</p>

          {/* Letterpress Image */}
          <div className="mt-8 flex items-center gap-4">
            <div className="w-20 h-20 bg-[#F5F5F5] flex items-center justify-center flex-shrink-0">
              <span className="text-[9px] text-[#999] text-center">1945 Chandler<br />& Price</span>
            </div>
            <p className="text-[12px] text-[#999] leading-[1.6]">Hand printed on antique letterpresses, one card at a time</p>
          </div>
        </div>
      </div>

      {/* Info Sections - All in one row */}
      <div className="mt-16 pt-10 border-t border-[#E5E5E5]">
        <div className="grid md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-[13px] text-[#1a1a1a] font-medium mb-3">Bulk Discounts</h3>
            <div className="text-[12px] text-[#666] space-y-1">
              <p>2 orders — 10% off</p>
              <p>3-5 orders — 15% off</p>
              <p>6-9 orders — 20% off</p>
              <p>10+ orders — 25% off</p>
            </div>
          </div>
          <div>
            <h3 className="text-[13px] text-[#1a1a1a] font-medium mb-3">Adding a Logo?</h3>
            <p className="text-[12px] text-[#666] leading-[1.6] mb-3">
              Custom layouts, logos, or specific typefaces available.
            </p>
            <Link href="/custom" className="text-[11px] underline text-[#1a1a1a]">Request a Quote</Link>
          </div>
          <div>
            <h3 className="text-[13px] text-[#1a1a1a] font-medium mb-3">Why Letterpress?</h3>
            <p className="text-[12px] text-[#666] leading-[1.6]">
              Relief printing creates an impression you can see and feel. <Link href="/about" className="underline">Learn More</Link>
            </p>
          </div>
          <div>
            <h3 className="text-[13px] text-[#1a1a1a] font-medium mb-3">Reorders</h3>
            <p className="text-[12px] text-[#666] leading-[1.6]">
              We keep your plate on file. <span className="text-[#1a1a1a]">20% off</span> all reorders, forever.
            </p>
          </div>
        </div>
      </div>

      {/* Related Products */}
      <div className="mt-16 pt-10 border-t border-[#E5E5E5]">
        <h2 className="text-[13px] text-[#1a1a1a] tracking-[0.02em] mb-6">You may also like</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-5">
          {Object.values(productDetails).filter(p => p.id !== product.id).slice(0, 4).map(p => (
            <Link key={p.id} href={`/product/${p.id}`} className="group block">
              <div className="aspect-[3/4] mb-3 relative overflow-hidden bg-[#F5F5F5]">
                <Image
                  src={p.image}
                  alt={p.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <h3 className="text-[13px] tracking-[0.01em] text-[#1a1a1a] uppercase mt-2">{p.title}</h3>
              <p className="text-[13px] text-[#1a1a1a]">${p.price}.00</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
