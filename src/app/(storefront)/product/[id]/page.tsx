import Link from 'next/link'

// Mock product data
const products: Record<string, {
  id: number
  title: string
  price: number
  color: string
  textStyle: string
  cardText: string
  tags: string[]
  description: string
  typefaces: string[]
  paperOptions: { name: string; price: number }[]
  quantities: { qty: number; price: number }[]
}> = {
  '1': {
    id: 1,
    title: 'The Classicist',
    price: 90,
    color: 'bg-[#F5F0E8]',
    textStyle: 'font-serif text-[#2A2A2A] text-[14px]',
    cardText: 'John Smith\nCreative Director',
    tags: ['CLASSIC', 'LETTERPRESS'],
    description: 'A timeless design that speaks to tradition and quality. Centered text in a classic serif typeface, deeply impressed into luxurious cotton paper.',
    typefaces: ['Garamond', 'Baskerville', 'Caslon'],
    paperOptions: [
      { name: 'Cotton 300gsm', price: 0 },
      { name: 'Cotton 600gsm', price: 20 },
      { name: 'Cotton 900gsm (Duplex)', price: 45 },
    ],
    quantities: [
      { qty: 50, price: 90 },
      { qty: 100, price: 140 },
      { qty: 250, price: 280 },
      { qty: 500, price: 480 },
    ],
  },
  '2': {
    id: 2,
    title: 'The Modernist',
    price: 95,
    color: 'bg-[#FFFFFF] border border-[#E5E5E5]',
    textStyle: 'font-sans text-[#1a1a1a] text-[12px] tracking-widest uppercase',
    cardText: 'JANE DOE\nARCHITECT',
    tags: ['MODERN', 'MINIMAL'],
    description: 'Clean lines and generous white space. A contemporary design for those who appreciate restraint and precision.',
    typefaces: ['Helvetica Neue', 'Futura', 'Avenir'],
    paperOptions: [
      { name: 'Cotton 300gsm', price: 0 },
      { name: 'Cotton 600gsm', price: 20 },
      { name: 'Cotton 900gsm (Duplex)', price: 45 },
    ],
    quantities: [
      { qty: 50, price: 95 },
      { qty: 100, price: 150 },
      { qty: 250, price: 300 },
      { qty: 500, price: 520 },
    ],
  },
  '3': {
    id: 3,
    title: 'The Artisan',
    price: 110,
    color: 'bg-[#F8F5F0]',
    textStyle: 'font-serif italic text-[#1A365D] text-[14px]',
    cardText: 'Emma Rose\nFloral Design',
    tags: ['ARTISAN', 'TWO-COLOR'],
    description: 'Two-color letterpress printing for added depth and character. Perfect for creative professionals who want their cards to stand out.',
    typefaces: ['Bodoni', 'Didot', 'Playfair Display'],
    paperOptions: [
      { name: 'Cotton 300gsm', price: 0 },
      { name: 'Cotton 600gsm', price: 20 },
      { name: 'Cotton 900gsm (Duplex)', price: 45 },
    ],
    quantities: [
      { qty: 50, price: 110 },
      { qty: 100, price: 175 },
      { qty: 250, price: 350 },
      { qty: 500, price: 600 },
    ],
  },
  '4': {
    id: 4,
    title: 'The Minimalist',
    price: 85,
    color: 'bg-[#FAFAFA]',
    textStyle: 'font-sans text-[#333] text-[11px] tracking-wider',
    cardText: 'M. CHEN\nSTUDIO',
    tags: ['MINIMAL', 'CLEAN'],
    description: 'Stripped back to the essentials. A design that lets the quality of the paper and print speak for itself.',
    typefaces: ['Inter', 'SF Pro', 'Roboto'],
    paperOptions: [
      { name: 'Cotton 300gsm', price: 0 },
      { name: 'Cotton 600gsm', price: 20 },
      { name: 'Cotton 900gsm (Duplex)', price: 45 },
    ],
    quantities: [
      { qty: 50, price: 85 },
      { qty: 100, price: 135 },
      { qty: 250, price: 270 },
      { qty: 500, price: 460 },
    ],
  },
}

// Default product for unknown IDs
const defaultProduct = products['1']

