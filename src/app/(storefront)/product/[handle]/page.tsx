import Link from 'next/link'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import { getProductByHandle, getProducts } from '@/lib/shopify/products'
import { AddToCartButton } from '@/components/AddToCartButton'

export const revalidate = 60

export async function generateStaticParams() {
  const { products } = await getProducts(50)
  return products.map((p) => ({ handle: p.handle }))
}

export default async function ProductPage({ params }: { params: Promise<{ handle: string }> }) {
  const { handle } = await params
  const product = await getProductByHandle(handle)

  if (!product) {
    notFound()
  }

  const variants = product.variants.edges.map(e => e.node)
  const minPrice = parseFloat(product.priceRange.minVariantPrice.amount)
  const imageUrl = product.featuredImage?.url
  const allImages = product.images.edges.map(e => e.node)

  // Get related products (same productType, excluding current)
  const { products: allProducts } = await getProducts(20)
  const related = allProducts
    .filter(p => p.id !== product.id && p.productType === product.productType)
    .slice(0, 4)

  return (
    <div className="max-w-[1200px] mx-auto px-6 py-10">
      <div className="grid md:grid-cols-2 gap-10 md:gap-16">
        {/* Product Image */}
        <div>
          {imageUrl ? (
            <div className="aspect-[3/4] relative overflow-hidden bg-[#F5F5F5]">
              <Image
                src={imageUrl}
                alt={product.featuredImage?.altText ?? product.title}
                fill
                className="object-cover"
                priority
              />
            </div>
          ) : (
            <div className="aspect-[3/4] bg-[#F5F5F5] flex items-center justify-center">
              <span className="text-[#999] text-[14px]">{product.title}</span>
            </div>
          )}
          {/* Additional images */}
          {allImages.length > 1 && (
            <div className="grid grid-cols-4 gap-2 mt-2">
              {allImages.slice(1, 5).map((img, i) => (
                <div key={i} className="aspect-square relative overflow-hidden bg-[#F5F5F5]">
                  <Image
                    src={img.url}
                    alt={img.altText ?? `${product.title} ${i + 2}`}
                    fill
                    className="object-cover"
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Product Details */}
        <div>
          <h1 className="text-[28px] md:text-[32px] font-normal tracking-[-0.01em] text-[#1a1a1a]">{product.title}</h1>

          {/* Tags */}
          <div className="flex flex-wrap gap-1.5 mt-3">
            {product.tags.filter(t => t !== 'live-seed').map(tag => (
              <span key={tag} className="text-[10px] text-[#1a1a1a]/70 uppercase tracking-[0.03em] border border-[#1a1a1a]/30 px-2 py-0.5">
                {tag}
              </span>
            ))}
          </div>

          {/* Description */}
          <div className="mt-8">
            <h3 className="text-[11px] uppercase tracking-[0.1em] text-[#1a1a1a] font-medium mb-3">Description</h3>
            <div
              className="text-[14px] text-[#666] leading-[1.7] prose prose-sm max-w-none [&_h3]:text-[11px] [&_h3]:uppercase [&_h3]:tracking-[0.1em] [&_h3]:text-[#1a1a1a] [&_h3]:font-medium [&_h3]:mt-6 [&_h3]:mb-3 [&_ul]:list-none [&_ul]:pl-0 [&_li]:text-[14px] [&_li]:text-[#666] [&_li]:leading-[1.8]"
              dangerouslySetInnerHTML={{ __html: product.descriptionHtml }}
            />
          </div>

          {/* Price */}
          <p className="text-[24px] text-[#1a1a1a] mt-8">${minPrice.toFixed(0)}</p>

          {/* Customize Your Card */}
          {product.productType === 'Business Card' && (
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
          )}

          {/* Add to Cart */}
          <AddToCartButton 
            variantId={variants[0]?.id ?? ''}
            variants={variants.length > 1 ? variants.map(v => ({
              id: v.id,
              title: v.selectedOptions.map(o => o.value).join(' / '),
              price: v.price.amount,
            })) : undefined}
            className="mt-6"
          />

          {/* Free Shipping */}
          <p className="text-[13px] text-[#666] text-center mt-3">Free US Shipping</p>

          {/* Letterpress note */}
          <div className="mt-8 flex items-center gap-4">
            <div className="w-20 h-20 bg-[#F5F5F5] flex items-center justify-center flex-shrink-0">
              <span className="text-[9px] text-[#999] text-center">Hand<br />Printed</span>
            </div>
            <p className="text-[12px] text-[#999] leading-[1.6]">Hand printed on antique letterpresses, one card at a time</p>
          </div>
        </div>
      </div>

      {/* Info Sections */}
      {product.productType === 'Business Card' && (
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
      )}

      {/* Related Products */}
      {related.length > 0 && (
        <div className="mt-16 pt-10 border-t border-[#E5E5E5]">
          <h2 className="text-[13px] text-[#1a1a1a] tracking-[0.02em] mb-6">You may also like</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-5">
            {related.map(p => (
              <Link key={p.id} href={`/product/${p.handle}`} className="group block">
                {p.featuredImage ? (
                  <div className="aspect-[3/4] mb-3 relative overflow-hidden bg-[#F5F5F5]">
                    <Image
                      src={p.featuredImage.url}
                      alt={p.featuredImage.altText ?? p.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                ) : (
                  <div className="aspect-[3/4] mb-3 bg-[#F5F5F5] flex items-center justify-center">
                    <span className="text-[#999] text-[13px]">{p.title}</span>
                  </div>
                )}
                <h3 className="text-[13px] tracking-[0.01em] text-[#1a1a1a] uppercase mt-2">{p.title}</h3>
                <p className="text-[13px] text-[#1a1a1a]">${parseFloat(p.priceRange.minVariantPrice.amount).toFixed(0)}.00</p>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
