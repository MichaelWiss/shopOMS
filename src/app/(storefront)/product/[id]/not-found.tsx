import Link from 'next/link'

export default function ProductNotFound() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-6">
      <div className="text-center max-w-md">
        <h1 className="text-[11px] uppercase tracking-[0.08em] text-[#1a1a1a]/60 mb-4">Product Not Found</h1>
        <p className="text-[24px] font-normal text-[#1a1a1a] mb-4">
          We couldn&apos;t find that product.
        </p>
        <p className="text-[14px] text-[#666] mb-6">
          The product you&apos;re looking for may have been removed or the link may be incorrect.
        </p>
        <div className="flex gap-3 justify-center">
          <Link
            href="/cards"
            className="px-6 py-3 bg-[#1a1a1a] text-white text-[13px] uppercase tracking-[0.06em] hover:bg-[#333] transition-colors"
          >
            Browse Cards
          </Link>
          <Link
            href="/"
            className="px-6 py-3 border border-[#1a1a1a] text-[#1a1a1a] text-[13px] uppercase tracking-[0.06em] hover:bg-[#f5f5f5] transition-colors"
          >
            Home
          </Link>
        </div>
      </div>
    </div>
  )
}
