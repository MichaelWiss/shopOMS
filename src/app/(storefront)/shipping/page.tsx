export default function ShippingPage() {
  return (
    <div className="px-6 py-10 bg-[#F8B4C4] min-h-screen">
      <h1 className="text-[11px] uppercase tracking-[0.08em] text-[#1a1a1a]/60 mb-16">Shipping</h1>

      <div className="grid md:grid-cols-2 gap-12 md:gap-24">
        <div className="space-y-12">
          <section>
            <h2 className="text-[11px] uppercase tracking-[0.08em] text-[#1a1a1a]/60 mb-4">Australia</h2>
            <p className="text-[15px] leading-[1.8] text-[#1a1a1a]/80 mb-4">
              Standard shipping within Australia is $9.95 flat rate, or free for orders over $150.
              Delivery typically takes 3-5 business days.
            </p>
            <p className="text-[15px] leading-[1.8] text-[#1a1a1a]/80">
              Express shipping is available for $14.95 with delivery in 1-2 business days to metro areas.
            </p>
          </section>

          <section>
            <h2 className="text-[11px] uppercase tracking-[0.08em] text-[#1a1a1a]/60 mb-4">International</h2>
            <p className="text-[15px] leading-[1.8] text-[#1a1a1a]/80 mb-4">
              We ship worldwide. International shipping rates are calculated at checkout based on 
              destination and order weight.
            </p>
            <ul className="text-[14px] leading-[1.8] text-[#1a1a1a]/70 space-y-1">
              <li>— New Zealand: 5-7 business days</li>
              <li>— Asia Pacific: 7-10 business days</li>
              <li>— USA & Canada: 10-14 business days</li>
              <li>— Europe: 10-14 business days</li>
              <li>— Rest of World: 14-21 business days</li>
            </ul>
          </section>
        </div>

        <div className="space-y-12">
          <section>
            <h2 className="text-[11px] uppercase tracking-[0.08em] text-[#1a1a1a]/60 mb-4">Packaging</h2>
            <p className="text-[15px] leading-[1.8] text-[#1a1a1a]/80">
              All orders are carefully packaged in rigid mailers to protect your cards during transit. 
              Business cards are wrapped in tissue paper and placed in a custom Press & Co box.
            </p>
          </section>

          <section>
            <h2 className="text-[11px] uppercase tracking-[0.08em] text-[#1a1a1a]/60 mb-4">Tracking</h2>
            <p className="text-[15px] leading-[1.8] text-[#1a1a1a]/80">
              All orders include tracking. You'll receive an email with tracking details once your 
              order has been dispatched.
            </p>
          </section>

          <section>
            <h2 className="text-[11px] uppercase tracking-[0.08em] text-[#1a1a1a]/60 mb-4">Production Time</h2>
            <p className="text-[15px] leading-[1.8] text-[#1a1a1a]/80">
              Please note that shipping times are in addition to production time. Standard orders 
              are typically ready to ship within 10-14 business days from artwork approval.
            </p>
          </section>

          <section>
            <h2 className="text-[11px] uppercase tracking-[0.08em] text-[#1a1a1a]/60 mb-4">Questions?</h2>
            <p className="text-[15px] leading-[1.8] text-[#1a1a1a]/80">
              Contact us at{' '}
              <a href="mailto:hello@pressandco.com" className="underline">hello@pressandco.com</a>
              {' '}for any shipping inquiries.
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}