export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const product = products[id] || defaultProduct

  return (
    <div className="max-w-[1400px] mx-auto px-6 py-10">
      <div className="grid md:grid-cols-2 gap-10 md:gap-16">
        {/* Product Image */}
        <div>
          <div className={`${product.color} aspect-[3/4] flex items-center justify-center p-12`}>
            <span className={`whitespace-pre-line text-center leading-relaxed ${product.textStyle}`}>
              {product.cardText}
            </span>
          </div>
          <div className="grid grid-cols-4 gap-2 mt-2">
            <div className={`${product.color} aspect-square flex items-center justify-center`}>
              <span className="text-[8px] text-[#999]">Front</span>
            </div>
            <div className="bg-[#F5F5F5] aspect-square flex items-center justify-center">
              <span className="text-[8px] text-[#999]">Back</span>
            </div>
            <div className="bg-[#E8E4DC] aspect-square flex items-center justify-center">
              <span className="text-[8px] text-[#999]">Detail</span>
            </div>
            <div className="bg-[#D8E4E8] aspect-square flex items-center justify-center">
              <span className="text-[8px] text-[#999]">Edge</span>
            </div>
          </div>
        </div>

        {/* Product Details */}
        <div>
          <div className="flex flex-wrap gap-1.5 mb-4">
            {product.tags.map((tag) => (
              <span key={tag} className="text-[10px] text-[#1a1a1a] uppercase tracking-[0.03em] border border-[#ccc] px-2 py-0.5">
                {tag}
              </span>
            ))}
          </div>
          
          <h1 className="text-[13px] tracking-[0.01em] text-[#1a1a1a] uppercase">{product.title}</h1>
          <p className="text-[13px] text-[#1a1a1a] mt-1">From A${product.price}.00</p>
          
          <p className="text-[14px] text-[#666] mt-6 leading-[1.7]">
            {product.description}
          </p>

          {/* Typeface Selection */}
          <div className="mt-8">
            <p className="text-[11px] uppercase tracking-[0.1em] text-[#999] mb-3">Typeface</p>
            <div className="flex flex-wrap gap-2">
              {product.typefaces.map((typeface, i) => (
                <button
                  key={typeface}
                  className={`text-[12px] px-4 py-2 border ${i === 0 ? 'border-[#1a1a1a] bg-[#1a1a1a] text-white' : 'border-[#E5E5E5]'}`}
                >
                  {typeface}
                </button>
              ))}
            </div>
          </div>

          {/* Quantity Selection */}
          <div className="mt-8">
            <p className="text-[11px] uppercase tracking-[0.1em] text-[#999] mb-3">Quantity</p>
            <div className="flex flex-wrap gap-2">
              {product.quantities.map((q, i) => (
                <button
                  key={q.qty}
                  className={`text-[12px] px-4 py-2 border ${i === 0 ? 'border-[#1a1a1a] bg-[#1a1a1a] text-white' : 'border-[#E5E5E5]'}`}
                >
                  {q.qty} — A${q.price}
                </button>
              ))}
            </div>
          </div>

          {/* Paper Selection */}
          <div className="mt-8">
            <p className="text-[11px] uppercase tracking-[0.1em] text-[#999] mb-3">Paper</p>
            <div className="space-y-2">
              {product.paperOptions.map((paper, i) => (
                <label key={paper.name} className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="radio"
                    name="paper"
                    defaultChecked={i === 0}
                    className="w-4 h-4 accent-[#1a1a1a]"
                  />
                  <span className="text-[13px]">
                    {paper.name}
                    {paper.price > 0 && <span className="text-[#999] ml-2">+A${paper.price}</span>}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* PDF Proof */}
          <div className="mt-8 pt-6 border-t border-[#E5E5E5]">
            <label className="flex items-start gap-3 cursor-pointer">
              <input type="checkbox" className="w-4 h-4 mt-0.5 accent-[#1a1a1a]" />
              <div>
                <span className="text-[13px]">Add PDF proof — A$15</span>
                <p className="text-[12px] text-[#999] mt-1">Review a digital proof before we print</p>
              </div>
            </label>
          </div>

          {/* Add to Cart */}
          <button className="w-full bg-[#1a1a1a] text-white py-4 mt-8 text-[12px] uppercase tracking-[0.1em]">
            Add to Cart — A${product.price}
          </button>

          {/* Shipping Info */}
          <div className="mt-8 pt-6 border-t border-[#E5E5E5] text-[12px] text-[#999] space-y-2">
            <p>Free shipping on orders over A$150</p>
            <p>Printed and shipped within 5-7 business days</p>
          </div>
        </div>
      </div>

      {/* Product Details Accordion */}
      <div className="mt-16 pt-10 border-t border-[#E5E5E5]">
        <div className="grid md:grid-cols-3 gap-10">
          <div>
            <h3 className="text-[11px] uppercase tracking-[0.1em] text-[#999] mb-4">Specifications</h3>
            <div className="text-[13px] text-[#666] space-y-2">
              <p>Standard size: 89 × 51mm</p>
              <p>Printing: Letterpress, 1 or 2 colors</p>
              <p>Paper: 100% cotton, various weights</p>
              <p>Edge: Clean cut or painted</p>
            </div>
          </div>
          <div>
            <h3 className="text-[11px] uppercase tracking-[0.1em] text-[#999] mb-4">Customisation</h3>
            <div className="text-[13px] text-[#666] space-y-2">
              <p>Your name and details</p>
              <p>Choice of typeface</p>
              <p>Ink color selection</p>
              <p>Optional: logo or custom artwork</p>
            </div>
          </div>
          <div>
            <h3 className="text-[11px] uppercase tracking-[0.1em] text-[#999] mb-4">Reorders</h3>
            <div className="text-[13px] text-[#666] space-y-2">
              <p>We keep your plate on file</p>
              <p>20% off all reorders</p>
              <p>Same quality, faster turnaround</p>
            </div>
          </div>
        </div>
      </div>

      {/* Related Products */}
      <div className="mt-16 pt-10 border-t border-[#E5E5E5]">
        <h2 className="text-[13px] text-[#1a1a1a] tracking-[0.02em] mb-6">You may also like</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-5">
          {Object.values(products).filter(p => p.id !== product.id).slice(0, 4).map(p => (
            <Link key={p.id} href={`/product/${p.id}`} className="group block">
              <div className={`${p.color} aspect-[3/4] mb-3 flex items-center justify-center p-8`}>
                <span className={`whitespace-pre-line text-center leading-relaxed ${p.textStyle}`}>
                  {p.cardText}
                </span>
              </div>
              <h3 className="text-[13px] tracking-[0.01em] text-[#1a1a1a] uppercase mt-2">{p.title}</h3>
              <p className="text-[13px] text-[#1a1a1a]">A${p.price}.00</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
