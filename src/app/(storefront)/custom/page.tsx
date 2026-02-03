import { Playfair_Display } from 'next/font/google'

const playfair = Playfair_Display({ 
  subsets: ['latin'],
  weight: ['400', '500'],
})

export default function CustomPage() {
  return (
    <div className="px-6 py-10 bg-[#F8B4C4] min-h-screen">
      {/* Hero Text */}
      <div className="mb-16">
        <p className={`${playfair.className} text-[28px] md:text-[36px] lg:text-[42px] leading-[1.3] max-w-[900px]`}>
          While our collection covers many styles, we understand that some projects require a 
          completely bespoke approach. Our custom service is designed for clients who want 
          something truly unique.
        </p>
      </div>

      {/* Two Column Content */}
      <div className="grid md:grid-cols-2 gap-12 md:gap-24 mb-16">
        <div>
          <h2 className="text-[11px] uppercase tracking-[0.08em] text-[#1a1a1a]/60 mb-4">CUSTOM DESIGN</h2>
          <p className="text-[15px] leading-[1.8] text-[#1a1a1a]/80 mb-6">
            Work with our design team to create a completely original card from scratch. 
            We'll guide you through typography, layout, and paper selection.
          </p>
          <ul className="text-[14px] leading-[1.8] text-[#1a1a1a]/70 space-y-1">
            <li>— Brand Consultation</li>
            <li>— Custom Typography</li>
            <li>— Layout Development</li>
            <li>— Paper & Ink Selection</li>
          </ul>
        </div>
        <div>
          <h2 className="text-[11px] uppercase tracking-[0.08em] text-[#1a1a1a]/60 mb-4">SPECIAL FINISHES</h2>
          <p className="text-[15px] leading-[1.8] text-[#1a1a1a]/80 mb-6">
            Edge painting, foil stamping, blind deboss, die-cutting—we can add special 
            finishes to elevate your cards further.
          </p>
          <ul className="text-[14px] leading-[1.8] text-[#1a1a1a]/70 space-y-1">
            <li>— Edge Painting</li>
            <li>— Foil Stamping</li>
            <li>— Blind Debossing</li>
            <li>— Die Cutting</li>
          </ul>
        </div>
      </div>

      {/* Image */}
      <div className="aspect-[21/9] bg-[#E8DCD0] flex items-center justify-center mb-16">
        <span className="text-[#9A8A7A] text-[12px]">Custom Work Image</span>
      </div>

      {/* More Services */}
      <div className="grid md:grid-cols-2 gap-12 md:gap-24 mb-16">
        <div>
          <h2 className="text-[11px] uppercase tracking-[0.08em] text-[#1a1a1a]/60 mb-4">LARGE ORDERS</h2>
          <p className="text-[15px] leading-[1.8] text-[#1a1a1a]/80">
            For orders over 1,000 cards, we offer volume pricing and dedicated project 
            management to ensure a smooth process.
          </p>
        </div>
        <div>
          <h2 className="text-[11px] uppercase tracking-[0.08em] text-[#1a1a1a]/60 mb-4">BEYOND BUSINESS CARDS</h2>
          <p className="text-[15px] leading-[1.8] text-[#1a1a1a]/80">
            Letterheads, notecards, invitations, and more. If it can be letterpress printed, 
            we can likely help.
          </p>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-[#D4A700] p-8 md:p-12">
        <p className={`${playfair.className} text-[22px] md:text-[28px] leading-[1.4] mb-6 max-w-[600px]`}>
          Interested in discussing how custom-written cards can enhance your brand's presence?
        </p>
        <a 
          href="mailto:hello@pressandco.com?subject=Custom Project Inquiry" 
          className="inline-block px-6 py-3 bg-[#1a1a1a] text-white text-[11px] uppercase tracking-[0.06em]"
        >
          Get in Touch
        </a>
      </div>
    </div>
  )
}
