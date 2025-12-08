import { cookies } from 'next/headers'
import { getSessionSafely } from './supabase-debug'
import type { Database } from '@/types/supabase'
import type { SupabaseClient } from '@supabase/supabase-js'
import { createServerSupabase } from './supabaseClient'

export async function createServerSupabaseClient() {
  const cookieStore = await cookies()
  return createServerSupabase({ cookieStoreOrFn: cookieStore })
}

export async function getServerSession() {
  const supabase = await createServerSupabaseClient()
  return getSessionSafely(supabase as SupabaseClient<Database>, 'Server session check')
}

export async function getUser() {
  const { data: { session } } = await getServerSession()
  return session?.user ?? null
}