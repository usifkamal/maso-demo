/**
 * Frontend SDK for White-Label AI Chatbot Platform
 * Provides methods to interact with the backend ingest APIs
 */

export interface IngestResponse {
  success: boolean
  documentId: number
  sectionsCount: number
  message: string
  fileName?: string
  fileSize?: number
}

export interface IngestError {
  error: string
  details?: string
}

export class ChatbotAPI {
  private baseUrl: string
  private apiKey: string

  constructor(baseUrl: string, apiKey: string) {
    this.baseUrl = baseUrl.replace(/\/$/, '') // Remove trailing slash
    this.apiKey = apiKey
  }

  /**
   * Ingest content from a URL
   * @param url - The URL to extract content from
   * @returns Promise<IngestResponse>
   */
  async ingestUrl(url: string): Promise<IngestResponse> {
    const response = await fetch(`${this.baseUrl}/api/ingest/url`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`
      },
      body: JSON.stringify({ url })
    })

    if (!response.ok) {
      const error: IngestError = await response.json()
      throw new Error(error.error || `HTTP ${response.status}: ${response.statusText}`)
    }

    return await response.json()
  }

  /**
   * Ingest content from a file upload
   * @param file - The file to upload and process
   * @returns Promise<IngestResponse>
   */
  async ingestFile(file: File): Promise<IngestResponse> {
    const formData = new FormData()
    formData.append('file', file)

    const response = await fetch(`${this.baseUrl}/api/ingest/upload`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`
      },
      body: formData
    })

    if (!response.ok) {
      const error: IngestError = await response.json()
      throw new Error(error.error || `HTTP ${response.status}: ${response.statusText}`)
    }

    return await response.json()
  }

  /**
   * Ingest multiple URLs in batch
   * @param urls - Array of URLs to process
   * @returns Promise<IngestResponse[]>
   */
  async ingestUrls(urls: string[]): Promise<IngestResponse[]> {
    const results: IngestResponse[] = []
    
    for (const url of urls) {
      try {
        const result = await this.ingestUrl(url)
        results.push(result)
      } catch (error) {
        console.error(`Failed to ingest URL ${url}:`, error)
        results.push({
          success: false,
          documentId: 0,
          sectionsCount: 0,
          message: `Failed to ingest ${url}: ${error instanceof Error ? error.message : 'Unknown error'}`
        })
      }
    }

    return results
  }

  /**
   * Ingest multiple files in batch
   * @param files - Array of files to process
   * @returns Promise<IngestResponse[]>
   */
  async ingestFiles(files: File[]): Promise<IngestResponse[]> {
    const results: IngestResponse[] = []
    
    for (const file of files) {
      try {
        const result = await this.ingestFile(file)
        results.push(result)
      } catch (error) {
        console.error(`Failed to ingest file ${file.name}:`, error)
        results.push({
          success: false,
          documentId: 0,
          sectionsCount: 0,
          message: `Failed to ingest ${file.name}: ${error instanceof Error ? error.message : 'Unknown error'}`
        })
      }
    }

    return results
  }

  /**
   * Get ingestion status (placeholder for future implementation)
   * @param documentId - The document ID to check status for
   * @returns Promise<any>
   */
  async getIngestionStatus(documentId: number): Promise<any> {
    // This would be implemented when we add status tracking
    return {
      documentId,
      status: 'completed',
      message: 'Ingestion completed successfully'
    }
  }
}

/**
 * Create a new ChatbotAPI instance
 * @param baseUrl - The base URL of the backend API
 * @param apiKey - The tenant API key for authentication
 * @returns ChatbotAPI instance
 */
export function createChatbotAPI(baseUrl: string, apiKey: string): ChatbotAPI {
  return new ChatbotAPI(baseUrl, apiKey)
}

/**
 * Default API configuration
 */
export const defaultConfig = {
  baseUrl: process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3000',
  apiKey: process.env.NEXT_PUBLIC_TENANT_API_KEY || ''
}

/**
 * Create a ChatbotAPI instance with default configuration
 * @param apiKey - The tenant API key (optional, uses env var if not provided)
 * @returns ChatbotAPI instance
 */
export function createDefaultChatbotAPI(apiKey?: string): ChatbotAPI {
  const key = apiKey || defaultConfig.apiKey
  if (!key) {
    throw new Error('API key is required. Provide it as parameter or set NEXT_PUBLIC_TENANT_API_KEY environment variable.')
  }
  return new ChatbotAPI(defaultConfig.baseUrl, key)
}

// Export types for external use
export type { IngestResponse, IngestError }
