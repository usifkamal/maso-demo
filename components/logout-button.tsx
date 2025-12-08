'use client'

import * as React from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { IconSpinner } from '@/components/ui/icons'
import { toast } from 'react-hot-toast'

export function LogoutButton() {
  const [isLoading, setIsLoading] = React.useState(false)
  const router = useRouter()
  const supabase = createClientComponentClient({
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
    supabaseKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  })

  const handleLogout = async () => {
    // Demo mode: disable logout
    if (process.env.NEXT_PUBLIC_DEMO_MODE === 'true') {
      toast.error('Authentication is disabled in demo mode')
      return
    }

    console.log('Logout button clicked')
    setIsLoading(true)
    
    try {
      // Check current session before logout
      const { data: sessionData } = await supabase.auth.getSession()
      console.log('Current session before logout:', sessionData.session ? 'exists' : 'none')
      
      // Sign out from Supabase (this clears cookies)
      const { error } = await supabase.auth.signOut()
      
      if (error) {
        console.error('Supabase signOut error:', error)
        toast.error('Error signing out: ' + error.message)
      } else {
        console.log('Successfully signed out from Supabase')
        toast.success('Logged out successfully')
      }
      
      // Clear localStorage and sessionStorage
      if (typeof window !== 'undefined') {
        localStorage.clear()
        sessionStorage.clear()
        console.log('Cleared local storage')
      }
      
      // Wait a moment for cookies to be cleared
      await new Promise(resolve => setTimeout(resolve, 300))
      
      // Force full page reload to clear all session state
      console.log('Redirecting to sign-in page')
      window.location.href = '/sign-in'
    } catch (error) {
      console.error('Error during logout:', error)
      toast.error('An error occurred during logout')
      
      // Force reload anyway to clear state
      setTimeout(() => {
        window.location.href = '/sign-in'
      }, 1000)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button 
      variant="link" 
      className="-ml-2"
      onClick={handleLogout}
      disabled={isLoading}
    >
      {isLoading && <IconSpinner className="mr-2 h-4 w-4 animate-spin" />}
      Logout
    </Button>
  )
}

