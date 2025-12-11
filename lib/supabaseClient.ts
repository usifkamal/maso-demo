import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { type cookies } from 'next/headers'
import { getSupabaseEnv } from './getSupabaseEnv'
import { Database } from '@/types/supabase'

const { url, anonKey } = getSupabaseEnv()

/**
 * Create a Supabase client for use in Server Components
 */
export function createServerSupabase({ cookieStoreOrFn }: { cookieStoreOrFn: any }) {
  // Accept either the cookies() function or the cookieStore result
  const cookiesProvider = () => {
    try {
      // If caller passed the cookies() function, call it to get the cookies object
      if (typeof cookieStoreOrFn === 'function') return cookieStoreOrFn()
      // Otherwise assume it's already the cookieStore object
      return cookieStoreOrFn
    } catch (e) {
      return cookieStoreOrFn
    }
  }

  // Normalize the provider into a simple adapter object that always exposes `.get(name)`
  // and returns a cookie value string or undefined. This adapts various Next versions
  // and avoids runtime errors where auth-helpers expects a `.get` method on the cookie store.
  const cookieObj = cookiesProvider()

  const cookieAdapter = {
    get: (name: string) => {
      try {
        // Some Next versions return an object with .get(name) -> { name, value }
        if (cookieObj && typeof cookieObj.get === 'function') {
          const c = cookieObj.get(name)
          if (!c) return undefined
          // If get returns an object with a `value` field, return that, otherwise return the raw value
          return (typeof c === 'string') ? c : (c.value ?? (c as any).value ?? undefined)
        }

        // Some runtimes may provide cookies as a plain object map
        if (cookieObj && Object.prototype.hasOwnProperty.call(cookieObj, name)) {
          return (cookieObj as any)[name]
        }

        return undefined
      } catch (e) {
        return undefined
      }
    },
    // set/delete are no-ops on server; keep them to be safe for callers that expect them
    set: (_name: string, _value: string) => {},
    delete: (_name: string) => {}
  }

  // Cast to any to avoid type incompatibilities between different Next versions
  // Pass the adapter itself (not a function) — auth-helpers in some builds call `.get` directly
  // Provide a function that returns the adapter. Some builds call `cookies()` while
  // others access `.get` directly on the object — returning the adapter from a
  // function supports both call-sites.
  return (createServerComponentClient as any)({
    cookies: () => cookieAdapter as any,
    supabaseUrl: url,
    supabaseKey: anonKey
  }) as any
}

/**
 * Create a Supabase client for use in Client Components
 */
export function createClientSupabase() {
  return createClientComponentClient<Database>({
    supabaseUrl: url,
    supabaseKey: anonKey
  })
}