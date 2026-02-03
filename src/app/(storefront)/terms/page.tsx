export default function TermsPage() {
  return (
    <div className="px-6 py-10 bg-[#F8B4C4] min-h-screen">
      <h1 className="text-[11px] uppercase tracking-[0.08em] text-[#1a1a1a]/60 mb-4">Terms & Conditions</h1>
      <p className="text-[13px] text-[#1a1a1a]/50 mb-16">Last updated: February 2026</p>

      <div className="grid md:grid-cols-2 gap-12 md:gap-24">
        <div className="space-y-12">
          <section>
            <h2 className="text-[11px] uppercase tracking-[0.08em] text-[#1a1a1a]/60 mb-4">Orders & Payment</h2>
            <p className="text-[15px] leading-[1.8] text-[#1a1a1a]/80">
              All orders are subject to acceptance by Press & Co. We reserve the right to refuse 
              any order. Payment is required in full at the time of purchase. We accept all major 
              credit cards through our secure payment processor, Shopify Payments.
            </p>
          </section>

          <section>
            <h2 className="text-[11px] uppercase tracking-[0.08em] text-[#1a1a1a]/60 mb-4">Artwork Approval</h2>
            <p className="text-[15px] leading-[1.8] text-[#1a1a1a]/80">
              Before production begins, you will receive a digital proof for approval. Please review 
              carefully for spelling, layout, and details. Once approved, we cannot make changes or 
              accept returns for errors that were present in the approved proof.
            </p>
          </section>

          <section>
            <h2 className="text-[11px] uppercase tracking-[0.08em] text-[#1a1a1a]/60 mb-4">Production & Delivery</h2>
            <p className="text-[15px] leading-[1.8] text-[#1a1a1a]/80">
              Production times are estimates and begin after artwork approval. While we strive to 
              meet all delivery estimates, we cannot guarantee specific delivery dates due to the 
              handcrafted nature of our products.
            </p>
          </section>

          <section>
            <h2 className="text-[11px] uppercase tracking-[0.08em] text-[#1a1a1a]/60 mb-4">Returns & Refunds</h2>
            <p className="text-[15px] leading-[1.8] text-[#1a1a1a]/80">
              Due to the custom nature of our products, we do not accept returns or offer refunds 
              unless the product is defective or damaged during shipping. If you receive a damaged 
              order, please contact us within 7 days of delivery with photos of the damage.
            </p>
          </section>
        </div>

        <div className="space-y-12">
          <section>
            <h2 className="text-[11px] uppercase tracking-[0.08em] text-[#1a1a1a]/60 mb-4">Intellectual Property</h2>
            <p className="text-[15px] leading-[1.8] text-[#1a1a1a]/80">
              You retain ownership of any original artwork you provide. By submitting artwork, you 
              confirm that you have the right to use all elements included. Press & Co retains 
              ownership of our templates and design assets.
            </p>
          </section>

          <section>
            <h2 className="text-[11px] uppercase tracking-[0.08em] text-[#1a1a1a]/60 mb-4">Color Accuracy</h2>
            <p className="text-[15px] leading-[1.8] text-[#1a1a1a]/80">
              Due to variations in screens, printers, and paper stock, colors may appear slightly 
              different from digital proofs. Letterpress printing creates natural variation in ink 
              coverage, which is part of the craft's character.
            </p>
          </section>

          <section>
            <h2 className="text-[11px] uppercase tracking-[0.08em] text-[#1a1a1a]/60 mb-4">Limitation of Liability</h2>
            <p className="text-[15px] leading-[1.8] text-[#1a1a1a]/80">
              Press & Co's liability is limited to the purchase price of the product. We are not 
              liable for any indirect, incidental, or consequential damages arising from the use 
              of our products.
            </p>
          </section>

          <section>
            <h2 className="text-[11px] uppercase tracking-[0.08em] text-[#1a1a1a]/60 mb-4">Contact</h2>
            <p className="text-[15px] leading-[1.8] text-[#1a1a1a]/80">
              For questions about these terms, please contact us at{' '}
              <a href="mailto:hello@pressandco.com" className="underline">hello@pressandco.com</a>
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}
