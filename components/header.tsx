"use client"

import React, { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { getClientUser } from '@/lib/supabase-client'

interface NavLink {
  label: string
  href: string
  requiresAuth?: boolean
}

export function Header() {
  const pathname = usePathname()
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  const [isLoadingUser, setIsLoadingUser] = useState(true)
  const [userId, setUserId] = useState<string | null>(null)

  useEffect(() => {
    let isMounted = true
    ;(async () => {
      try {
        const user = await getClientUser()
        if (!isMounted) return
        setUserId(user?.id ?? null)
      } catch {
        if (!isMounted) return
        setUserId(null)
      } finally {
        if (!isMounted) return
        setIsLoadingUser(false)
      }
    })()
    return () => {
      isMounted = false
    }
  }, [])

  const isLoggedIn = !!userId

  const publicLinks: NavLink[] = useMemo(() => [
    { label: 'Home', href: '/' },
    { label: 'Sign In', href: '/sign-in' },
    { label: 'Sign Up', href: '/sign-up' }
  ], [])

  const authedLinks: NavLink[] = useMemo(() => {
    return [
      { label: 'Dashboard', href: '/dashboard', requiresAuth: true },
      { label: 'Chat', href: '/dashboard/chat', requiresAuth: true },
      { label: 'Embed', href: '/dashboard/embed', requiresAuth: true }
    ]
  }, [])

  const activeClass = (href: string) => cn(
    'transition-colors hover:text-gray-300',
    pathname === href ? 'text-white font-semibold' : 'text-gray-200'
  )

  const MenuLinks = ({ isMobile = false }: { isMobile?: boolean }) => (
    <>
      {(isLoggedIn ? authedLinks : publicLinks).map((link) => (
        <Link
          key={link.href}
          href={link.href}
          className={cn(
            activeClass(link.href),
            isMobile ? 'block px-4 py-2' : 'px-3 py-2'
          )}
          onClick={() => setIsMobileOpen(false)}
        >
          {link.label}
        </Link>
      ))}
      {isLoggedIn ? (
        <>
          <Link
            href="/dashboard/profile"
            className={cn(isMobile ? 'block px-4 py-2' : 'px-3 py-2', activeClass('/dashboard/profile'))}
            onClick={() => setIsMobileOpen(false)}
          >
            Profile
          </Link>
          <form action="/api/auth/signout" method="post" className={cn(isMobile ? 'block px-4 py-2' : 'px-3 py-2')}>
            <button className="text-gray-200 hover:text-gray-300" type="submit">Logout</button>
          </form>
        </>
      ) : null}
    </>
  )

  return (
    <header className="fixed top-0 w-full glassy text-gray-100 z-50 transition-all duration-300 ease-in-out neon-glow">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-14 items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2 neon-glow-purple rounded-lg px-2 py-1" onClick={() => setIsMobileOpen(false)}>
              <span className="inline-block rounded bg-gradient-to-r from-indigo-500/20 to-purple-500/20 backdrop-blur-sm border border-indigo-500/30 px-2 py-1 text-xs font-semibold text-indigo-300">AI</span>
              <span className="text-sm font-semibold text-white">Chatbot Platform</span>
            </Link>
            <nav className="hidden md:flex items-center gap-1">
              {!isLoadingUser && <MenuLinks />}
            </nav>
          </div>

          <div className="flex items-center gap-2">
            <button
              aria-label="Toggle menu"
              className="md:hidden inline-flex items-center justify-center rounded p-2 text-gray-200 hover:text-gray-300"
              onClick={() => setIsMobileOpen((v) => !v)}
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-6 w-6">
                <path fillRule="evenodd" d="M3.75 5.25a.75.75 0 0 1 .75-.75h15a.75.75 0 0 1 0 1.5h-15a.75.75 0 0 1-.75-.75Zm0 6a.75.75 0 0 1 .75-.75h15a.75.75 0 0 1 0 1.5h-15a.75.75 0 0 1-.75-.75Zm.75 5.25a.75.75 0 0 0 0 1.5h15a.75.75 0 0 0 0-1.5h-15Z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div className={cn('md:hidden border-t border-white/10 glassy-card', isMobileOpen ? 'block' : 'hidden')}>
        {!isLoadingUser && (
          <div className="space-y-1 py-2">
            <MenuLinks isMobile />
          </div>
        )}
      </div>
    </header>
  )
}
