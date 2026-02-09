import Link from 'next/link'
import { ShoppingBag } from 'lucide-react'
import { playfair } from '@/lib/fonts'

export default function StorefrontLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-white text-[#1a1a1a]">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white">
        <div className="max-w-[1400px] mx-auto px-6 py-5">
          <div className="flex items-start justify-between">
            {/* Logo & Nav */}
            <div className="flex gap-24">
              <Link href="/" className={`${playfair.className} flex flex-col text-[42px] leading-[1.15]`}>
                <span>Press &amp; Co</span>
                <span className="text-[#D4A700]">Cards</span>
                <span>Samples</span>
              </Link>
              <nav className={`${playfair.className} hidden md:flex flex-col text-[42px] leading-[1.15]`}>
                <Link href="/about" className="text-[#D4A700]">About</Link>
                <Link href="/custom" className="text-[#D4A700]">Custom</Link>
                <Link href="/" className="text-[#999]">Search...</Link>
              </nav>
            </div>

            {/* Contact & Cart */}
            <div className="flex items-start gap-12">
              <div className="hidden lg:block text-right text-[11px] text-[#666] leading-[1.8]">
                <p>Contact:</p>
                <p>hello@pressandco.com</p>
                <p>(+61) 400 000 000</p>
                <p className="mt-3">Instagram:</p>
                <p>@pressandco</p>
              </div>
              <Link href="/cart" className="flex items-center gap-1.5 text-[13px]">
                <span>Cart</span>
                <ShoppingBag className="h-[14px] w-[14px]" strokeWidth={1.5} />
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main>{children}</main>

      {/* Newsletter */}
      <section className="bg-[#F5C518] py-12 px-6">
        <div className="max-w-[1400px] mx-auto flex flex-col md:flex-row items-start justify-between gap-10">
          <div className="max-w-[440px]">
            <p className="text-[22px] leading-[1.4] tracking-[-0.01em]">
              Join our mailing list for new designs, printing tips, and occasional discounts. We send sparingly.
            </p>
            <form className="mt-4 flex gap-2">
              <input 
                type="email" 
                placeholder="Enter your email"
                className="flex-1 px-3 py-2.5 bg-white text-[13px] border-0 outline-none placeholder:text-[#999]"
              />
              <button className="px-5 py-2.5 bg-[#1a1a1a] text-white text-[11px] uppercase tracking-[0.06em]">
                Subscribe
              </button>
            </form>
          </div>
          <div className="w-[260px] h-[180px] bg-[#C8A000]"></div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#F5F5F3] py-14 px-6">
        <div className="max-w-[1400px] mx-auto">
          <div className="flex flex-wrap justify-between gap-12 mb-16">
            <div className={`${playfair.className} flex flex-col gap-0.5`}>
              <Link href="/about" className="text-[28px] md:text-[32px]">About</Link>
              <Link href="/contact" className="text-[28px] md:text-[32px]">Contact</Link>
              <Link href="/faq" className="text-[28px] md:text-[32px]">FAQ</Link>
              <Link href="/custom" className="text-[28px] md:text-[32px]">Custom Work</Link>
            </div>
            <div className={`${playfair.className}`}>
              <Link href="/privacy" className="text-[28px] md:text-[32px]">Privacy</Link>
            </div>
            <div className="text-right text-[11px] text-[#999] leading-[1.8]">
              <p className="text-[#666]">Location:</p>
              <p>Melbourne, Australia</p>
              <p className="text-[#666] mt-2">Est:</p>
              <p>2024</p>
            </div>
          </div>
          <div className={`${playfair.className} text-[80px] md:text-[140px] lg:text-[180px] tracking-[-0.02em] leading-[0.9]`}>
            Press &amp; Co
          </div>
        </div>
      </footer>
    </div>
  )
}
