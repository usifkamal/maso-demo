import 'server-only'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import { Database } from '@/lib/db_types'

import { auth } from '@/auth'
import { nanoid } from '@/lib/utils'
import { trackUsage } from '@/lib/track-usage'
import { isDemoMode } from '@/lib/env'
import { getMockAIResponse, MOCK_CHATS } from '@/lib/demo'

// Remove edge runtime - Gemini SDK needs Node.js runtime
// export const runtime = 'edge'

/**
 * Search for relevant document sections using RAG (Retrieval Augmented Generation)
 */
async function searchDocuments(query: string, apiKey: string): Promise<string> {
  try {
    console.log('  📝 Creating embedding for query...')
    // Create Gemini embeddings for the query
    const genAI = new GoogleGenerativeAI(apiKey)
    const embeddingModel = genAI.getGenerativeModel({ model: 'models/text-embedding-004' })
    
    const result = await embeddingModel.embedContent(query)
    const queryEmbedding = result.embedding.values
    console.log(`  ✅ Embedding created (${queryEmbedding.length} dimensions)`)
    
    // Search document_sections table using vector similarity
    const supabase = createClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )
    
    console.log('  🔎 Searching database for similar documents...')
    const { data: sections, error } = await supabase.rpc('match_document_sections', {
      query_embedding: queryEmbedding,
      match_threshold: 0.5,
      match_count: 5
    })
    
    if (error) {
      console.error('  ❌ Error searching documents:', error)
      return ''
    }
    
    if (!sections || sections.length === 0) {
      console.log('  ℹ️ No matching sections found')
      return ''
    }
    
    console.log(`  ✅ Found ${sections.length} matching sections`)
    
    // Combine the top matching sections
    const context = sections
      .map((section: any) => section.content)
      .join('\n\n')
    
    return context
  } catch (error) {
    console.error('  ❌ Error in searchDocuments:', error)
    return ''
  }
}

