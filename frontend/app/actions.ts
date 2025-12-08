'use server'
import 'server-only'
import { createServerActionClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { Database } from '@/lib/db_types'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

import { type Chat } from '@/lib/types'
import { isDemoMode } from '@/lib/env'
import { MOCK_CHATS } from '@/lib/demo'

export async function getChats(userId?: string | null) {
  // Demo mode: return mock chats
  if (isDemoMode()) {
    return MOCK_CHATS as Chat[]
  }

  if (!userId) {
    return []
  }
  try {
    const cookieStore = await cookies()
    const supabase = createServerActionClient<Database>({
      cookies: () => cookieStore
    })
    const { data } = await supabase
      .from('chats')
      .select('payload')
      .order('payload->createdAt', { ascending: false })
      .eq('user_id', userId)
      .throwOnError()

    return (data?.map(entry => entry.payload) as Chat[]) ?? []
  } catch (error) {
    return []
  }
}

export async function getChat(id: string) {
  // Demo mode: return mock chat if found
  if (isDemoMode()) {
    const mockChat = MOCK_CHATS.find(chat => chat.id === id)
    return (mockChat as Chat) ?? null
  }

  const cookieStore = await cookies()
  const supabase = createServerActionClient<Database>({
    cookies: () => cookieStore
  })
  const { data } = await supabase
    .from('chats')
    .select('payload')
    .eq('id', id)
    .maybeSingle()

  return (data?.payload as Chat) ?? null
}

export async function removeChat({ id, path }: { id: string; path: string }) {
  // Demo mode: no writes allowed
  if (isDemoMode()) {
    revalidatePath('/')
    return revalidatePath(path)
  }

  try {
    const cookieStore = await cookies()
    const supabase = createServerActionClient<Database>({
      cookies: () => cookieStore
    })
    await supabase.from('chats').delete().eq('id', id).throwOnError()

    revalidatePath('/')
    return revalidatePath(path)
  } catch (error) {
    return {
      error: 'Unauthorized'
    }
  }
}

export async function clearChats() {
  // Demo mode: no writes allowed
  if (isDemoMode()) {
    revalidatePath('/')
    return redirect('/')
  }

  try {
    const cookieStore = await cookies()
    const supabase = createServerActionClient<Database>({
      cookies: () => cookieStore
    })
    await supabase.from('chats').delete().throwOnError()
    revalidatePath('/')
    return redirect('/')
  } catch (error) {
    console.log('clear chats error', error)
    return {
      error: 'Unauthorized'
    }
  }
}

export async function getSharedChat(id: string) {
  const cookieStore = await cookies()
  const supabase = createServerActionClient<Database>({
    cookies: () => cookieStore
  })
  const { data } = await supabase
    .from('chats')
    .select('payload')
    .eq('id', id)
    .not('payload->sharePath', 'is', null)
    .maybeSingle()

  return (data?.payload as Chat) ?? null
}

export async function shareChat(chat: Chat) {
  // Demo mode: return mock share path without writing
  if (isDemoMode()) {
    return {
      ...chat,
      sharePath: `/share/${chat.id}`
    }
  }

  const payload = {
    ...chat,
    sharePath: `/share/${chat.id}`
  }

  const cookieStore = await cookies()
  const supabase = createServerActionClient<Database>({
    cookies: () => cookieStore
  })
  await supabase
    .from('chats')
    .update({ payload: payload as any })
    .eq('id', chat.id)
    .throwOnError()

  return payload
}
