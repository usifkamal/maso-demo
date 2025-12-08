import React from 'react'
import { cookies } from 'next/headers'
import { auth } from '@/auth'
import { createServerSupabase } from '@/lib/supabaseClient'

export default async function ProfilePage() {
  const cookieStore = await cookies()
  const session = await auth({ cookieStore })
  if (!session?.user) return <div className="p-8">Please sign in</div>
  // Pass the `cookies` function to the Supabase helper to avoid type mismatches
  const supabase = createServerSupabase({ cookieStoreOrFn: cookieStore })

  // Try to get tenant info from a `tenants` table, fallback to user metadata
  let tenant: any = null
  try {
    const tenantId = session.user.user_metadata?.tenant_id || session.user.id
    const { data } = await supabase.from('tenants').select('*').eq('id', tenantId).single()
    tenant = data || { id: tenantId, api_key: session.user.user_metadata?.tenant_api_key }
  } catch (err) {
    tenant = { id: session.user.user_metadata?.tenant_id || session.user.id, api_key: session.user.user_metadata?.tenant_api_key }
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Profile</h1>
      <div className="border rounded p-4">
        <div className="text-sm text-muted-foreground">Tenant ID</div>
        <div className="font-medium">{tenant?.id}</div>
        <div className="mt-4 text-sm text-muted-foreground">API Key</div>
        <div className="font-mono break-all bg-muted/20 p-2 rounded">{tenant?.api_key ?? 'No API key available'}</div>
      </div>
    </div>
  )
}
