# Backend API Usage Guide

This document explains how to use the new ingest APIs for URL and file processing in the White-Label AI Chatbot Platform.

## 🔗 API Endpoints

### POST /api/ingest/url
Ingest content from a URL by extracting text, chunking, and storing with embeddings.

**Headers:**
```
Authorization: Bearer <tenant_api_key>
Content-Type: application/json
```

**Request Body:**
```json
{
  "url": "https://example.com/article"
}
```

**Response:**
```json
{
  "success": true,
  "documentId": 123,
  "sectionsCount": 15,
  "message": "Successfully ingested 15 sections from URL"
}
```

### POST /api/ingest/upload
Upload and process a file (PDF, TXT, DOCX, DOC).

**Headers:**
```
Authorization: Bearer <tenant_api_key>
Content-Type: multipart/form-data
```

**Request Body:**
```
file: <file_binary_data>
```

**Response:**
```json
{
  "success": true,
  "documentId": 124,
  "sectionsCount": 8,
  "fileName": "document.pdf",
  "fileSize": 1024000,
  "message": "Successfully ingested 8 sections from file"
}
```

## 🚀 Frontend SDK Usage

### Basic Setup

```typescript
import { createChatbotAPI, createDefaultChatbotAPI } from '@/lib/api'

// Option 1: Create with custom configuration
const api = createChatbotAPI('http://localhost:3000', 'your-tenant-api-key')

// Option 2: Create with default configuration (uses env vars)
const api = createDefaultChatbotAPI('your-tenant-api-key')
```

### URL Ingestion

```typescript
// Single URL
try {
  const result = await api.ingestUrl('https://example.com/article')
  console.log(`Ingested ${result.sectionsCount} sections from URL`)
} catch (error) {
  console.error('Failed to ingest URL:', error)
}

// Multiple URLs
const urls = [
  'https://example.com/article1',
  'https://example.com/article2',
  'https://example.com/article3'
]

const results = await api.ingestUrls(urls)
results.forEach((result, index) => {
  if (result.success) {
    console.log(`URL ${index + 1}: ${result.sectionsCount} sections ingested`)
  } else {
    console.error(`URL ${index + 1}: ${result.message}`)
  }
})
```

### File Upload

```typescript
// Single file
const fileInput = document.getElementById('file-input') as HTMLInputElement
const file = fileInput.files?.[0]

if (file) {
  try {
    const result = await api.ingestFile(file)
    console.log(`Ingested ${result.sectionsCount} sections from ${result.fileName}`)
  } catch (error) {
    console.error('Failed to ingest file:', error)
  }
}

// Multiple files
const fileInput = document.getElementById('file-input') as HTMLInputElement
const files = Array.from(fileInput.files || [])

if (files.length > 0) {
  const results = await api.ingestFiles(files)
  results.forEach((result, index) => {
    if (result.success) {
      console.log(`File ${index + 1}: ${result.sectionsCount} sections ingested`)
    } else {
      console.error(`File ${index + 1}: ${result.message}`)
    }
  })
}
```

### React Component Example

```tsx
import React, { useState } from 'react'
import { createDefaultChatbotAPI } from '@/lib/api'

export function DocumentUploader() {
  const [isUploading, setIsUploading] = useState(false)
  const [results, setResults] = useState<any[]>([])

  const api = createDefaultChatbotAPI()

  const handleUrlSubmit = async (url: string) => {
    setIsUploading(true)
    try {
      const result = await api.ingestUrl(url)
      setResults(prev => [...prev, { type: 'url', ...result }])
    } catch (error) {
      console.error('URL ingestion failed:', error)
    } finally {
      setIsUploading(false)
    }
  }

  const handleFileUpload = async (file: File) => {
    setIsUploading(true)
    try {
      const result = await api.ingestFile(file)
      setResults(prev => [...prev, { type: 'file', ...result }])
    } catch (error) {
      console.error('File ingestion failed:', error)
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div>
      <h2>Document Uploader</h2>
      
      {/* URL Input */}
      <div>
        <input 
          type="url" 
          placeholder="Enter URL to ingest"
          onKeyPress={(e) => {
            if (e.key === 'Enter') {
              handleUrlSubmit(e.currentTarget.value)
            }
          }}
        />
      </div>

      {/* File Upload */}
      <div>
        <input 
          type="file" 
          accept=".pdf,.txt,.docx,.doc"
          onChange={(e) => {
            const file = e.target.files?.[0]
            if (file) handleFileUpload(file)
          }}
        />
      </div>

      {/* Results */}
      {results.map((result, index) => (
        <div key={index}>
          <p>{result.type}: {result.sectionsCount} sections ingested</p>
        </div>
      ))}

      {isUploading && <p>Processing...</p>}
    </div>
  )
}
```

## 🔧 Environment Configuration

### Backend Environment Variables

```env
# Required for backend APIs
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
OPENAI_API_KEY=your-openai-api-key

# Optional
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Frontend Environment Variables

```env
# Required for frontend SDK
NEXT_PUBLIC_BACKEND_URL=http://localhost:3000
NEXT_PUBLIC_TENANT_API_KEY=your-tenant-api-key

# Optional
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

## 📋 Supported File Types

- **PDF**: `.pdf` files
- **Text**: `.txt` files  
- **Word Documents**: `.docx`, `.doc` files
- **URLs**: Any accessible web page

## 🛡️ Authentication

All API endpoints require Bearer token authentication using the tenant's API key:

```typescript
const headers = {
  'Authorization': `Bearer ${tenantApiKey}`,
  'Content-Type': 'application/json'
}
```

## 📊 Response Format

### Success Response
```json
{
  "success": true,
  "documentId": 123,
  "sectionsCount": 15,
  "message": "Successfully ingested 15 sections from URL",
  "fileName": "document.pdf",  // Only for file uploads
  "fileSize": 1024000         // Only for file uploads
}
```

### Error Response
```json
{
  "error": "Error message",
  "details": "Additional error details"
}
```

## 🔍 Error Handling

Common error scenarios:

- **401 Unauthorized**: Invalid or missing API key
- **400 Bad Request**: Invalid URL, unsupported file type, or missing file
- **413 Payload Too Large**: File size exceeds 10MB limit
- **500 Internal Server Error**: Server-side processing error

## 🚀 Deployment Notes

1. Ensure all required dependencies are installed in the backend
2. Configure environment variables for both backend and frontend
3. Set up tenant API keys in the database
4. Test the endpoints with sample URLs and files
5. Monitor embedding generation and storage performance

## 📈 Performance Considerations

- **File Size Limit**: 10MB per file
- **Chunk Size**: 1000 characters with 200 character overlap
- **Embedding Model**: OpenAI text-embedding-ada-002
- **Vector Storage**: pgvector with HNSW indexing for fast similarity search

## 🔄 Batch Processing

The SDK supports batch processing for multiple URLs and files:

```typescript
// Process multiple URLs
const urlResults = await api.ingestUrls(['url1', 'url2', 'url3'])

// Process multiple files
const fileResults = await api.ingestFiles([file1, file2, file3])
```

Each batch operation processes items sequentially to avoid overwhelming the API and embedding service.
