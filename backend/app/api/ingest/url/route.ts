import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { Database } from '@/lib/types/database'
import { SupabaseTenantClient } from '../../../../lib/supabase-tenant'
import { createGeminiEmbeddings } from '../../../../lib/gemini-embeddings'
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter'
import { Document } from 'langchain/document'

// Custom web loader for URL content extraction
class CustomWebLoader {
  constructor(public webPath: string) {}

  static async _scrape(url: string) {
    const { load } = await import('cheerio')
    const response = await fetch(url)
    const html = await response.text()
    return load(html)
  }

  async scrape() {
    return CustomWebLoader._scrape(this.webPath)
  }

  async load(): Promise<Document[]> {
    const $ = await this.scrape()
    const title = $('h1.entry-title').text() || $('h1').text() || $('title').text()
    const date = $('meta[property="article:published_time"]').attr('content') || 
                 $('meta[name="date"]').attr('content') ||
                 $('meta[property="article:modified_time"]').attr('content')

    // Try multiple content selectors for better compatibility
    let content = ''
    const contentSelectors = [
      '.entry-content',
      '.post-content', 
      '.article-content',
      'article',
      '.content',
      'main'
    ]

    for (const selector of contentSelectors) {
      const element = $(selector)
      if (element.length > 0) {
        content = element
          .clone()
          .find('div.elementor, style, script, nav, header, footer')
          .remove()
          .end()
          .text()
        break
      }
    }

    // Fallback to body if no content found
    if (!content) {
      content = $('body')
        .clone()
        .find('nav, header, footer, script, style')
        .remove()
        .end()
        .text()
    }

    const cleanedContent = content.replace(/\s+/g, ' ').trim()
    const contentLength = cleanedContent?.match(/\b\w+\b/g)?.length ?? 0

    const metadata = { 
      source: this.webPath, 
      title, 
      date, 
      contentLength,
      type: 'url'
    }

    return [new Document({ pageContent: cleanedContent, metadata })]
  }
}

// Authenticate tenant via API key
async function authenticateTenant(apiKey: string): Promise<string | null> {
  const supabase = createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { data: tenant, error } = await supabase
    .from('tenants')
    .select('id')
    .eq('api_key', apiKey)
    .single()

  if (error || !tenant) {
    return null
  }

  return tenant.id
}

// Extract text from URL
async function extractTextFromUrl(url: string): Promise<Document[]> {
  try {
    const loader = new CustomWebLoader(url)
    const docs = await loader.load()
    return docs
  } catch (error) {
    console.error(`Error extracting text from ${url}:`, error)
    throw new Error(`Failed to extract text from URL: ${error}`)
  }
}

// Split documents into chunks
async function splitDocuments(docs: Document[]): Promise<Document[]> {
  const textSplitter = new RecursiveCharacterTextSplitter({
    chunkSize: 1000,
    chunkOverlap: 200,
  })

  return await textSplitter.splitDocuments(docs)
}

// Generate embeddings and store in database
async function embedAndStoreDocuments(
  tenantId: string,
  docs: Document[]
): Promise<{ documentId: number; sectionsCount: number }> {
  const supabase = createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  // Create document record
  const { data: document, error: docError } = await supabase
    .from('documents')
    .insert({
      // For the demo version we store minimal metadata that matches the
      // Supabase `documents` table schema defined in `Database`
      name: docs[0]?.metadata?.title || 'URL Content',
      storage_object_id: docs[0]?.metadata?.source || '',
      tenant_id: tenantId
    })
    .select('id')
    .single()

  if (docError || !document) {
    throw new Error(`Failed to create document: ${docError?.message}`)
  }

  // Generate embeddings for each chunk using Gemini
  const geminiEmbeddings = createGeminiEmbeddings()
  const sections = []
  
  for (const doc of docs) {
    const embedding = await geminiEmbeddings.embedQuery(doc.pageContent)
    
    sections.push({
      document_id: document.id,
      content: doc.pageContent,
      embedding,
      tenant_id: tenantId
    })
  }

  // Insert document sections with embeddings
  const { error: sectionsError } = await supabase
    .from('document_sections')
    .insert(sections)

  if (sectionsError) {
    throw new Error(`Failed to store document sections: ${sectionsError.message}`)
  }

  return {
    documentId: document.id,
    sectionsCount: sections.length
  }
}

// Handle CORS preflight
export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  })
}

export async function POST(request: NextRequest) {
  try {
    // Get API key from Authorization header
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Missing or invalid authorization header' },
        {
          status: 401,
          headers: {
            'Access-Control-Allow-Origin': '*',
          },
        }
      )
    }

    const apiKey = authHeader.replace('Bearer ', '')
    
    // Authenticate tenant
    const tenantId = await authenticateTenant(apiKey)
    if (!tenantId) {
      return NextResponse.json(
        { error: 'Invalid API key' },
        { status: 401 }
      )
    }

    // Parse request body
    const body = await request.json()
    const { url } = body

    if (!url) {
      return NextResponse.json(
        { error: 'URL is required' },
        { status: 400 }
      )
    }

    // Validate URL
    try {
      new URL(url)
    } catch {
      return NextResponse.json(
        { error: 'Invalid URL format' },
        { status: 400 }
      )
    }

    // Extract text from URL
    const rawDocs = await extractTextFromUrl(url)
    
    if (rawDocs.length === 0 || !rawDocs[0].pageContent.trim()) {
      return NextResponse.json(
        { error: 'No content found at the provided URL' },
        { status: 400 }
      )
    }

    // Split into chunks
    const chunkedDocs = await splitDocuments(rawDocs)

    // Generate embeddings and store using Gemini
    const result = await embedAndStoreDocuments(tenantId, chunkedDocs)

    // Track usage
    const today = new Date().toISOString().split('T')[0]
    const supabaseForTracking = createClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )
    
    const { data: existing } = await supabaseForTracking
      .from('requests')
      .select('id, count')
      .eq('tenant_id', tenantId)
      .eq('endpoint', '/api/ingest/url')
      .eq('day', today)
      .maybeSingle()

    if (existing) {
      await supabaseForTracking
        .from('requests')
        .update({ count: existing.count + 1 })
        .eq('id', existing.id)
    } else {
      await supabaseForTracking
        .from('requests')
        .insert({
          tenant_id: tenantId,
          endpoint: '/api/ingest/url',
          day: today,
          count: 1
        })
    }

    return NextResponse.json({
      success: true,
      documentId: result.documentId,
      sectionsCount: result.sectionsCount,
      message: `Successfully ingested ${result.sectionsCount} sections from URL`
    }, {
      headers: {
        'Access-Control-Allow-Origin': '*',
      },
    })

  } catch (error) {
    console.error('URL ingestion error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { 
        status: 500,
        headers: {
          'Access-Control-Allow-Origin': '*',
        },
      }
    )
  }
}
