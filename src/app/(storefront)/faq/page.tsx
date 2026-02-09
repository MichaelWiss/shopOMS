'use client'

import { useState } from 'react'
import { playfair } from '@/lib/fonts'
import { Plus, Minus } from 'lucide-react'

const faqs = [
  {
    question: 'What is letterpress printing?',
    answer: 'Letterpress is a traditional printing technique where inked raised surfaces are pressed into paper, creating a distinctive debossed impression. It produces a tactile, dimensional quality that cannot be replicated by digital printing.'
  },
  {
    question: 'What paper do you use?',
    answer: 'We use 600gsm cotton paper as our standard stock. Cotton paper is prized for its soft feel, durability, and ability to hold a deep letterpress impression. We also offer other premium paper options for custom projects.'
  },
  {
    question: 'How long does production take?',
    answer: 'Standard orders are typically completed within 10-14 business days from artwork approval. Rush orders may be available for an additional fee—please contact us to discuss your timeline.'
  },
  {
    question: 'Can I see samples before ordering?',
    answer: 'Yes! We offer sample packs that include examples of our designs on our standard paper stock. Sample pack costs are credited toward your first order.'
  },
  {
    question: 'Do you ship internationally?',
    answer: 'Yes, we ship worldwide. Shipping costs and delivery times vary by destination. All orders are carefully packaged to ensure your cards arrive in perfect condition.'
  },
  {
    question: 'Can I customize the designs?',
    answer: 'Absolutely. All of our standard designs can be personalized with your information. For completely custom designs or special finishes, please visit our Custom Work page or contact us directly.'
  },
  {
    question: 'What file formats do you accept?',
    answer: 'For custom projects, we prefer vector files (AI, EPS, PDF) with fonts outlined. We can also work with high-resolution raster images (300dpi minimum). Our team will review your files and advise on any adjustments needed.'
  },
  {
    question: 'How many colors can be printed?',
    answer: 'Letterpress printing is done one color at a time. We can print multiple colors, though each additional color requires a separate press run, which affects pricing and production time.'
  },
  {
    question: 'What is your minimum order quantity?',
    answer: 'Our minimum order is 100 cards. For larger quantities (500+), we offer volume discounts. Contact us for custom pricing on orders over 1,000 cards.'
  },
  {
    question: 'Do you offer reprints?',
    answer: 'Yes. If you need additional cards of a design we\'ve previously printed for you, simply contact us. We keep your artwork on file for easy reprinting.'
  },
]

function FAQItem({ question, answer }: { question: string; answer: string }) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="border-b border-[#1a1a1a]/20">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full py-6 flex items-center justify-between text-left"
      >
        <span className="text-[15px] md:text-[16px] pr-8">{question}</span>
        {isOpen ? (
          <Minus className="h-5 w-5 flex-shrink-0" strokeWidth={1.5} />
        ) : (
          <Plus className="h-5 w-5 flex-shrink-0" strokeWidth={1.5} />
        )}
      </button>
      {isOpen && (
        <div className="pb-6">
          <p className="text-[14px] leading-[1.7] text-[#1a1a1a]/70 max-w-[800px]">
            {answer}
          </p>
        </div>
      )}
    </div>
  )
}

export default function FAQPage() {
  return (
    <div className="px-6 py-10 bg-[#F8B4C4] min-h-screen">
      {/* Header */}
      <h1 className="text-[11px] uppercase tracking-[0.08em] text-[#1a1a1a]/60 mb-16">FAQs</h1>
      
      {/* FAQ List */}
      <div className="mb-16">
        {faqs.map((faq, index) => (
          <FAQItem key={index} question={faq.question} answer={faq.answer} />
        ))}
      </div>

      {/* Contact CTA */}
      <div className="bg-[#D4A700] p-8 md:p-12">
        <p className={`${playfair.className} text-[22px] md:text-[28px] leading-[1.4] mb-6 max-w-[600px]`}>
          Still have questions? We're happy to help.
        </p>
        <a 
          href="mailto:hello@pressandco.com" 
          className="inline-block px-6 py-3 bg-[#1a1a1a] text-white text-[11px] uppercase tracking-[0.06em]"
        >
          Contact Us
        </a>
      </div>
    </div>
  )
}
