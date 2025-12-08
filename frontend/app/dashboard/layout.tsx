import React from 'react'
import { cookies } from 'next/headers'
import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { createServerSupabase } from '@/lib/supabaseClient'
import { DashboardLayout } from '@/components/dashboard/DashboardLayout'

export const metadata = {
  title: 'Dashboard - AI Chatbot Platform'
}

export default async function Layout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies()
  const session = await auth({ cookieStore })

  console.log('Dashboard layout - has session:', !!session, 'has user:', !!session?.user)

  if (!session?.user) {
    // Server-side redirect to sign-in when not authenticated
    console.log('Dashboard layout - redirecting to sign-in, no user found')
    redirect('/sign-in')
  }

  // Check onboarding status - onboarding page has its own layout
  try {
    const supabase = createServerSupabase({ cookieStoreOrFn: cookieStore })
    const tenantId = session.user.user_metadata?.tenant_id || session.user.id
    
    const { data: tenant } = await supabase
      .from('tenants')
      .select('is_onboarded')
      .eq('id', tenantId)
      .single()

    // Redirect to onboarding if not completed
    // Note: This will be skipped for /dashboard/onboarding route due to its own layout
    if (tenant && !tenant.is_onboarded) {
      redirect('/dashboard/onboarding')
    }
  } catch (error) {
    console.error('Error checking onboarding status:', error)
    // Continue to dashboard on error (graceful degradation)
  }

  return (
    <DashboardLayout user={session.user}>
      {children}
    </DashboardLayout>
  )
}
