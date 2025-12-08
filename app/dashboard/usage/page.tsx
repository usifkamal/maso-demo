import React from 'react'
import { cookies } from 'next/headers'
import { auth } from '@/auth'
import { createServerSupabase } from '@/lib/supabaseClient'
import UsageChart from './usage-chart'

export default async function UsagePage() {
  const cookieStore = await cookies()
  const session = await auth({ cookieStore })
  if (!session?.user) {
    return <div className="p-8">Please sign in</div>
  }

  const supabase = createServerSupabase({ cookieStoreOrFn: cookieStore })
  // Try to read usage from a hypothetical `requests` table partitioned by tenant_id
  let usage: { day: string; count: number }[] = []
  try {
    const tenantId = session.user.user_metadata?.tenant_id || session.user.id
    const { data, error } = await supabase
      .from('requests')
      .select('day,count')
      .eq('tenant_id', tenantId)
      .order('day', { ascending: true })

    if (error) {
      console.warn('usage query error', error)
    } else if (data) {
      usage = data as any
    }
  } catch (err) {
    console.warn(err)
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-4">Usage</h1>
      <UsageChart data={usage} />
    </div>
  )
}
