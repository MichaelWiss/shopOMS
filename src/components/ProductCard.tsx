import Link from 'next/link'
import Image from 'next/image'

export interface ProductCardProduct {
  id: number | string
  title: string
  price: number
  image?: string
  tags: string[]
  color?: string
  textStyle?: string
  cardText?: string
  description?: string
}

/**
 * Shared product card component used across the storefront.
 * Displays a product image (or styled text fallback), title, price, and tags.
 */
export function ProductCard({ product }: { product: ProductCardProduct }) {
  return (
    <Link href={`/product/${product.id}`} className="group block">
      {product.image ? (
        <div className="aspect-[3/4] mb-3 relative overflow-hidden bg-[#F5F5F5]">
          <Image
            src={product.image}
            alt={product.title}
            fill
            sizes="(max-width: 768px) 50vw, 25vw"
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </div>
      ) : (
        <div className={`${product.color || 'bg-[#F5F5F5]'} aspect-[3/4] mb-3 flex items-center justify-center p-8`}>
          <span className={`whitespace-pre-line text-center leading-relaxed ${product.textStyle || ''}`}>
            {product.cardText || ''}
          </span>
        </div>
      )}
      <h3 className="text-[13px] tracking-[0.01em] text-[#1a1a1a] uppercase mt-2">
        {product.title}
      </h3>
      <p className="text-[13px] text-[#1a1a1a]">A${product.price}.00</p>
      {product.description && (
        <p className="text-[13px] text-[#1a1a1a]/60 mt-2">{product.description}</p>
      )}
      <div className="flex flex-wrap gap-1.5 mt-2">
        {product.tags.map((tag) => (
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