export async function POST(req: Request) {
  // Demo mode: return fake AI response
  if (isDemoMode()) {
    const json = await req.json()
    const { messages } = json
    const lastMessage = messages[messages.length - 1]?.content || ''
    const mockResponse = getMockAIResponse(lastMessage)
    
    // Simulate streaming response in demo mode
    const encoder = new TextEncoder()
    const stream = new ReadableStream({
      start(controller) {
        // Simulate streaming by sending chunks
        const words = mockResponse.split(' ')
        let index = 0
        
        const interval = setInterval(() => {
          if (index < words.length) {
            const chunk = (index === 0 ? '' : ' ') + words[index]
            controller.enqueue(encoder.encode(chunk))
            index++
          } else {
            clearInterval(interval)
            controller.close()
          }
        }, 50) // 50ms delay between words
      }
    })
    
    return new Response(stream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Transfer-Encoding': 'chunked'
      }
    })
  }

  const cookieStore = await cookies()
  const supabase = createRouteHandlerClient<Database>({
    cookies: () => cookieStore
  })
  const json = await req.json()
  const { messages } = json
  const session = await auth({ cookieStore })
  const userId = session?.user.id

  if (!userId) {
    return new Response('Unauthorized', {
      status: 401
    })
  }

  // Get tenant ID for tracking
  const tenantId = session.user.user_metadata?.tenant_id || userId

  // Track chat usage (async, don't await - fire and forget)
  trackUsage(tenantId, '/api/chat', userId, supabase).catch(err => 
    console.error('Failed to track chat usage:', err)
  )

  try {
    // Initialize Gemini with API key
    const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY
    if (!apiKey) {
      console.error('GEMINI_API_KEY not found in environment')
      return new Response('API key not configured', { status: 500 })
    }
    
    const genAI = new GoogleGenerativeAI(apiKey)
    
    // Use Gemini Flash Latest - routes to the latest stable flash model
    const model = genAI.getGenerativeModel({ model: 'models/gemini-flash-latest' })

    const lastMessage = messages[messages.length - 1].content
    
    console.log('🔍 Searching for relevant documents...')
    // Search for relevant documents using RAG
    const context = await searchDocuments(lastMessage, apiKey)
    
    const hasDocumentContext = !!context
    
    if (hasDocumentContext) {
      console.log('✅ Found context - Using RAG with regular response')
    } else {
      console.log('ℹ️ No relevant documents found - Using streaming response for general knowledge')
    }
    
    // Prepare the prompt with context if available
    let enhancedMessage = lastMessage
    if (hasDocumentContext) {
      enhancedMessage = `Context from uploaded documents:
${context}

Based on the above context, please answer the following question:
${lastMessage}`
    }

    // Convert messages to Gemini format
    const history = messages.slice(0, -1).map((msg: any) => ({
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: msg.content }]
    }))

    // Start chat with history
    const chat = model.startChat({
      history,
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 1000,
      }
    })

    // DUAL APPROACH: Use regular response for RAG, streaming for general questions
    if (hasDocumentContext) {
      // ========== RAG MODE: Regular Response ==========
      console.log('📄 RAG Mode: Using regular response')
      const result = await chat.sendMessage(enhancedMessage)
      const response = await result.response
      const fullResponse = response.text()
      console.log(`✅ Got RAG response from Gemini (${fullResponse.length} chars)`)
      
      // Save chat to database
      const title = messages[0].content.substring(0, 100)
      const id = json.id ?? nanoid()
      const createdAt = Date.now()
      const path = `/chat/${id}`
      const payload = {
        id,
        title,
        userId,
        createdAt,
        path,
        messages: [
          ...messages,
          {
            content: fullResponse,
            role: 'assistant'
          }
        ]
      }
      
      console.log('💾 Saving RAG chat to database...')
      await supabase.from('chats').upsert({ id, user_id: userId, payload }).throwOnError()
      console.log('✅ RAG chat saved!')
      
      // Return the response as a simple text response
      return new Response(fullResponse, {
        headers: {
          'Content-Type': 'text/plain; charset=utf-8'
        }
      })
    } else {
      // ========== STREAMING MODE: General Questions ==========
      console.log('🌊 Streaming Mode: Using streaming response')
      const result = await chat.sendMessageStream(enhancedMessage)
      
      // Create a readable stream
      const encoder = new TextEncoder()
      let fullResponse = ''
      
      const stream = new ReadableStream({
        async start(controller) {
          try {
            console.log('📡 Starting stream...')
            let chunkCount = 0
            
            for await (const chunk of result.stream) {
              const text = chunk.text()
              fullResponse += text
              controller.enqueue(encoder.encode(text))
              chunkCount++
            }
            
            console.log(`✅ Stream complete! Received ${chunkCount} chunks, total ${fullResponse.length} chars`)
            controller.close()
            
            // Save chat to database after streaming is complete
            const title = messages[0].content.substring(0, 100)
            const id = json.id ?? nanoid()
            const createdAt = Date.now()
            const path = `/chat/${id}`
            const payload = {
              id,
              title,
              userId,
              createdAt,
              path,
              messages: [
                ...messages,
                {
                  content: fullResponse,
                  role: 'assistant'
                }
              ]
            }
            
            console.log('💾 Saving streaming chat to database...')
            await supabase.from('chats').upsert({ id, user_id: userId, payload }).throwOnError()
            console.log('✅ Streaming chat saved!')
          } catch (error) {
            console.error('❌ Stream error:', error)
            controller.error(error)
          }
        }
      })
      
      return new Response(stream, {
        headers: {
          'Content-Type': 'text/plain; charset=utf-8',
          'Transfer-Encoding': 'chunked'
        }
      })
    }
  } catch (error) {
    console.error('Chat error:', error)
    return new Response(JSON.stringify({ error: 'Failed to generate response' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}
