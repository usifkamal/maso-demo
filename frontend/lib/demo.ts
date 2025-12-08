/**
 * Demo mode mock data
 * Provides fake data for tenants, chats, documents, and analytics
 */

export interface MockTenant {
  id: string
  name: string
  domain: string | null
  api_key: string
  created_at: string
  settings?: Record<string, any>
}

export interface MockChat {
  id: string
  title: string
  createdAt: number
  path: string
  messages: Array<{
    role: 'user' | 'assistant'
    content: string
  }>
}

export interface MockDocument {
  id: string
  tenant_id: string
  title: string
  source: string
  content_path: string
  created_at: string
}

/**
 * Mock tenant data
 */
export const MOCK_TENANT: MockTenant = {
  id: 'demo-tenant-1',
  name: 'Demo Business',
  domain: 'demo.example.com',
  api_key: 'demo_api_key_12345',
  created_at: new Date().toISOString(),
  settings: {
    primaryColor: '#4F46E5',
    position: 'bottom-right',
    buttonText: '💬',
    greeting: 'Hello! How can I help you today?'
  }
}

/**
 * Mock chat sessions
 */
export const MOCK_CHATS: MockChat[] = [
  {
    id: 'demo-chat-1',
    title: 'Getting started with the platform',
    createdAt: Date.now() - 86400000, // 1 day ago
    path: '/chat/demo-chat-1',
    messages: [
      {
        role: 'user',
        content: 'What can this chatbot do?'
      },
      {
        role: 'assistant',
        content: 'This is a demo response. In demo mode, the chatbot can answer questions and help you explore the platform features. You can upload documents, ask questions, and interact with the AI assistant.'
      },
      {
        role: 'user',
        content: 'How do I upload documents?'
      },
      {
        role: 'assistant',
        content: 'This is a demo response. To upload documents, go to the Upload section in the dashboard. You can either upload files directly or provide URLs to crawl. The system will process and index your content for the AI to use in responses.'
      }
    ]
  },
  {
    id: 'demo-chat-2',
    title: 'Questions about features',
    createdAt: Date.now() - 3600000, // 1 hour ago
    path: '/chat/demo-chat-2',
    messages: [
      {
        role: 'user',
        content: 'What analytics are available?'
      },
      {
        role: 'assistant',
        content: 'This is a demo response. The analytics dashboard provides insights into your chatbot usage, including total chats, documents uploaded, and API usage over time. You can view trends and track engagement metrics.'
      }
    ]
  }
]

/**
 * Mock documents
 */
export const MOCK_DOCUMENTS: MockDocument[] = [
  {
    id: 'demo-doc-1',
    tenant_id: MOCK_TENANT.id,
    title: 'Getting Started Guide',
    source: 'upload',
    content_path: '/demo/getting-started.pdf',
    created_at: new Date(Date.now() - 172800000).toISOString() // 2 days ago
  },
  {
    id: 'demo-doc-2',
    tenant_id: MOCK_TENANT.id,
    title: 'API Documentation',
    source: 'https://example.com/api-docs',
    content_path: '/demo/api-docs.html',
    created_at: new Date(Date.now() - 86400000).toISOString() // 1 day ago
  },
  {
    id: 'demo-doc-3',
    tenant_id: MOCK_TENANT.id,
    title: 'Product Overview',
    source: 'upload',
    content_path: '/demo/product-overview.pdf',
    created_at: new Date(Date.now() - 43200000).toISOString() // 12 hours ago
  }
]

/**
 * Mock analytics data (last 30 days)
 */
export function getMockAnalytics() {
  const dates: string[] = []
  for (let i = 29; i >= 0; i--) {
    const date = new Date()
    date.setDate(date.getDate() - i)
    dates.push(date.toISOString().split('T')[0])
  }

  // Generate some variation in the data
  const chatsChart = dates.map((date, index) => ({
    date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    count: Math.floor(Math.random() * 10) + (index > 20 ? 5 : 0)
  }))

  const documentsChart = dates.map((date, index) => ({
    date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    count: index % 7 === 0 ? Math.floor(Math.random() * 3) : 0
  }))

  const apiUsageChart = dates.map((date, index) => ({
    date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    count: Math.floor(Math.random() * 50) + 20
  }))

  const totalChats = chatsChart.reduce((sum, item) => sum + item.count, 0)
  const totalDocuments = documentsChart.reduce((sum, item) => sum + item.count, 0)
  const totalApiCalls = apiUsageChart.reduce((sum, item) => sum + item.count, 0)

  return {
    chats: {
      data: chatsChart,
      total: totalChats
    },
    documents: {
      data: documentsChart,
      total: totalDocuments
    },
    apiUsage: {
      data: apiUsageChart,
      total: totalApiCalls
    }
  }
}

/**
 * Get mock AI response for demo mode
 */
export function getMockAIResponse(userMessage: string): string {
  const responses = [
    'This is a demo response. In demo mode, the chatbot provides sample answers to help you explore the platform.',
    'This is a demo response. The AI assistant can help answer questions based on uploaded documents and general knowledge.',
    'This is a demo response. You can interact with the chatbot to see how it works, but actual AI processing is disabled in demo mode.',
    'This is a demo response. Try uploading documents or asking different questions to explore the platform features.'
  ]
  
  // Return a contextual response based on keywords
  const lowerMessage = userMessage.toLowerCase()
  if (lowerMessage.includes('upload') || lowerMessage.includes('document')) {
    return 'This is a demo response. To upload documents, navigate to the Upload section. You can upload files or provide URLs to crawl. In demo mode, uploads are simulated and no actual data is stored.'
  }
  if (lowerMessage.includes('analytics') || lowerMessage.includes('stats')) {
    return 'This is a demo response. The analytics dashboard shows usage statistics including chats, documents, and API calls. In demo mode, you\'ll see sample data.'
  }
  if (lowerMessage.includes('help') || lowerMessage.includes('how')) {
    return 'This is a demo response. This is a white-label AI chatbot platform. You can customize the widget, upload documents, and interact with the AI assistant. All features are available in demo mode for exploration.'
  }
  
  // Return random response
  return responses[Math.floor(Math.random() * responses.length)]
}

