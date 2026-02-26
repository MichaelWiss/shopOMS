import Link from 'next/link'
import Image from 'next/image'
import type { ShopifyProduct } from '@/types/shopify'

/**
 * Shared product card component used across the storefront.
 * Accepts a Shopify product and displays image, title, price, and tags.
 */
export function ProductCard({ product, description }: { product: ShopifyProduct; description?: string }) {
  const price = parseFloat(product.priceRange.minVariantPrice.amount)
  const imageUrl = product.featuredImage?.url
  const imageAlt = product.featuredImage?.altText ?? product.title

  return (
    <Link href={`/product/${product.handle}`} className="group block">
      {imageUrl ? (
        <div className="aspect-[3/4] mb-3 relative overflow-hidden bg-[#F5F5F5]">
          <Image
            src={imageUrl}
            alt={imageAlt}
            fill
            sizes="(max-width: 768px) 50vw, 25vw"
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </div>
      ) : (
        <div className="bg-[#F5F5F5] aspect-[3/4] mb-3 flex items-center justify-center p-8">
          <span className="text-[13px] text-[#999] text-center">{product.title}</span>
        </div>
      )}
      <h3 className="text-[13px] tracking-[0.01em] text-[#1a1a1a] uppercase mt-2">
        {product.title}
      </h3>
      <p className="text-[13px] text-[#1a1a1a]">A${price.toFixed(0)}.00</p>
      {description && (
        <p className="text-[13px] text-[#1a1a1a]/60 mt-2">{description}</p>
      )}
      <div className="flex flex-wrap gap-1.5 mt-2">
        {product.tags
          .filter((tag) => tag !== 'live-seed')
          .map((tag) => (
            <span
              key={tag}
              className="text-[10px] text-[#1a1a1a]/70 uppercase tracking-[0.03em] border border-[#1a1a1a]/30 px-2 py-0.5"
            >
              {tag}
            </span>
          ))}
      </div>
    </Link>
  )
}
