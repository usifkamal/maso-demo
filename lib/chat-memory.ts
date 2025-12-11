'use server'

import { createServerSupabase } from './supabaseClient'
import { cookies } from 'next/headers'

/**
 * Save a chat message pair to chat memory
 */
export async function saveChatMemory(
  sessionId: string,
  tenantId: string,
  userMessage: string,
  aiMessage: string,
  metadata?: Record<string, any>
) {
  try {
    const cookieStore = await cookies()
    const supabase = createServerSupabase({ cookieStoreOrFn: cookieStore })

    const { error } = await supabase
      .from('chat_memory')
      .insert({
        session_id: sessionId,
        tenant_id: tenantId,
        user_message: userMessage,
        ai_message: aiMessage,
        metadata: metadata || {}
      })

    if (error) {
      console.error('Error saving chat memory:', error)
      throw error
    }

    return { success: true }
  } catch (error) {
    console.error('Failed to save chat memory:', error)
    return { success: false, error }
  }
}

/**
 * Retrieve chat history for a session (last N messages)
 */
export async function getChatMemory(
  sessionId: string,
  tenantId: string,
  limit: number = 10
): Promise<Array<{ user_message: string; ai_message: string }>> {
  try {
    const cookieStore = await cookies()
    const supabase = createServerSupabase({ cookieStoreOrFn: cookieStore })

    const { data, error } = await supabase
      .from('chat_memory')
      .select('user_message, ai_message')
      .eq('session_id', sessionId)
      .eq('tenant_id', tenantId)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) {
      console.error('Error fetching chat memory:', error)
      throw error
    }

    // Reverse to get chronological order
    return (data || []).reverse()
  } catch (error) {
    console.error('Failed to fetch chat memory:', error)
    return []
  }
}

/**
 * Clear chat memory for a session
 */
export async function clearChatMemory(sessionId: string, tenantId: string) {
  try {
    const cookieStore = await cookies()
    const supabase = createServerSupabase({ cookieStoreOrFn: cookieStore })

    const { error } = await supabase
      .from('chat_memory')
      .delete()
      .eq('session_id', sessionId)
      .eq('tenant_id', tenantId)

    if (error) {
      console.error('Error clearing chat memory:', error)
      throw error
    }

    return { success: true }
  } catch (error) {
    console.error('Failed to clear chat memory:', error)
    return { success: false, error }
  }
}






