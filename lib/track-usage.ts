import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/lib/db_types'

/**
 * Track API usage in the requests table
 * This increments the count for a tenant/endpoint/day combination
 * Can be called from both server actions and route handlers
 */
export async function trackUsage(
  tenantId: string,
  endpoint: string,
  userId?: string,
  supabaseClient?: any
) {
  try {
    // Use provided client or create a new one
    const supabase = supabaseClient || createClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const today = new Date().toISOString().split('T')[0] // YYYY-MM-DD

    // Check if record exists, then update or insert
    const { data: existing } = await supabase
      .from('requests')
      .select('id, count')
      .eq('tenant_id', tenantId)
      .eq('endpoint', endpoint)
      .eq('day', today)
      .maybeSingle()

    if (existing) {
      // Update existing record
      await supabase
        .from('requests')
        .update({ count: existing.count + 1 })
        .eq('id', existing.id)
    } else {
      // Insert new record
      await supabase
        .from('requests')
        .insert({
          tenant_id: tenantId,
          user_id: userId || null,
          endpoint,
          day: today,
          count: 1
        })
    }
  } catch (error) {
    // Fail silently - don't break the main flow if tracking fails
    console.error('Failed to track usage:', error)
  }
}

