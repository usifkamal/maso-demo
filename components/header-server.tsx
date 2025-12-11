import { cookies } from 'next/headers'
import { createServerSupabase } from '@/lib/supabaseClient'
import type { Database } from '@/types/supabase'
import { HeaderClient } from './header-client'

// Helper function to get session for reuse
async function getHeaderSession() {
  try {
    const cookieStore = await cookies()
    const supabase = createServerSupabase({ cookieStoreOrFn: cookieStore })
    return supabase.auth.getSession()
  } catch (err) {
    // If requestAsyncStorage/cookies are not available (e.g. metadata build or
    // certain runtimes), fall back to a null session so the header still renders.
    // Avoid throwing so server rendering doesn't fail.
    // eslint-disable-next-line no-console
    console.warn('getHeaderSession: cookies() not available, falling back to null session', err)
    return { data: { session: null } }
  }
}

export default async function HeaderServer() {
  // If server-side session retrieval is unreliable in some runtimes, fall back
  // to rendering the header without a session. The client will hydrate and
  // can fetch session info if needed.
  try {
    const { data: { session } } = await getHeaderSession()
    return <HeaderClient session={session} />
  } catch (err) {
    // eslint-disable-next-line no-console
    console.warn('HeaderServer: failed to get session, rendering without session', err)
    return <HeaderClient session={null} />
  }
}