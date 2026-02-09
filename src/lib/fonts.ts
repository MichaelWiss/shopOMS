import { Playfair_Display } from 'next/font/google'

/**
 * Shared Playfair Display font instance.
 * Import this instead of creating a new instance in each file.
 */
export const playfair = Playfair_Display({
  subsets: ['latin'],
  weight: ['400', '500'],
  style: ['normal', 'italic'],
})
