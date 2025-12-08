'use client'

import { useEffect, useState } from 'react'

/**
 * Demo Mode Banner Component
 * Displays a fixed banner at the top of the page when demo mode is enabled
 */
export function DemoBanner() {
  const [isDemoMode, setIsDemoMode] = useState(false)

  useEffect(() => {
    // Check demo mode on client side after mount
    setIsDemoMode(process.env.NEXT_PUBLIC_DEMO_MODE === 'true')
    
    // Add padding to main content when banner is shown
    if (process.env.NEXT_PUBLIC_DEMO_MODE === 'true') {
      const main = document.querySelector('main')
      if (main) {
        main.style.paddingTop = '3.5rem' // pt-14 + banner height
      }
    }
  }, [])

  if (!isDemoMode) {
    return null
  }

  return (
    <div className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md bg-gray-900/80 border-b border-gray-800/50 px-4 py-2.5 text-center text-sm font-medium shadow-lg">
      <div className="flex items-center justify-center gap-2 text-gray-200">
        <span>🔒</span>
        <span>You're in Demo Mode — No real data is stored.</span>
      </div>
    </div>
  )
}

