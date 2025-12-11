import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import type { Database } from '@/types/supabase'

const DEBUG = process.env.NODE_ENV === 'development'
const TIMEOUT_MS = parseInt(process.env.NEXT_PUBLIC_SUPABASE_TIMEOUT_MS || '10000', 10) // 10 seconds default

// Get the type from the actual client
type AnySupabaseClient = ReturnType<typeof createClientComponentClient<Database>>

export function validateSupabaseEnv() {
  if (DEBUG) {
    console.log('🔍 Checking Supabase environment variables...')
    
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    
    if (!url || !key) {
      console.error('❌ Missing Supabase environment variables:')
      if (!url) console.error('   - NEXT_PUBLIC_SUPABASE_URL is not defined')
      if (!key) console.error('   - NEXT_PUBLIC_SUPABASE_ANON_KEY is not defined')
      return false
    }
    
    if (!url.startsWith('https://')) {
      console.error('❌ Invalid NEXT_PUBLIC_SUPABASE_URL:', url)
      console.error('   URL must start with https://')
      return false
    }
    
    console.log('✅ Supabase environment variables look good')
    return true
  }
  return true
}

export async function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number = TIMEOUT_MS,
  context: string = 'Operation'
): Promise<T> {
  const timeout = new Promise<never>((_, reject) => {
    setTimeout(() => {
      reject(new Error(`${context} timed out after ${timeoutMs}ms`))
    }, timeoutMs)
  })

  try {
    const result = await Promise.race([promise, timeout])
    return result
  } catch (error) {
    // Only log unexpected errors, not timeouts (which are handled upstream)
    if (DEBUG) {
      const errorMessage = error instanceof Error ? error.message : String(error)
      if (!errorMessage.includes('timeout')) {
        console.error(`❌ ${context} failed:`, error)
      }
    }
    throw error
  }
}

export async function getSessionSafely(
  supabase: AnySupabaseClient,
  context: string = 'Supabase auth'
) {
  if (!validateSupabaseEnv()) {
    throw new Error('Invalid or missing Supabase configuration')
  }

  try {
    const result = await withTimeout(
      supabase.auth.getSession(),
      TIMEOUT_MS,
      context
    )
    if (DEBUG && 'error' in result && result.error) {
      // Only log errors if it's not a timeout or network error (expected in some cases)
      const errorMessage = result.error?.message || ''
      if (!errorMessage.includes('timeout') && !errorMessage.includes('fetch')) {
        console.error(`❌ ${context} error:`, result.error)
      }
    }
    return result
  } catch (error) {
    // Don't log timeout errors as errors - they're expected in some scenarios
    const errorMessage = error instanceof Error ? error.message : String(error)
    if (errorMessage.includes('timeout') || errorMessage.includes('fetch')) {
      if (DEBUG) {
        console.warn(`⚠️ ${context} timed out or connection failed (this may be normal if Supabase is not available).`)
      }
    } else {
      console.error(`❌ ${context} failed. Please check your Supabase configuration and connection.`)
    }
    throw error
  }
}