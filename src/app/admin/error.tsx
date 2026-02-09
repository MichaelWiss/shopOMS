'use client'

import { useEffect } from 'react'
import Link from 'next/link'

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Admin error:', error)
  }, [error])

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-6">
      <div className="text-center max-w-md">
        <h1 className="text-[20px] font-medium text-[#1a1a1a] mb-3">Something went wrong</h1>
        <p className="text-[14px] text-[#666] mb-6">
          An error occurred in the admin panel. This may be a temporary issue with an external service.
        </p>
        <div className="flex gap-3 justify-center">
          <button
            onClick={reset}
            className="px-5 py-2.5 bg-[#1a1a1a] text-white text-[13px] rounded hover:bg-[#333] transition-colors"
          >
            Try Again
          </button>
          <Link
            href="/admin"
            className="px-5 py-2.5 border border-[#ddd] text-[#1a1a1a] text-[13px] rounded hover:bg-[#f5f5f5] transition-colors"
          >
            Dashboard
          </Link>
        </div>
      </div>
    </div>
  )
}
