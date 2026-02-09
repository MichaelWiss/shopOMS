/**
 * Centralized product data.
 * 
 * This is the single source of truth for all product information used
 * across the storefront. When Shopify integration is complete (Milestone 2),
 * these will be replaced with API calls to Shopify's Storefront API.
 */

export interface ProductCardData {
  id: number | string
  title: string
  price: number
  image: string
  color: string
  textStyle: string
  cardText: string
  tags: string[]
  sampleDescription?: string
}

export interface ProductDetail extends ProductCardData {
  description: string
  descriptionDetails: string
  typefaces: { name: string; link?: string }[]
  specifications: {
    size: string
    paper: string
    ink: string
    press: string
  }
  paperWeights: { name: string; price: number }[]
  quantities: { qty: number; price: number }[]
}

// --- Card products ---

export const featuredCards: ProductCardData[] = [
  { id: 1, title: 'The Classicist', price: 90, image: '/products/tp204-businesscard-04-ps.jpg', color: 'bg-[#F5F0E8]', textStyle: 'font-serif text-[#2A2A2A] text-[14px]', cardText: 'John Smith\nCreative Director', tags: ['CLASSIC', 'LETTERPRESS'] },
  { id: 2, title: 'The Modernist', price: 95, image: '/products/v900-sasi-businesscard-01.jpg', color: 'bg-[#FFFFFF] border border-[#E5E5E5]', textStyle: 'font-sans text-[#1a1a1a] text-[12px] tracking-widest uppercase', cardText: 'JANE DOE\nARCHITECT', tags: ['MODERN', 'MINIMAL'] },
  { id: 3, title: 'The Artisan', price: 110, image: '/products/10591621.jpg', color: 'bg-[#F8F5F0]', textStyle: 'font-serif italic text-[#1A365D] text-[14px]', cardText: 'Emma Rose\nFloral Design', tags: ['ARTISAN', 'TWO-COLOR'] },
  { id: 4, title: 'The Minimalist', price: 85, image: '/products/3285075.jpg', color: 'bg-[#FAFAFA]', textStyle: 'font-sans text-[#333] text-[11px] tracking-wider', cardText: 'M. CHEN\nSTUDIO', tags: ['MINIMAL', 'CLEAN'] },
]

export const allCards: ProductCardData[] = [
  { id: 5, title: 'The Correspondent', price: 75, image: '/products/tp204-businesscard-04-ps.jpg', color: 'bg-[#FFFEF8]', textStyle: 'font-serif italic text-[#1a1a1a] text-[16px]', cardText: 'William Hayes', tags: ['CALLING CARD', 'SCRIPT'] },
  { id: 6, title: 'The Bauhaus', price: 100, image: '/products/v900-sasi-businesscard-01.jpg', color: 'bg-[#F5F5F5]', textStyle: 'font-sans font-bold text-[#1a1a1a] text-[12px] uppercase tracking-widest', cardText: 'STUDIO\nBERLIN', tags: ['BAUHAUS', 'BOLD'] },
  { id: 7, title: 'The Editor', price: 90, image: '/products/10591621.jpg', color: 'bg-[#F0EDE8]', textStyle: 'font-serif text-[#3A3A3A] text-[13px]', cardText: 'Sarah James\nEditor', tags: ['CLASSIC', 'EDITORIAL'] },
  { id: 8, title: 'The Architect', price: 95, image: '/products/3285075.jpg', color: 'bg-[#FAFAFA] border border-[#E0E0E0]', textStyle: 'font-sans text-[#1a1a1a] text-[11px] tracking-[0.15em] uppercase', cardText: 'CHEN & CO\nARCHITECTURE', tags: ['MODERN', 'CORPORATE'] },
]

// --- Sample packs ---

export const samplePacks: ProductCardData[] = [
  { id: 'sample-1', title: 'Classic Sample Pack', price: 15, image: '/products/Stack-Letterpress-Business-Cards-Mockup.jpg', color: 'bg-[#E8E4DC]', textStyle: 'font-serif text-[#4A4A4A] text-[11px]', cardText: '6 Card\nSamples', tags: ['SAMPLES'], sampleDescription: 'A curated selection of our classic letterpress designs on premium cotton paper.' },
  { id: 'sample-2', title: 'Modern Sample Pack', price: 15, image: '/products/close-up-blank-business-cards-grey-background.jpg', color: 'bg-[#F0F0F0]', textStyle: 'font-sans text-[#333] text-[10px] uppercase tracking-wider', cardText: '6 CARD\nSAMPLES', tags: ['SAMPLES'], sampleDescription: 'Clean, contemporary designs featuring minimal typography and geometric elements.' },
  { id: 'sample-3', title: 'Complete Sample Set', price: 25, image: '/products/2838953.jpg', color: 'bg-[#F5F0E8]', textStyle: 'font-serif text-[#5A5A5A] text-[11px]', cardText: 'All 12\nDesigns', tags: ['SAMPLES', 'COMPLETE'], sampleDescription: 'Every design in our collection, perfect for those who want to see and feel all options.' },
]

