'use client'

import { IconMenu, IconUser } from '@/components/ui/icons'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import toast from 'react-hot-toast'

interface NavbarProps {
  onMenuClick: () => void
  user?: {
    email?: string | null
    user_metadata?: {
      full_name?: string
    }
  }
}

export function Navbar({ onMenuClick, user }: NavbarProps) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const router = useRouter()
  const supabase = createClientComponentClient()

  const handleLogout = async () => {
    // Demo mode: disable logout
    if (process.env.NEXT_PUBLIC_DEMO_MODE === 'true') {
      toast.error('Authentication is disabled in demo mode')
      return
    }

    try {
      await supabase.auth.signOut()
      
      // Clear storage
      if (typeof window !== 'undefined') {
        localStorage.clear()
        sessionStorage.clear()
      }
      
      toast.success('Logged out successfully')
      
      // Redirect to sign-in
      router.push('/sign-in')
    } catch (error) {
      console.error('Logout error:', error)
      toast.error('Failed to log out')
    }
  }

  const displayName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User'
  const userEmail = user?.email || ''

  return (
    <header className="sticky top-0 z-30 h-16 glassy text-gray-100">
      <div className="flex h-full items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Mobile menu button */}
        <button
          onClick={onMenuClick}
          className="lg:hidden -ml-2 inline-flex items-center justify-center rounded-md p-2 text-gray-200 hover:text-gray-100 hover:bg-gray-800/60 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500/40"
        >
          <IconMenu className="h-6 w-6" />
        </button>

        {/* Page title or breadcrumb */}
        <div className="flex items-center">
          <h1 className="text-xl font-semibold text-gray-100 hidden sm:block">
            Dashboard
          </h1>
        </div>

        {/* Right side - User menu */}
        <div className="relative">
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-gray-200 hover:bg-gray-800/60 transition-all duration-300 ease-in-out"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-500/20 text-indigo-300">
              <IconUser className="h-4 w-4" />
            </div>
            <span className="hidden sm:block">{displayName}</span>
            <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {/* Dropdown menu */}
          {isDropdownOpen && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setIsDropdownOpen(false)}
              />
              <div className="absolute right-0 z-20 mt-2 w-56 origin-top-right rounded-lg glassy-card shadow-lg focus:outline-none neon-glow">
                <div className="p-2">
                  {/* User info */}
                  <div className="px-3 py-2 border-b border-gray-800/40">
                    <p className="text-sm font-medium text-gray-100 truncate">{displayName}</p>
                    <p className="text-xs text-gray-400 truncate">{userEmail}</p>
                  </div>

                  {/* Menu items */}
                  <div className="mt-2 space-y-1">
                    <a
                      href="/dashboard/profile"
                      className="flex items-center gap-2 rounded-md px-3 py-2 text-sm text-gray-200 hover:bg-gray-800/60 transition-all duration-300 ease-in-out"
                      onClick={() => setIsDropdownOpen(false)}
                    >
                      <IconUser className="h-4 w-4" />
                      Profile & API Key
                    </a>
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 rounded-md px-3 py-2 text-sm text-red-300 hover:bg-red-900/20 transition-all duration-300 ease-in-out"
                    >
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      Log out
                    </button>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  )
}

// Icon component for menu (hamburger)
function IconMenu({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
    </svg>
  )
}


