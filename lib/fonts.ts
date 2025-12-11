import { JetBrains_Mono as FontMono } from 'next/font/google'
import localFont from 'next/font/local'

// Use local Inter font files to avoid Google Fonts fetch failures in restricted environments
export const fontSans = localFont({
  src: [
    { path: '../assets/fonts/Inter-Regular.woff', weight: '400', style: 'normal' },
    { path: '../assets/fonts/Inter-Bold.woff', weight: '700', style: 'normal' }
  ],
  variable: '--font-sans'
})

export const fontMono = FontMono({
  subsets: ['latin'],
  variable: '--font-mono'
})
