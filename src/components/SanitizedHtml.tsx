'use client'

import { useEffect, useRef } from 'react'
import DOMPurify from 'dompurify'

interface SanitizedHtmlProps {
  html: string
  className?: string
}

export function SanitizedHtml({ html, className }: SanitizedHtmlProps) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (ref.current) {
      ref.current.innerHTML = DOMPurify.sanitize(html)
    }
  }, [html])

  return <div ref={ref} className={className} />
}
