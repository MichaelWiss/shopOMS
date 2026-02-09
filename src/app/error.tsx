'use client'

import { useEffect } from 'react'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Unhandled error:', error)
  }, [error])

  return (
    <div className="min-h-screen flex items-center justify-center bg-white px-6">
      <div className="text-center max-w-md">
        <h1 className="text-[24px] font-normal text-[#1a1a1a] mb-4">Something went wrong</h1>
        <p className="text-[14px] text-[#666] mb-6">
          An unexpected error occurred. Please try again.
        </p>
        <button
          onClick={reset}
          className="px-6 py-3 bg-[#1a1a1a] text-white text-[13px] uppercase tracking-[0.06em] hover:bg-[#333] transition-colors"
        >
          Try Again
        </button>
      </div>
    </div>
  )
}
