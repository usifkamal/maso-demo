import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { Database } from '@/types/supabase'
import type { NextRequest } from 'next/server'

// Check if demo mode is enabled
const isDemoMode = () => process.env.DEMO_MODE === 'true'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()

  // Demo mode: skip authentication checks and allow all routes
  if (isDemoMode()) {
    return res
  }

  try {
    // Create a Supabase client configured to use cookies
    const supabase = createMiddlewareClient<Database>({ 
      req, 
      res,
      // Pass env vars directly to ensure they're available in Edge runtime
      supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
      supabaseKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    })

    // Refresh session if expired - required for Server Components
    // https://supabase.com/docs/guides/auth/auth-helpers/nextjs#managing-session-with-middleware
    const {
      data: { session },
      error
    } = await supabase.auth.getSession()

    // Debug: Log session status
    if (req.nextUrl.pathname.startsWith('/dashboard')) {
      console.log('Middleware check:', {
        path: req.nextUrl.pathname,
        hasSession: !!session,
        error: error?.message
      })
    }

    // Protect only authenticated areas (e.g., /dashboard) and allow public routes.
    const isProtected = req.nextUrl.pathname.startsWith('/dashboard')
    const isAuthRoute = req.nextUrl.pathname.startsWith('/sign-in') || req.nextUrl.pathname.startsWith('/sign-up')
    const isAuthApi = req.nextUrl.pathname.startsWith('/api/auth')

    if (!session && isProtected && !isAuthRoute && !isAuthApi) {
      const redirectUrl = req.nextUrl.clone()
      redirectUrl.pathname = '/sign-in'
      redirectUrl.searchParams.set('redirectedFrom', req.nextUrl.pathname)
      return NextResponse.redirect(redirectUrl)
    }

    return res
  } catch (err) {
    console.error('Middleware error:', err)
    return res
  }
}

export const config = {
  // Run middleware for all app routes so we can check /dashboard; static and images excluded
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)']
}
