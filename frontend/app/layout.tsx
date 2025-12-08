import { Metadata, Viewport } from 'next'
import { Suspense } from 'react'
import { Toaster } from 'react-hot-toast'

import '@/app/globals.css'
import { fontMono, fontSans } from '@/lib/fonts'
import { cn } from '@/lib/utils'
import { TailwindIndicator } from '@/components/tailwind-indicator'
import { Providers } from '@/components/providers'
import { Header } from '@/components/header'
import { DemoBanner } from '@/components/demo-banner'

export const metadata: Metadata = {
  title: {
    default: 'Next.js AI Chatbot',
    template: `%s - Next.js AI Chatbot`
  },
  description: 'An AI-powered chatbot template built with Next.js and Vercel.',
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon-16x16.png',
    apple: '/apple-touch-icon.png'
  }
}

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: 'white' },
    { media: '(prefers-color-scheme: dark)', color: 'black' }
  ]
}

interface RootLayoutProps {
  children: React.ReactNode
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en" suppressHydrationWarning className="dark">
      <head />
      <body
        suppressHydrationWarning
        className={cn(
          'font-sans antialiased bg-gray-950 text-gray-100 transition-all duration-300 ease-in-out',
          fontSans.variable,
          fontMono.variable
        )}
      >
        <DemoBanner />
        <Toaster />
        <div className="flex min-h-screen flex-col">
          <Suspense fallback={<div className="h-16 border-b" />}>
            <Header />
          </Suspense>
          <Providers attribute="class" defaultTheme="dark" enableSystem={false}>
            <main className="flex flex-1 flex-col bg-gray-950 pt-14">{children}</main>
          </Providers>
        </div>
        <TailwindIndicator />
      </body>
    </html>
  )
}
