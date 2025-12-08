'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { useChat } from 'ai/react'
import { IconGemini, IconUser, IconSend } from '@/components/ui/icons'
import { cn } from '@/lib/utils'

interface TenantConfig {
  tenantId: string
  name: string
  settings: {
    color: string
    position: string
    logoUrl?: string | null
    buttonText?: string
    greetingMessage?: string | null
  }
}

export default function EmbedChatPage() {
  const params = useParams()
  const botId = params.botId as string
  const [tenantConfig, setTenantConfig] = useState<TenantConfig | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const { messages, input, handleInputChange, handleSubmit, isLoading: isChatLoading } = useChat({
    api: '/api/chat',
    body: {
      botId
    },
    initialMessages: []
  })

  // Fetch tenant configuration
  useEffect(() => {
    async function fetchConfig() {
      try {
        // Use absolute URL to handle cross-origin scenarios
        const baseUrl = typeof window !== 'undefined' ? window.location.origin : ''
        const apiUrl = `${baseUrl}/api/tenant/${encodeURIComponent(botId)}`
        
        const res = await fetch(apiUrl, {
          cache: 'no-store',
        })
        
        if (res.ok) {
          const data = await res.json()
          setTenantConfig(data)
        } else {
          const errorData = await res.json().catch(() => ({ error: res.statusText }))
          console.error('Failed to fetch tenant config:', {
            status: res.status,
            statusText: res.statusText,
            error: errorData
          })
          // Set a default config so the widget still loads
          setTenantConfig({
            tenantId: botId,
            name: 'AI Assistant',
            settings: {
              color: '#4F46E5',
              position: 'bottom-right',
              logoUrl: null,
              buttonText: '💬',
              greetingMessage: 'Hello! How can I help you today?'
            }
          })
        }
      } catch (error) {
        console.error('Failed to fetch tenant settings:', error)
        // Set a default config so the widget still loads even if API fails
        setTenantConfig({
          tenantId: botId,
          name: 'AI Assistant',
          settings: {
            color: '#4F46E5',
            position: 'bottom-right',
            logoUrl: null,
            buttonText: '💬',
            greetingMessage: 'Hello! How can I help you today?'
          }
        })
      } finally {
        setIsLoading(false)
      }
    }

    if (botId) {
      fetchConfig()
    } else {
      setIsLoading(false)
    }
  }, [botId])

  // Listen for parent window messages
  useEffect(() => {
    function handleMessage(event: MessageEvent) {
      if (event.data.type === 'CHAT_WIDGET_OPENED') {
        // Focus input when widget is opened
        setTimeout(() => {
          const inputElement = document.getElementById('chat-input')
          inputElement?.focus()
        }, 100)
      }
    }

    window.addEventListener('message', handleMessage)
    return () => window.removeEventListener('message', handleMessage)
  }, [])

  // Send resize messages to parent (for responsive height)
  useEffect(() => {
    function notifyParentOfResize() {
      if (window.parent && window.parent !== window) {
        try {
          window.parent.postMessage({
            type: 'CHAT_WIDGET_RESIZE',
            height: document.documentElement.scrollHeight
          }, '*')
        } catch (e) {
          // Cross-origin, ignore
        }
      }
    }

    // Notify on mount and resize
    notifyParentOfResize()
    window.addEventListener('resize', notifyParentOfResize)
    const observer = new MutationObserver(notifyParentOfResize)
    observer.observe(document.body, { childList: true, subtree: true })

    return () => {
      window.removeEventListener('resize', notifyParentOfResize)
      observer.disconnect()
    }
  }, [])

  const primaryColor = tenantConfig?.settings?.color || '#4F46E5'
  const greeting = tenantConfig?.settings?.greetingMessage || 'Hello! How can I help you today?'
  const tenantName = tenantConfig?.name || 'AI Assistant'
  const logoUrl = tenantConfig?.settings?.logoUrl

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-950">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500 mx-auto"></div>
          <p className="mt-4 text-gray-400">Loading chat...</p>
        </div>
      </div>
    )
  }

  return (
    <div 
      className="flex h-screen flex-col bg-gray-950 text-gray-100" 
      style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}
    >
      {/* Header */}
      <div 
        className="flex items-center gap-3 p-4 border-b border-gray-800/40 transition-colors duration-300 ease-in-out"
        style={{ backgroundColor: primaryColor }}
      >
        {logoUrl && (
          <img 
            src={logoUrl} 
            alt={tenantName}
            className="w-8 h-8 rounded-full object-cover bg-white/20 border border-white/20"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none'
            }}
          />
        )}
        <div className="flex-1">
          <h1 className="text-white font-semibold text-lg">
            {tenantName}
          </h1>
          <p className="text-white/80 text-xs">Online</p>
        </div>
        <button
          onClick={() => {
            try {
              window.parent.postMessage({ type: 'CHAT_WIDGET_CLOSE' }, '*')
            } catch (e) {
              // Cross-origin, close window instead
              window.close()
            }
          }}
          className="text-white/80 hover:text-white transition-colors duration-300 ease-in-out p-1 rounded hover:bg-white/10"
          aria-label="Close chat"
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-950">
        {/* Greeting message */}
        {messages.length === 0 && (
          <div className="flex items-start gap-3">
            <div 
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-white transition-all duration-300 ease-in-out"
              style={{ backgroundColor: primaryColor }}
            >
              <IconGemini className="h-4 w-4" />
            </div>
            <div className="flex-1 space-y-1">
              <div className="bg-gray-800/60 backdrop-blur-sm rounded-lg rounded-tl-none p-3 border border-gray-800/40">
                <p className="text-sm text-gray-100">{greeting}</p>
              </div>
              <p className="text-xs text-gray-500">Just now</p>
            </div>
          </div>
        )}

        {/* Chat messages */}
        {messages.map((message, index) => (
          <div
            key={message.id || index}
            className={cn(
              'flex items-start gap-3 transition-all duration-300 ease-in-out',
              message.role === 'user' ? 'flex-row-reverse' : 'flex-row'
            )}
          >
            <div
              className={cn(
                'flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-all duration-300 ease-in-out',
                message.role === 'user'
                  ? 'bg-gray-700 text-gray-200'
                  : 'text-white'
              )}
              style={message.role === 'assistant' ? { backgroundColor: primaryColor } : {}}
            >
              {message.role === 'user' ? (
                <IconUser className="h-4 w-4" />
              ) : (
                <IconGemini className="h-4 w-4" />
              )}
            </div>
            <div className="flex-1 space-y-1 max-w-[75%]">
              <div
                className={cn(
                  'rounded-lg p-3 transition-all duration-300 ease-in-out',
                  message.role === 'user'
                    ? 'text-white rounded-tr-none'
                    : 'bg-gray-800/60 backdrop-blur-sm rounded-tl-none border border-gray-800/40'
                )}
                style={message.role === 'user' ? { backgroundColor: primaryColor } : {}}
              >
                <p className={cn(
                  'text-sm whitespace-pre-wrap break-words',
                  message.role === 'user' ? 'text-white' : 'text-gray-100'
                )}>
                  {message.content}
                </p>
              </div>
            </div>
          </div>
        ))}

        {/* Loading indicator */}
        {isChatLoading && (
          <div className="flex items-start gap-3">
            <div 
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-white transition-all duration-300 ease-in-out"
              style={{ backgroundColor: primaryColor }}
            >
              <IconGemini className="h-4 w-4" />
            </div>
            <div className="bg-gray-800/60 backdrop-blur-sm rounded-lg rounded-tl-none p-3 border border-gray-800/40">
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="border-t border-gray-800/40 p-4 bg-gray-900/40 backdrop-blur-sm">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            id="chat-input"
            type="text"
            value={input}
            onChange={handleInputChange}
            placeholder="Type your message..."
            className="flex-1 px-4 py-2 bg-gray-800/60 text-gray-100 border border-gray-700/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-300 ease-in-out text-sm placeholder-gray-500"
            disabled={isChatLoading}
            autoFocus
          />
          <button
            type="submit"
            disabled={!input.trim() || isChatLoading}
            className="px-4 py-2 text-white rounded-lg transition-all duration-300 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 hover:opacity-90"
            style={{ backgroundColor: primaryColor }}
          >
            <IconSend className="h-4 w-4" />
            <span className="text-sm font-medium">Send</span>
          </button>
        </form>
        <p className="text-xs text-gray-500 text-center mt-2">
          Powered by AI
        </p>
      </div>
    </div>
  )
}
