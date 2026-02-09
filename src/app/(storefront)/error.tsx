'use client'

import { useEffect } from 'react'
import Link from 'next/link'

export default function StorefrontError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Storefront error:', error)
  }, [error])

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-6">
      <div className="text-center max-w-md">
        <h1 className="text-[24px] font-normal text-[#1a1a1a] mb-4">Something went wrong</h1>
        <p className="text-[14px] text-[#666] mb-6">
          We encountered an error loading this page. Please try again or return to the homepage.
        </p>
        <div className="flex gap-3 justify-center">
          <button
            onClick={reset}
            className="px-6 py-3 bg-[#1a1a1a] text-white text-[13px] uppercase tracking-[0.06em] hover:bg-[#333] transition-colors"
          >
            Try Again
          </button>
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
