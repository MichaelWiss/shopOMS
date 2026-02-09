import { playfair } from '@/lib/fonts'

export default function AboutPage() {
  return (
    <div className="px-6 py-10 bg-[#F8B4C4] min-h-screen">
      {/* Hero Text */}
      <div className="mb-16">
        <p className={`${playfair.className} text-[28px] md:text-[36px] lg:text-[42px] leading-[1.3] max-w-[900px]`}>
          Press & Co is a Melbourne-based letterpress studio dedicated to the art of printed communication. 
          We believe that in a digital age, the tactile experience of a beautifully crafted business card 
          creates lasting impressions.
        </p>
      </div>

      {/* Two Column Content */}
      <div className="grid md:grid-cols-2 gap-12 md:gap-24 mb-16">
        <div>
          <h2 className="text-[11px] uppercase tracking-[0.08em] text-[#1a1a1a]/60 mb-4">THE STUDIO</h2>
          <p className="text-[15px] leading-[1.8] text-[#1a1a1a]/80 mb-4">
            Our studio houses vintage Heidelberg presses, meticulously maintained and operated by skilled 
            craftspeople who understand the nuances of pressure, ink, and paper. Each card we produce 
            carries the authentic impression that only true letterpress can achieve.
          </p>
          <p className="text-[15px] leading-[1.8] text-[#1a1a1a]/80">
            We work exclusively with premium cotton papers, sourced for their texture, weight, and 
            ability to hold a deep impression. Our standard stock is a luxurious 600gsm cotton that 
            feels substantial without being ostentatious.
          </p>
        </div>
        <div>
          <h2 className="text-[11px] uppercase tracking-[0.08em] text-[#1a1a1a]/60 mb-4">THE PROCESS</h2>
          <p className="text-[15px] leading-[1.8] text-[#1a1a1a]/80 mb-4">
            Every order begins with a conversation. We take time to understand your brand, your audience, 
            and the impression you want to make. From there, our designers create a layout optimized for 
            letterpress printing.
          </p>
          <p className="text-[15px] leading-[1.8] text-[#1a1a1a]/80">
            Once approved, your cards are printed in small batches to ensure quality. Each sheet is 
            hand-fed into our presses, inspected, and trimmed to precise dimensions. The result is a 
            product that reflects both modern design sensibility and time-honored craft.
          </p>
        </div>
      </div>

      {/* Images */}
      <div className="grid md:grid-cols-2 gap-4 mb-16">
        <div className="aspect-[4/3] bg-[#E8DCD0] flex items-center justify-center">
          <span className="text-[#9A8A7A] text-[12px]">Studio Image</span>
        </div>
        <div className="aspect-[4/3] bg-[#D4C4B8] flex items-center justify-center">
          <span className="text-[#8A7A6A] text-[12px]">Press Image</span>
        </div>
      </div>

      {/* Quote Banner */}
      <div className="bg-[#D4A700] p-8 md:p-12 mb-16">
        <p className={`${playfair.className} text-[22px] md:text-[28px] leading-[1.4] max-w-[700px]`}>
          "The business card is often the first physical artifact someone receives from your brand. 
          Make it count."
        </p>
      </div>

      {/* Contact Form Section */}
      <div className="grid md:grid-cols-2 gap-12 md:gap-24">
        <div>
          <p className={`${playfair.className} text-[24px] md:text-[28px] leading-[1.3] mb-6`}>
            Interested in discussing how letterpress can elevate your brand's first impression?
          </p>
          <a 
            href="mailto:hello@pressandco.com" 
            className="inline-block px-6 py-3 bg-[#1a1a1a] text-white text-[11px] uppercase tracking-[0.06em]"
          >
            Get in Touch
          </a>
        </div>
        <div className="aspect-[4/3] bg-[#C8B8A8] flex items-center justify-center">
          <span className="text-[#8A7A6A] text-[12px]">Image</span>
        </div>
      </div>
    </div>
  )
}
