import Link from 'next/link'

// Demo product data
const valentinesProducts = [
  { id: 1, title: 'REAL LOVE BABY', price: 8, tags: ['LOVE', 'LETTERPRESS', 'FRIENDSHIP'], color: 'bg-[#F5EDE8]', cardText: 'Real\nLove\nBaby', textStyle: 'font-serif italic text-[#8B5A4A] text-[22px] leading-[1.15] text-left', position: 'items-start justify-start' },
  { id: 2, title: 'AND THEN, I MET YOU', price: 8, tags: ['LOVE', 'FRIENDSHIP', "VALENTINE'S DAY"], color: 'bg-[#A8C8A8]', cardText: 'You and me', textStyle: 'font-serif italic text-[#3A5A3A] text-[14px]', position: 'items-center justify-center' },
  { id: 3, title: 'YOU AND ME', price: 8, tags: ['LOVE', 'FRIENDSHIP', "VALENTINE'S DAY"], color: 'bg-[#F0C4B0]', cardText: 'Smitten', textStyle: 'font-serif italic text-[#1a1a1a] text-[18px]', position: 'items-end justify-end pr-4 pb-4' },
  { id: 4, title: 'SMITTEN', price: 8, tags: ['LOVE', 'FRIENDSHIP', "VALENTINE'S DAY"], color: 'bg-[#F8E8D8]', cardText: 'Smitten', textStyle: 'font-serif italic text-[#6B5040] text-[18px]', position: 'items-center justify-center' },
]

const allProducts = [
  { id: 5, title: 'TRULY MADLY DEEPLY', price: 8, tags: ['LOVE', 'LETTERPRESS', 'WEDDING'], color: 'bg-[#C8C0B8]', cardText: 'truly\nmadly\ndeeply', textStyle: 'font-mono text-[#5A5A5A] text-[9px] leading-[1.6] uppercase tracking-[0.1em]', position: 'items-start justify-start' },
  { id: 6, title: 'SOULMATES', price: 8, tags: ['LOVE', 'FRIENDSHIP', 'LETTERPRESS'], color: 'bg-[#F8F4EC]', cardText: 'soul\nmates', textStyle: 'font-serif italic text-[#2A2A2A] text-[26px] leading-[0.95]', position: 'items-center justify-center' },
  { id: 7, title: 'I CHOOSE YOU', price: 8, tags: ['LOVE', 'WEDDING'], color: 'bg-[#CC3333]', cardText: '', textStyle: '', position: 'items-center justify-center' },
  { id: 8, title: 'SWOON', price: 8, tags: ['LOVE', "VALENTINE'S DAY", 'ENGAGEMENT'], color: 'bg-[#F8E8E8]', cardText: 'Swoon', textStyle: 'font-serif italic text-[#D4A020] text-[24px]', position: 'items-center justify-center' },
  { id: 9, title: 'THANKFUL', price: 8, tags: ['FRIENDSHIP', 'THANKS'], color: 'bg-[#B8B0A8]', cardText: 'Thankful', textStyle: 'font-serif italic text-[#4A3A2A] text-[18px]', position: 'items-center justify-center' },
  { id: 10, title: 'YAY', price: 8, tags: ['HAPPY', 'CONGRATULATIONS', 'NEW BEGINNINGS'], color: 'bg-[#C8E830]', cardText: 'YAY', textStyle: 'font-serif text-[#1a1a1a] text-[32px]', position: 'items-end justify-start pl-4 pb-4' },
  { id: 11, title: "YOU'RE A GEM", price: 8, tags: ['LOVE', 'FRIENDSHIP', 'BRIGHT'], color: 'bg-[#C8C0B0]', cardText: "YOU'RE A\n\nGEM", textStyle: 'text-[#8080C0] text-[20px] uppercase tracking-[0.05em] leading-[2.5]', position: 'items-center justify-center' },
  { id: 12, title: 'MY PERSON', price: 8, tags: ['LETTERPRESS', 'LOVE', 'BRIGHT'], color: 'bg-[#F8E8A0]', cardText: 'My Person', textStyle: 'font-serif italic text-[#E07020] text-[16px]', position: 'items-start justify-center pt-6' },
]

