import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { Database } from '@/lib/types/database'
import { createGeminiEmbeddings } from '../../../../lib/gemini-embeddings'
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter'
import { Document } from 'langchain/document'

export const runtime = 'nodejs'

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

// Extract text from uploaded file
async function extractTextFromFile(file: File): Promise<Document[]> {
  const fileType = file.type
  const fileName = file.name
  const fileBuffer = Buffer.from(await file.arrayBuffer())

  try {
    let content = ''
    
    // Simple text extraction based on file type
    if (fileType === 'application/pdf') {
      // For PDF, use pdf-parse with dynamic import
      try {
        // Dynamically import pdf-parse
        const pdfParse = await import('pdf-parse').then(mod => mod.default || mod)
        
        // Parse the PDF buffer
        const pdfData = await pdfParse(fileBuffer, {
          max: 0, // Parse all pages
          version: 'v2.0.550' // Specify version to avoid issues
        })
        
        content = pdfData.text || ''
        
        if (!content || content.trim().length === 0) {
          throw new Error('PDF appears to be empty or contains only images. Please use a PDF with selectable text.')
        }
      } catch (parseError: any) {
        console.error('PDF parsing failed:', parseError)
        
        // Check if it's the test file issue (ignore it)
        if (parseError.message && parseError.message.includes('test/data')) {
          console.log('Ignoring pdf-parse test file error, retrying...')
          // Retry once more
          try {
            const pdfParse = await import('pdf-parse').then(mod => mod.default || mod)
            const pdfData = await pdfParse(fileBuffer)
            content = pdfData.text || ''
            
            if (!content || content.trim().length === 0) {
              throw new Error('PDF appears to be empty or contains only images.')
            }
          } catch (retryError: any) {
            throw new Error(`Failed to parse PDF after retry: ${retryError.message}`)
          }
        } else {
          // Provide helpful error message
          if (parseError.message && parseError.message.includes('empty')) {
            throw parseError
          }
          throw new Error(`Failed to parse PDF: ${parseError.message || 'Unknown error'}. The PDF might be corrupted or contain only images.`)
        }
      }
    } else if (fileType === 'text/plain' || fileName.endsWith('.txt')) {
      // For text files, just convert buffer to string
      content = fileBuffer.toString('utf-8')
      
      if (!content || content.trim().length === 0) {
        throw new Error('Text file is empty')
      }
    } else if (fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || 
               fileName.endsWith('.docx')) {
      // For DOCX, we'll need to use a library like mammoth
      // For now, return an error message
      throw new Error('DOCX files are not yet supported. Please convert to PDF or TXT.')
    } else {
      throw new Error(`Unsupported file type: ${fileType}. Supported types: PDF, TXT`)
    }

    // Create document with metadata
    const doc = new Document({
      pageContent: content.trim(),
      metadata: {
        source: fileName,
        type: 'file',
        fileType: fileType
      }
    })

    return [doc]
  } catch (error) {
    console.error(`Error extracting text from file ${fileName}:`, error)
    throw new Error(`Failed to extract text from file: ${error instanceof Error ? error.message : 'Unknown error'}`)
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
  docs: Document[],
  fileName: string
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
      name: fileName,
      storage_object_id: `demo-file://${fileName}`,
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

    // Parse multipart form data
    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      )
    }

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024 // 10MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'File size exceeds 10MB limit' },
        { status: 400 }
      )
    }

    // Validate file type
    const allowedTypes = [
      'application/pdf',
      'text/plain'
    ]
    
    const allowedExtensions = ['.pdf', '.txt']
    const hasValidType = allowedTypes.includes(file.type)
    const hasValidExtension = allowedExtensions.some(ext => file.name.toLowerCase().endsWith(ext))
    
    if (!hasValidType && !hasValidExtension) {
      return NextResponse.json(
        { error: 'Unsupported file type. Supported types: PDF, TXT' },
        { status: 400 }
      )
    }

    // Extract text from file
    const rawDocs = await extractTextFromFile(file)
    
    if (rawDocs.length === 0 || !rawDocs[0].pageContent.trim()) {
      return NextResponse.json(
        { error: 'No text content found in the uploaded file' },
        { status: 400 }
      )
    }

    // Split into chunks
    const chunkedDocs = await splitDocuments(rawDocs)

    // Generate embeddings and store using Gemini
    const result = await embedAndStoreDocuments(tenantId, chunkedDocs, file.name)

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
      .eq('endpoint', '/api/ingest/upload')
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
          endpoint: '/api/ingest/upload',
          day: today,
          count: 1
        })
    }

    return NextResponse.json({
      success: true,
      documentId: result.documentId,
      sectionsCount: result.sectionsCount,
      fileName: file.name,
      fileSize: file.size,
      message: `Successfully ingested ${result.sectionsCount} sections from file`
    }, {
      headers: {
        'Access-Control-Allow-Origin': '*',
      },
    })

  } catch (error) {
    console.error('File upload ingestion error:', error)
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
