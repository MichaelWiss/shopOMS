/**
 * Site configuration - centralized branding and contact info.
 * 
 * Uses environment variables with sensible defaults.
 * All NEXT_PUBLIC_* vars are available client-side.
 */

export const siteConfig = {
  // Branding
  name: process.env.NEXT_PUBLIC_SITE_NAME ?? 'Press & Co',
  
  // Contact
  email: process.env.NEXT_PUBLIC_CONTACT_EMAIL ?? 'hello@pressandco.com',
  phone: process.env.NEXT_PUBLIC_CONTACT_PHONE ?? '(+61) 400 000 000',
  instagram: process.env.NEXT_PUBLIC_INSTAGRAM_HANDLE ?? '@pressandco',
  
  // Location
  location: process.env.NEXT_PUBLIC_LOCATION ?? 'Melbourne, Australia',
  estYear: process.env.NEXT_PUBLIC_EST_YEAR ?? '2024',
  
  // Currency
  currencyCode: process.env.NEXT_PUBLIC_CURRENCY_CODE ?? 'AUD',
  currencySymbol: process.env.NEXT_PUBLIC_CURRENCY_SYMBOL ?? 'A$',
} as const

// Helper to format prices with the configured currency
export function formatSitePrice(amount: number | string): string {
  const value = typeof amount === 'string' ? parseFloat(amount) : amount
  return `${siteConfig.currencySymbol}${value.toFixed(2)}`
}

// Helper to get mailto link
export function getMailtoLink(subject?: string): string {
  const base = `mailto:${siteConfig.email}`
  return subject ? `${base}?subject=${encodeURIComponent(subject)}` : base
}
