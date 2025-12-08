import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { getSessionSafely, validateSupabaseEnv } from './supabase-debug'
import type { Database } from '@/types/supabase'

const DEBUG = process.env.NODE_ENV === 'development'

// Initialize on module load to catch configuration issues early
validateSupabaseEnv()

export function createClientSupabaseClient() {
  return createClientComponentClient<Database>()
}

export async function getClientSession() {
  const supabase = createClientSupabaseClient()
  return getSessionSafely(supabase, 'Client session check')
}

export async function getClientUser() {
  try {
    const { data: { session } } = await getClientSession()
    return session?.user ?? null
  } catch (error) {
    // Silently handle timeout/connection errors - user is simply not logged in
    if (DEBUG) {
      console.warn('Failed to get client user (this is normal if not authenticated):', error instanceof Error ? error.message : error)
    }
    return null
  }
}