// --- Full product detail data (used on PDP) ---

export const productDetails: Record<string, ProductDetail> = {
  '1': {
    id: 1, title: 'The Classicist', price: 90,
    image: '/products/tp204-businesscard-04-ps.jpg',
    color: 'bg-[#F5F0E8]', textStyle: 'font-serif text-[#2A2A2A] text-[14px]',
    cardText: 'John Smith\nCreative Director', tags: ['CLASSIC', 'LETTERPRESS'],
    description: 'The Classicist is set in the elegant Centaur, with contact information in Bell italics.',
    descriptionDetails: "The card's contemporary layout is tempered with traditional typefaces, lending the design a clean and well crafted look. Flexible enough for a variety of name lengths, this distinguished card looks its best with three lines of contact information.",
    typefaces: [
      { name: 'Centaur', link: 'https://en.wikipedia.org/wiki/Centaur_(typeface)' },
      { name: 'Bell', link: 'https://en.wikipedia.org/wiki/Bell_(typeface)' },
    ],
    specifications: { size: 'U.S. Standard size (2" x 3.5")', paper: 'Neenah Cotton, Pearl White 100% cotton paper', ink: 'Black ink', press: 'Hand printed on a 1945 Chandler & Price Letterpress' },
    paperWeights: [{ name: '110lb Cover (Standard)', price: 0 }, { name: '220lb Cover (Double Thick)', price: 20 }],
    quantities: [{ qty: 50, price: 90 }, { qty: 100, price: 140 }, { qty: 250, price: 280 }, { qty: 500, price: 480 }],
  },
  '2': {
    id: 2, title: 'The Modernist', price: 95,
    image: '/products/v900-sasi-businesscard-01.jpg',
    color: 'bg-[#FFFFFF] border border-[#E5E5E5]', textStyle: 'font-sans text-[#1a1a1a] text-[12px] tracking-widest uppercase',
    cardText: 'JANE DOE\nARCHITECT', tags: ['MODERN', 'MINIMAL'],
    description: 'The Modernist is set in clean Helvetica Neue, with generous white space throughout.',
    descriptionDetails: 'Clean lines and contemporary typography create a card that speaks to restraint and precision. Perfect for architects, designers, and those who appreciate minimalism.',
    typefaces: [{ name: 'Helvetica Neue' }, { name: 'Futura' }],
    specifications: { size: 'U.S. Standard size (2" x 3.5")', paper: 'Neenah Cotton, Bright White 100% cotton paper', ink: 'Black ink', press: 'Hand printed on a 1962 Heidelberg Windmill' },
    paperWeights: [{ name: '110lb Cover (Standard)', price: 0 }, { name: '220lb Cover (Double Thick)', price: 20 }],
    quantities: [{ qty: 50, price: 95 }, { qty: 100, price: 150 }, { qty: 250, price: 300 }, { qty: 500, price: 520 }],
  },
  '3': {
    id: 3, title: 'The Artisan', price: 110,
    image: '/products/10591621.jpg',
    color: 'bg-[#F8F5F0]', textStyle: 'font-serif italic text-[#1A365D] text-[14px]',
    cardText: 'Emma Rose\nFloral Design', tags: ['ARTISAN', 'TWO-COLOR'],
    description: 'The Artisan features two-color letterpress printing with Bodoni and script accents.',
    descriptionDetails: 'Two-color letterpress printing adds depth and character. Perfect for creative professionals—florists, artists, designers—who want their cards to make a lasting impression.',
    typefaces: [{ name: 'Bodoni', link: 'https://en.wikipedia.org/wiki/Bodoni' }, { name: 'Snell Roundhand' }],
    specifications: { size: 'U.S. Standard size (2" x 3.5")', paper: 'Neenah Cotton, Ivory 100% cotton paper', ink: 'Navy blue + Gold ink', press: 'Hand printed on a 1945 Chandler & Price Letterpress' },
    paperWeights: [{ name: '110lb Cover (Standard)', price: 0 }, { name: '220lb Cover (Double Thick)', price: 25 }],
    quantities: [{ qty: 50, price: 110 }, { qty: 100, price: 175 }, { qty: 250, price: 350 }, { qty: 500, price: 600 }],
  },
  '4': {
    id: 4, title: 'The Minimalist', price: 85,
    image: '/products/3285075.jpg',
    color: 'bg-[#FAFAFA]', textStyle: 'font-sans text-[#333] text-[11px] tracking-wider',
    cardText: 'M. CHEN\nSTUDIO', tags: ['MINIMAL', 'CLEAN'],
    description: 'The Minimalist is stripped back to the essentials, set in contemporary Inter.',
    descriptionDetails: 'A design that lets the quality of the paper and print speak for itself. The deep letterpress impression becomes the design element, creating texture you can see and feel.',
    typefaces: [{ name: 'Inter' }, { name: 'SF Pro' }],
    specifications: { size: 'U.S. Standard size (2" x 3.5")', paper: 'Neenah Cotton, Pearl White 100% cotton paper', ink: 'Grey ink', press: 'Hand printed on a 1955 Vandercook Proof Press' },
    paperWeights: [{ name: '110lb Cover (Standard)', price: 0 }, { name: '220lb Cover (Double Thick)', price: 20 }],
    quantities: [{ qty: 50, price: 85 }, { qty: 100, price: 135 }, { qty: 250, price: 270 }, { qty: 500, price: 460 }],
  },
  '5': {
    id: 5, title: 'The Correspondent', price: 75,
    image: '/products/tp204-businesscard-04-ps.jpg',
    color: 'bg-[#FFFEF8]', textStyle: 'font-serif italic text-[#1a1a1a] text-[16px]',
    cardText: 'William Hayes', tags: ['CALLING CARD', 'SCRIPT'],
    description: 'The Correspondent is set in graceful Bickham Script, recalling the tradition of the personal calling card.',
    descriptionDetails: 'A timeless format for those who value personal connections. This single-name calling card is elegant in its simplicity, perfect for social introductions and personal correspondence.',
    typefaces: [{ name: 'Bickham Script' }, { name: 'Garamond' }],
    specifications: { size: 'U.S. Standard size (2" x 3.5")', paper: 'Neenah Cotton, Natural White 100% cotton paper', ink: 'Black ink', press: 'Hand printed on a 1945 Chandler & Price Letterpress' },
    paperWeights: [{ name: '110lb Cover (Standard)', price: 0 }, { name: '220lb Cover (Double Thick)', price: 20 }],
    quantities: [{ qty: 50, price: 75 }, { qty: 100, price: 120 }, { qty: 250, price: 240 }, { qty: 500, price: 400 }],
  },
  '6': {
    id: 6, title: 'The Bauhaus', price: 100,
    image: '/products/v900-sasi-businesscard-01.jpg',
    color: 'bg-[#F5F5F5]', textStyle: 'font-sans font-bold text-[#1a1a1a] text-[12px] uppercase tracking-widest',
    cardText: 'STUDIO\nBERLIN', tags: ['BAUHAUS', 'BOLD'],
    description: 'The Bauhaus is set in bold Futura, inspired by the geometric clarity of the Bauhaus movement.',
    descriptionDetails: 'Strong, confident typography with generous ink coverage creates a card with real presence. The deep letterpress impression paired with bold sans-serif type makes a powerful statement.',
    typefaces: [{ name: 'Futura', link: 'https://en.wikipedia.org/wiki/Futura_(typeface)' }, { name: 'DIN' }],
    specifications: { size: 'U.S. Standard size (2" x 3.5")', paper: 'Neenah Cotton, Bright White 100% cotton paper', ink: 'Black ink', press: 'Hand printed on a 1962 Heidelberg Windmill' },
    paperWeights: [{ name: '110lb Cover (Standard)', price: 0 }, { name: '220lb Cover (Double Thick)', price: 25 }],
    quantities: [{ qty: 50, price: 100 }, { qty: 100, price: 160 }, { qty: 250, price: 320 }, { qty: 500, price: 540 }],
  },
  '7': {
    id: 7, title: 'The Editor', price: 90,
    image: '/products/10591621.jpg',
    color: 'bg-[#F0EDE8]', textStyle: 'font-serif text-[#3A3A3A] text-[13px]',
    cardText: 'Sarah James\nEditor', tags: ['CLASSIC', 'EDITORIAL'],
    description: 'The Editor is set in refined Caslon, the quintessential typeface of the publishing world.',
    descriptionDetails: 'A card that speaks to the literary tradition. Clean, authoritative, and understated — perfect for editors, writers, and publishing professionals who appreciate the printed word.',
    typefaces: [{ name: 'Caslon', link: 'https://en.wikipedia.org/wiki/Caslon' }, { name: 'Baskerville' }],
    specifications: { size: 'U.S. Standard size (2" x 3.5")', paper: 'Neenah Cotton, Pearl White 100% cotton paper', ink: 'Black ink', press: 'Hand printed on a 1945 Chandler & Price Letterpress' },
    paperWeights: [{ name: '110lb Cover (Standard)', price: 0 }, { name: '220lb Cover (Double Thick)', price: 20 }],
    quantities: [{ qty: 50, price: 90 }, { qty: 100, price: 140 }, { qty: 250, price: 280 }, { qty: 500, price: 480 }],
  },
  '8': {
    id: 8, title: 'The Architect', price: 95,
    image: '/products/3285075.jpg',
    color: 'bg-[#FAFAFA] border border-[#E0E0E0]', textStyle: 'font-sans text-[#1a1a1a] text-[11px] tracking-[0.15em] uppercase',
    cardText: 'CHEN & CO\nARCHITECTURE', tags: ['MODERN', 'CORPORATE'],
    description: 'The Architect is set in precise Univers, with structured layouts inspired by architectural blueprints.',
    descriptionDetails: 'Precision and structure define this card. The wide tracking and uppercase setting convey professionalism and attention to detail — ideal for architecture firms and design studios.',
    typefaces: [{ name: 'Univers', link: 'https://en.wikipedia.org/wiki/Univers' }, { name: 'Akzidenz-Grotesk' }],
    specifications: { size: 'U.S. Standard size (2" x 3.5")', paper: 'Neenah Cotton, Bright White 100% cotton paper', ink: 'Grey ink', press: 'Hand printed on a 1962 Heidelberg Windmill' },
    paperWeights: [{ name: '110lb Cover (Standard)', price: 0 }, { name: '220lb Cover (Double Thick)', price: 20 }],
    quantities: [{ qty: 50, price: 95 }, { qty: 100, price: 150 }, { qty: 250, price: 300 }, { qty: 500, price: 520 }],
  },
  'sample-1': {
    id: 'sample-1', title: 'Classic Sample Pack', price: 15,
    image: '/products/Stack-Letterpress-Business-Cards-Mockup.jpg',
    color: 'bg-[#E8E4DC]', textStyle: 'font-serif text-[#4A4A4A] text-[11px]',
    cardText: '6 Card\nSamples', tags: ['SAMPLES'],
    description: 'A curated selection of our classic letterpress designs on premium cotton paper.',
    descriptionDetails: 'Includes six of our most popular classic designs printed on 110lb Neenah Cotton. Feel the deep letterpress impression and compare paper textures before placing your full order.',
    typefaces: [],
    specifications: { size: 'U.S. Standard size (2" x 3.5")', paper: 'Neenah Cotton, Pearl White 100% cotton paper', ink: 'Various', press: 'Hand printed on antique letterpresses' },
    paperWeights: [{ name: '110lb Cover (Standard)', price: 0 }],
    quantities: [{ qty: 1, price: 15 }],
  },
  'sample-2': {
    id: 'sample-2', title: 'Modern Sample Pack', price: 15,
    image: '/products/close-up-blank-business-cards-grey-background.jpg',
    color: 'bg-[#F0F0F0]', textStyle: 'font-sans text-[#333] text-[10px] uppercase tracking-wider',
    cardText: '6 CARD\nSAMPLES', tags: ['SAMPLES'],
    description: 'A curated selection of our modern and minimal letterpress designs.',
    descriptionDetails: 'Includes six of our contemporary designs featuring clean sans-serif typography and geometric layouts. Printed on 110lb Neenah Cotton Bright White.',
    typefaces: [],
    specifications: { size: 'U.S. Standard size (2" x 3.5")', paper: 'Neenah Cotton, Bright White 100% cotton paper', ink: 'Various', press: 'Hand printed on antique letterpresses' },
    paperWeights: [{ name: '110lb Cover (Standard)', price: 0 }],
    quantities: [{ qty: 1, price: 15 }],
  },
  'sample-3': {
    id: 'sample-3', title: 'Complete Sample Set', price: 25,
    image: '/products/2838953.jpg',
    color: 'bg-[#F5F0E8]', textStyle: 'font-serif text-[#5A5A5A] text-[11px]',
    cardText: 'All 12\nDesigns', tags: ['SAMPLES', 'COMPLETE'],
    description: 'Every design in our collection, perfect for those who want to see and feel all options.',
    descriptionDetails: 'Includes all twelve of our letterpress business card designs. The definitive way to choose your perfect card — compare typefaces, layouts, and paper options side by side. Sample cost credited towards your first order.',
    typefaces: [],
    specifications: { size: 'U.S. Standard size (2" x 3.5")', paper: 'Neenah Cotton, various colors 100% cotton paper', ink: 'Various', press: 'Hand printed on antique letterpresses' },
    paperWeights: [{ name: '110lb Cover (Standard)', price: 0 }],
    quantities: [{ qty: 1, price: 25 }],
  },
}

/**
 * Get a product by ID. Returns null if not found.
 */
export function getProductById(id: string): ProductDetail | null {
  return productDetails[id] ?? null
}

/**
 * Get all product IDs (for generateStaticParams).
 */
export function getAllProductIds(): string[] {
  return Object.keys(productDetails)
}
