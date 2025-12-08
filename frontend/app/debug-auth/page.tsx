'use client'

import { useEffect, useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Button } from '@/components/ui/button'
import type { Session } from '@supabase/auth-helpers-nextjs'

// Force dynamic rendering to avoid build-time errors
export const dynamic = 'force-dynamic'

export default function DebugAuthPage() {
  const [session, setSession] = useState<Session | null>(null)
  const [cookies, setCookies] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [isMounted, setIsMounted] = useState(false)
  const [supabase, setSupabase] = useState<any>(null)
  
  // Initialize Supabase only on client side
  useEffect(() => {
    try {
      setSupabase(createClientComponentClient())
    } catch (error) {
      console.error('Failed to initialize Supabase:', error)
    }
  }, [])

  const loadSession = async () => {
    if (!supabase) return
    setLoading(true)
    const { data, error } = await supabase.auth.getSession()
    
    console.log('Debug Auth Page - Session check:', {
      hasSession: !!data.session,
      user: data.session?.user?.email,
      error: error?.message
    })
    
    setSession(data.session)
    if (typeof document !== 'undefined') {
      setCookies(document.cookie)
    }
    setLoading(false)
  }

  useEffect(() => {
    setIsMounted(true)
    if (supabase) {
      loadSession()
    }
  }, [supabase])

  const clearAllData = async () => {
    if (!supabase) return
    // Sign out
    await supabase.auth.signOut()
    
    // Clear storage
    localStorage.clear()
    sessionStorage.clear()
    
    // Reload
    window.location.reload()
  }

  return (
    <div className="container mx-auto max-w-4xl p-8">
      <h1 className="mb-8 text-3xl font-bold">Authentication Debug Page</h1>

      <div className="space-y-6">
        {/* Session Info */}
        <div className="rounded-lg border border-border bg-card p-6">
          <h2 className="mb-4 text-xl font-semibold">Session Information</h2>
          {loading ? (
            <p className="text-muted-foreground">Loading...</p>
          ) : session ? (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-green-500" />
                <span className="font-medium text-green-500">Session Active</span>
              </div>
              <div className="mt-4 space-y-1 text-sm">
                <p><strong>Email:</strong> {session.user?.email}</p>
                <p><strong>User ID:</strong> {session.user?.id}</p>
                <p><strong>Created:</strong> {new Date(session.user?.created_at || '').toLocaleString()}</p>
                <p><strong>Access Token (first 50 chars):</strong> {session.access_token?.substring(0, 50)}...</p>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-red-500" />
                <span className="font-medium text-red-500">No Active Session</span>
              </div>
            </div>
          )}
        </div>

        {/* Cookies Info */}
        <div className="rounded-lg border border-border bg-card p-6">
          <h2 className="mb-4 text-xl font-semibold">Browser Cookies</h2>
          {cookies ? (
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                Found {cookies.split(';').length} cookie(s)
              </p>
              <div className="max-h-40 overflow-y-auto rounded bg-muted p-3">
                <pre className="text-xs">{cookies.split(';').join('\n')}</pre>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No cookies found</p>
          )}
        </div>

        {/* Environment Variables */}
        <div className="rounded-lg border border-border bg-card p-6">
          <h2 className="mb-4 text-xl font-semibold">Environment Variables</h2>
          <div className="space-y-2 text-sm">
            <p>
              <strong>NEXT_PUBLIC_SUPABASE_URL:</strong>{' '}
              <span className={process.env.NEXT_PUBLIC_SUPABASE_URL ? 'text-green-500' : 'text-red-500'}>
                {process.env.NEXT_PUBLIC_SUPABASE_URL ? '✓ Set' : '✗ Not Set'}
              </span>
            </p>
            <p>
              <strong>NEXT_PUBLIC_SUPABASE_ANON_KEY:</strong>{' '}
              <span className={process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'text-green-500' : 'text-red-500'}>
                {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '✓ Set' : '✗ Not Set'}
              </span>
            </p>
            <p>
              <strong>NEXT_PUBLIC_AUTH_GITHUB:</strong>{' '}
              <span className="text-blue-500">
                {process.env.NEXT_PUBLIC_AUTH_GITHUB || 'Not Set'}
              </span>
            </p>
          </div>
        </div>

        {/* Storage Info */}
        <div className="rounded-lg border border-border bg-card p-6">
          <h2 className="mb-4 text-xl font-semibold">Local Storage</h2>
          <div className="space-y-2">
            {isMounted ? (
              <>
                <p className="text-sm text-muted-foreground">
                  Items in localStorage: {localStorage.length}
                </p>
                {localStorage.length > 0 ? (
                  <div className="max-h-40 overflow-y-auto rounded bg-muted p-3">
                    <pre className="text-xs">
                      {Object.keys(localStorage).map(key => 
                        `${key}: ${localStorage.getItem(key)?.substring(0, 100)}...\n`
                      )}
                    </pre>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No items in localStorage</p>
                )}
              </>
            ) : (
              <p className="text-sm text-muted-foreground">Loading...</p>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="rounded-lg border border-border bg-card p-6">
          <h2 className="mb-4 text-xl font-semibold">Actions</h2>
          <div className="flex flex-wrap gap-3">
            <Button onClick={loadSession}>Refresh Session Info</Button>
            <Button variant="outline" onClick={() => window.location.href = '/sign-in'}>
              Go to Sign In
            </Button>
            <Button variant="outline" onClick={() => window.location.href = '/'}>
              Go to Home
            </Button>
            <Button variant="destructive" onClick={clearAllData}>
              Clear All Data & Sign Out
            </Button>
          </div>
        </div>

        {/* Console Logs */}
        <div className="rounded-lg border border-yellow-500 bg-yellow-500/10 p-6">
          <h2 className="mb-2 text-xl font-semibold text-yellow-600 dark:text-yellow-400">
            Check Browser Console
          </h2>
          <p className="text-sm text-muted-foreground">
            Open your browser's Developer Tools (F12) and check the Console tab for detailed logs
            about session state and authentication.
          </p>
        </div>
      </div>
    </div>
  )
}

