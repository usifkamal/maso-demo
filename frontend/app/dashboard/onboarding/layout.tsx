import React from 'react'
import { cookies } from 'next/headers'
import { auth } from '@/auth'
import { redirect } from 'next/navigation'

export default async function OnboardingLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies()
  const session = await auth({ cookieStore })

  if (!session?.user) {
    redirect('/sign-in')
  }

  // Onboarding layout doesn't check onboarding status (allows access)
  // and doesn't use DashboardLayout (full screen experience)
  return <>{children}</>
}






