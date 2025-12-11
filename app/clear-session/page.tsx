'use client'

import { useEffect, useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'

// Force dynamic rendering to avoid build-time errors
export const dynamic = 'force-dynamic'

export default function ClearSessionPage() {
  const [status, setStatus] = useState<'idle' | 'clearing' | 'cleared'>('idle')
  const [supabase, setSupabase] = useState<any>(null)
  const router = useRouter()
  
  // Initialize Supabase only on client side
  useEffect(() => {
    try {
      setSupabase(createClientComponentClient())
    } catch (error) {
      console.error('Failed to initialize Supabase:', error)
    }
  }, [])

  const clearSession = async () => {
    if (!supabase) {
      console.error('Supabase client not initialized')
      return
    }
    setStatus('clearing')
    
    try {
      // Sign out from Supabase (clears all cookies and session)
      await supabase.auth.signOut()
      
      // Clear localStorage
      if (typeof window !== 'undefined') {
        localStorage.clear()
        sessionStorage.clear()
      }
      
      // Wait a moment for everything to clear
      await new Promise(resolve => setTimeout(resolve, 500))
      
      setStatus('cleared')
    } catch (error) {
      console.error('Error clearing session:', error)
      setStatus('cleared') // Continue anyway
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8 rounded-lg border border-border bg-background p-8 shadow-lg">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Clear Session</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            This utility helps clear any stale authentication sessions and cached data.
          </p>
        </div>

        {status === 'idle' && (
          <div className="space-y-4">
            <Button 
              onClick={clearSession}
              className="w-full"
              variant="destructive"
            >
              Clear All Session Data
            </Button>
            <p className="text-xs text-muted-foreground text-center">
              This will sign you out and clear all browser storage
            </p>
          </div>
        )}

        {status === 'clearing' && (
          <div className="text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent"></div>
            <p className="mt-4 text-sm">Clearing session data...</p>
          </div>
        )}

        {status === 'cleared' && (
          <div className="space-y-4">
            <div className="rounded-lg bg-green-500/10 p-4 text-center">
              <p className="font-medium text-green-500">✓ Session cleared successfully!</p>
            </div>
            <div className="space-y-2">
              <Button 
                onClick={() => router.push('/sign-in')}
                className="w-full"
              >
                Go to Sign In
              </Button>
              <Button 
                onClick={() => router.push('/')}
                variant="outline"
                className="w-full"
              >
                Go to Home
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

