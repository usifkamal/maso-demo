import 'server-only'
import { cookies } from 'next/headers'
import { createServerSupabase } from '@/lib/supabaseClient'
import { isDemoMode } from '@/lib/env'

export const auth = async ({
  cookieStore
}: {
  cookieStore: Awaited<ReturnType<typeof cookies>>
}) => {
  // Demo mode: return mock session
  if (isDemoMode()) {
    return {
      access_token: 'demo-token',
      refresh_token: 'demo-refresh-token',
      expires_in: 3600,
      expires_at: Math.floor(Date.now() / 1000) + 3600,
      token_type: 'bearer',
      user: {
        id: 'demo-user-id',
        email: 'demo@example.com',
        user_metadata: {
          full_name: 'Demo User',
          tenant_id: 'demo-tenant-1'
        },
        app_metadata: {},
        aud: 'authenticated',
        created_at: new Date().toISOString()
      }
    } as any
  }

  // Create a Supabase client configured to use cookies
  const supabase = createServerSupabase({ cookieStoreOrFn: cookieStore })
  
  const { data, error } = await supabase.auth.getSession()
  if (error) {
    console.error('Auth error:', error)
    return null
  }
  
  console.log('Auth check - has session:', !!data.session, 'user:', data.session?.user?.email)
  return data.session
}