const packs = [
  { id: 'p1', title: 'LOVE PACK (6 CARDS)', price: 39, originalPrice: 48, tags: ['LOVE', "VALENTINE'S DAY", 'ENGAGEMENT'], color: 'bg-[#3A6868]', textStyle: 'text-[#C8A040] text-[24px] tracking-[0.05em] leading-[1.2]', cardText: 'YES\nYOU\nTWO', display: 'YES\nYOU\nTWO', position: 'items-center justify-center' },
  { id: 'p2', title: 'THANK YOU PACK (6 CARDS)', price: 39, originalPrice: 48, tags: ['MISC', 'THANKS'], color: 'bg-[#C8B890]', textStyle: 'font-serif italic text-[#3A2A1A] text-[22px]', cardText: 'Thankful', display: 'Thankful', position: 'items-center justify-center' },
  { id: 'p3', title: 'MIXED MOMENTS (6 CARDS)', price: 45, originalPrice: 54, tags: ['MISC', 'CELEBRATION'], color: 'bg-[#708068]', textStyle: 'font-serif italic text-[#2A2A1A] text-[22px]', cardText: 'Thankful', display: 'Thankful', position: 'items-center justify-center' },
]

function ProductCard({ 
  product, 
  size = 'normal' 
}: { 
  product: {
    id: number | string
    title: string
    price: number
    tags: string[]
    color: string
    textStyle: string
    cardText?: string
    originalPrice?: number
    display?: string
    position?: string
  }
  size?: 'normal' | 'pack'
}) {
  const isPack = 'display' in product && product.display
  const cardText = product.cardText || product.title
  const position = product.position || 'items-center justify-center'

  return (
    <Link href={`/demo/product/${product.id}`} className="group block">
      <div className={`
        ${product.color} 
        ${size === 'pack' ? 'aspect-[1/1.1]' : 'aspect-[3/4]'} 
        mb-2 flex ${position} overflow-hidden p-6
      `}>
        <span className={`whitespace-pre-line ${product.textStyle || ''}`}>
          {cardText}
        </span>
      </div>
      <h3 className="text-[13px] tracking-[0.01em] text-[#1a1a1a] uppercase mt-2">{product.title}</h3>
      <p className="text-[13px] text-[#1a1a1a]">
        A${product.price}.00
      </p>
      <div className="flex flex-wrap gap-1.5 mt-2">
        {product.tags.slice(0, 3).map((tag) => (
          <span key={tag} className="text-[10px] text-[#1a1a1a] uppercase tracking-[0.03em] border border-[#ccc] px-2 py-0.5">
            {tag}
          </span>
        ))}
        {product.tags.length > 3 && (
          <span className="text-[10px] text-[#1a1a1a] border border-[#ccc] px-2 py-0.5">...</span>
        )}
      </div>
    </Link>
  )
}

export default function DemoStorePage() {
  return (
    <div>
      {/* Valentine's Day Section */}
      <section className="max-w-[1400px] mx-auto px-6 pt-6 pb-10">
        <div className="flex justify-between items-baseline mb-4">
          <h2 className="text-[13px] text-[#1a1a1a] tracking-[0.02em]">Valentine's Day</h2>
          <div className="flex items-center gap-6 text-[12px]">
            <span className="text-[#999]">74 days to go</span>
            <Link href="#" className="text-[#1a1a1a]">See All</Link>
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-5">
          {valentinesProducts.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* Lifestyle Images - Full Width */}
      <section className="max-w-[1400px] mx-auto px-6 py-6">
        <div className="grid md:grid-cols-2 gap-4">
          <div className="aspect-[4/5] bg-[#E8DCD0] flex items-center justify-center">
            <span className="text-[#9A8A7A] text-[12px] italic">Lifestyle Image</span>
          </div>
          <div className="aspect-[4/5] bg-[#D8E4E8] flex items-center justify-center">
            <span className="text-[#6A8090] text-[12px] italic">Lifestyle Image</span>
          </div>
        </div>
      </section>

      {/* All Products Grid */}
      <section className="max-w-[1400px] mx-auto px-6 py-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-5">
          {allProducts.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* Packs Section */}
      <section className="max-w-[1400px] mx-auto px-6 py-10">
        <div className="flex justify-between items-baseline mb-4">
          <h2 className="text-[13px] text-[#1a1a1a] tracking-[0.02em]">Packs</h2>
          <Link href="#" className="text-[12px] text-[#1a1a1a]">See all</Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-5">
          {packs.map(pack => (
            <ProductCard key={pack.id} product={pack} size="pack" />
          ))}
        </div>
      </section>

      {/* Feature Banner */}
      <section className="max-w-[1400px] mx-auto px-6 py-8">
        <div className="bg-[#D4A700] p-8 md:p-12 relative overflow-hidden">
          <span className="text-[10px] uppercase tracking-[0.08em] text-[#1a1a1a]/60">Photo: Thanks</span>
          <h3 className="text-[22px] md:text-[28px] mt-2 max-w-[480px] leading-[1.35] tracking-[-0.01em]">
            Cards for the moments that matter
          </h3>
        </div>
      </section>
    </div>
  )
}
