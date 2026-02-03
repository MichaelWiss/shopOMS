import { Playfair_Display } from 'next/font/google'

const playfair = Playfair_Display({ 
  subsets: ['latin'],
  weight: ['400', '500'],
})

export default function ContactPage() {
  return (
    <div className="px-6 py-10 bg-[#F8B4C4] min-h-screen">
      {/* Hero Text */}
      <div className="mb-16">
        <p className={`${playfair.className} text-[28px] md:text-[36px] lg:text-[42px] leading-[1.3] max-w-[800px]`}>
          We'd love to hear from you. Whether you have a question about our products, 
          want to discuss a custom project, or just want to say hello.
        </p>
      </div>

      {/* Two Column Layout */}
      <div className="grid md:grid-cols-2 gap-12 md:gap-24">
        {/* Contact Form */}
        <div>
          <form className="space-y-6">
            <div>
              <label className="block text-[11px] uppercase tracking-[0.08em] text-[#1a1a1a]/60 mb-2">
                Full Name*
              </label>
              <input 
                type="text" 
                className="w-full px-0 py-3 bg-transparent border-b border-[#1a1a1a]/30 text-[15px] outline-none focus:border-[#1a1a1a] transition-colors"
              />
            </div>

            <div>
              <label className="block text-[11px] uppercase tracking-[0.08em] text-[#1a1a1a]/60 mb-2">
                Email*
              </label>
              <input 
                type="email" 
                className="w-full px-0 py-3 bg-transparent border-b border-[#1a1a1a]/30 text-[15px] outline-none focus:border-[#1a1a1a] transition-colors"
              />
            </div>

            <div>
              <label className="block text-[11px] uppercase tracking-[0.08em] text-[#1a1a1a]/60 mb-2">
                Company
              </label>
              <input 
                type="text" 
                className="w-full px-0 py-3 bg-transparent border-b border-[#1a1a1a]/30 text-[15px] outline-none focus:border-[#1a1a1a] transition-colors"
              />
            </div>

            <div>
              <label className="block text-[11px] uppercase tracking-[0.08em] text-[#1a1a1a]/60 mb-2">
                Phone
              </label>
              <input 
                type="tel" 
                className="w-full px-0 py-3 bg-transparent border-b border-[#1a1a1a]/30 text-[15px] outline-none focus:border-[#1a1a1a] transition-colors"
              />
            </div>

            <div>
              <label className="block text-[11px] uppercase tracking-[0.08em] text-[#1a1a1a]/60 mb-2">
                Your Message*
              </label>
              <textarea 
                rows={4}
                className="w-full px-0 py-3 bg-transparent border-b border-[#1a1a1a]/30 text-[15px] outline-none focus:border-[#1a1a1a] transition-colors resize-none"
              />
            </div>

            <button 
              type="submit"
              className="px-6 py-3 bg-[#1a1a1a] text-white text-[11px] uppercase tracking-[0.06em]"
            >
              Send
            </button>
          </form>
        </div>

        {/* Contact Info */}
        <div className="space-y-8">
          <div>
            <h3 className="text-[11px] uppercase tracking-[0.08em] text-[#1a1a1a]/60 mb-2">Email</h3>
            <a href="mailto:hello@pressandco.com" className="text-[15px] hover:underline">
              hello@pressandco.com
            </a>
          </div>

          <div>
            <h3 className="text-[11px] uppercase tracking-[0.08em] text-[#1a1a1a]/60 mb-2">Phone</h3>
            <a href="tel:+61400000000" className="text-[15px]">
              (+61) 400 000 000
            </a>
          </div>

          <div>
            <h3 className="text-[11px] uppercase tracking-[0.08em] text-[#1a1a1a]/60 mb-2">Instagram</h3>
            <a 
              href="https://instagram.com/pressandco" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-[15px] hover:underline"
            >
              @pressandco
            </a>
          </div>

          <div>
            <h3 className="text-[11px] uppercase tracking-[0.08em] text-[#1a1a1a]/60 mb-2">Studio</h3>
            <p className="text-[15px]">
              Melbourne, Australia<br />
              <span className="text-[#1a1a1a]/60">By appointment only</span>
            </p>
          </div>

          <div className="pt-8">
            <p className="text-[14px] text-[#1a1a1a]/70">
              We typically respond to inquiries within 1-2 business days.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
