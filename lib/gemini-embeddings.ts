/**
 * Gemini Embeddings Wrapper
 * Provides a similar interface to OpenAI embeddings using Google's Gemini API
 */

import { GoogleGenerativeAI } from '@google/generative-ai'

export class GeminiEmbeddings {
  private genAI: GoogleGenerativeAI
  private model: any

  constructor(apiKey: string) {
    this.genAI = new GoogleGenerativeAI(apiKey)
    // Use text-embedding-004 model for embeddings (768 dimensions)
    this.model = this.genAI.getGenerativeModel({ model: 'models/text-embedding-004' })
  }

  /**
   * Generate embedding for a single text query
   * Compatible with LangChain's OpenAIEmbeddings interface
   */
  async embedQuery(text: string): Promise<number[]> {
    try {
      const result = await this.model.embedContent(text)
      const embedding = result.embedding
      
      // Return the embedding values as a number array
      return embedding.values || []
    } catch (error) {
      console.error('Error generating Gemini embedding:', error)
      throw new Error(`Failed to generate embedding: ${error}`)
    }
  }

  /**
   * Generate embeddings for multiple documents
   * Compatible with LangChain's OpenAIEmbeddings interface
   */
  async embedDocuments(texts: string[]): Promise<number[][]> {
    try {
      const embeddings: number[][] = []
      
      // Gemini API: embed each document one by one
      // Note: For production, consider batching and rate limiting
      for (const text of texts) {
        const embedding = await this.embedQuery(text)
        embeddings.push(embedding)
      }
      
      return embeddings
    } catch (error) {
      console.error('Error generating Gemini embeddings:', error)
      throw new Error(`Failed to generate embeddings: ${error}`)
    }
  }
}

/**
 * Helper function to create Gemini embeddings instance
 */
export function createGeminiEmbeddings(): GeminiEmbeddings {
  const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY
  
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY or GOOGLE_API_KEY not found in environment variables')
  }
  
  return new GeminiEmbeddings(apiKey)
}

