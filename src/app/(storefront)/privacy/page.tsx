export default function PrivacyPage() {
  return (
    <div className="px-6 py-10 bg-[#F8B4C4] min-h-screen">
      <h1 className="text-[11px] uppercase tracking-[0.08em] text-[#1a1a1a]/60 mb-4">Privacy Policy</h1>
      <p className="text-[13px] text-[#1a1a1a]/50 mb-16">Last updated: February 2026</p>

      <div className="grid md:grid-cols-2 gap-12 md:gap-24">
        <div className="space-y-12">
          <section>
            <h2 className="text-[11px] uppercase tracking-[0.08em] text-[#1a1a1a]/60 mb-4">Information We Collect</h2>
            <p className="text-[15px] leading-[1.8] text-[#1a1a1a]/80">
              When you place an order with Press & Co, we collect information necessary to 
              fulfill your order, including your name, email address, shipping address, and 
              payment information. Payment processing is handled securely by Shopify and we 
              do not store your payment card details.
            </p>
          </section>

          <section>
            <h2 className="text-[11px] uppercase tracking-[0.08em] text-[#1a1a1a]/60 mb-4">How We Use Your Information</h2>
            <p className="text-[15px] leading-[1.8] text-[#1a1a1a]/80 mb-4">We use your information to:</p>
            <ul className="text-[14px] leading-[1.8] text-[#1a1a1a]/70 space-y-1">
              <li>— Process and fulfill your orders</li>
              <li>— Send order confirmations and shipping updates</li>
              <li>— Respond to your inquiries and provide customer support</li>
              <li>— Send marketing communications (only if you've opted in)</li>
              <li>— Improve our products and services</li>
            </ul>
          </section>

          <section>
            <h2 className="text-[11px] uppercase tracking-[0.08em] text-[#1a1a1a]/60 mb-4">Information Sharing</h2>
            <p className="text-[15px] leading-[1.8] text-[#1a1a1a]/80 mb-4">
              We do not sell your personal information. We may share your information with 
              third-party service providers who assist us in operating our business:
            </p>
            <ul className="text-[14px] leading-[1.8] text-[#1a1a1a]/70 space-y-1">
              <li>— Shopify (e-commerce platform)</li>
              <li>— Shipping carriers (to deliver your orders)</li>
              <li>— Email service providers (for order notifications)</li>
            </ul>
          </section>
        </div>

        <div className="space-y-12">
          <section>
            <h2 className="text-[11px] uppercase tracking-[0.08em] text-[#1a1a1a]/60 mb-4">Cookies</h2>
            <p className="text-[15px] leading-[1.8] text-[#1a1a1a]/80">
              Our website uses cookies to enhance your browsing experience and analyze site 
              traffic. You can control cookie settings through your browser preferences.
            </p>
          </section>

          <section>
            <h2 className="text-[11px] uppercase tracking-[0.08em] text-[#1a1a1a]/60 mb-4">Data Retention</h2>
            <p className="text-[15px] leading-[1.8] text-[#1a1a1a]/80">
              We retain your order information for as long as necessary to fulfill legal and 
              business obligations. You may request deletion of your personal data by 
              contacting us.
            </p>
          </section>

          <section>
            <h2 className="text-[11px] uppercase tracking-[0.08em] text-[#1a1a1a]/60 mb-4">Your Rights</h2>
            <p className="text-[15px] leading-[1.8] text-[#1a1a1a]/80">
              Depending on your location, you may have rights regarding your personal data, 
              including the right to access, correct, or delete your information. To exercise 
              these rights, please contact us at hello@pressandco.com.
            </p>
          </section>

          <section>
            <h2 className="text-[11px] uppercase tracking-[0.08em] text-[#1a1a1a]/60 mb-4">Contact</h2>
            <p className="text-[15px] leading-[1.8] text-[#1a1a1a]/80">
              If you have questions about this privacy policy or our data practices, please 
              contact us at{' '}
              <a href="mailto:hello@pressandco.com" className="underline">hello@pressandco.com</a>
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}
