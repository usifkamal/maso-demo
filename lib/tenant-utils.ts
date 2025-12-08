import { createClient } from '@supabase/supabase-js'
import { Database, Tenant, User } from '@/lib/types/database'

export class TenantManager {
  private supabase: ReturnType<typeof createClient<Database>>

  constructor(supabase: ReturnType<typeof createClient<Database>>) {
    this.supabase = supabase
  }

  /**
   * Get the current user's tenant ID
   */
  async getCurrentUserTenantId(): Promise<string | null> {
    const { data, error } = await this.supabase.rpc('get_user_tenant_id')
    if (error) {
      console.error('Error getting user tenant ID:', error)
      return null
    }
    return data
  }

  /**
   * Check if user belongs to a specific tenant
   */
  async userBelongsToTenant(tenantId: string): Promise<boolean> {
    const { data, error } = await this.supabase.rpc('user_belongs_to_tenant', {
      tenant_id_param: tenantId
    })
    if (error) {
      console.error('Error checking tenant membership:', error)
      return false
    }
    return data
  }

  /**
   * Create a new tenant
   */
  async createTenant(tenantData: {
    name: string
    domain?: string
    apiKey: string
  }): Promise<Tenant | null> {
    const { data, error } = await this.supabase
      .from('tenants')
      .insert({
        name: tenantData.name,
        domain: tenantData.domain,
        api_key: tenantData.apiKey
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating tenant:', error)
      return null
    }
    return data
  }

  /**
   * Create a user for a tenant
   */
  async createUser(userData: {
    tenantId: string
    email: string
    role?: 'admin' | 'user'
  }): Promise<User | null> {
    const { data, error } = await this.supabase
      .from('users')
      .insert({
        tenant_id: userData.tenantId,
        email: userData.email,
        role: userData.role || 'user'
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating user:', error)
      return null
    }
    return data
  }

  /**
   * Get tenant by API key
   */
  async getTenantByApiKey(apiKey: string): Promise<Tenant | null> {
    const { data, error } = await this.supabase
      .from('tenants')
      .select('*')
      .eq('api_key', apiKey)
      .single()

    if (error) {
      console.error('Error getting tenant by API key:', error)
      return null
    }
    return data
  }

  /**
   * Get tenant by domain
   */
  async getTenantByDomain(domain: string): Promise<Tenant | null> {
    const { data, error } = await this.supabase
      .from('tenants')
      .select('*')
      .eq('domain', domain)
      .single()

    if (error) {
      console.error('Error getting tenant by domain:', error)
      return null
    }
    return data
  }

  /**
   * Search documents within a tenant
   */
  async searchDocumentsByTenant(
    tenantId: string,
    queryText: string,
    matchThreshold: number = 0.5,
    matchCount: number = 10
  ) {
    const { data, error } = await this.supabase.rpc('search_documents_by_tenant', {
      tenant_id_param: tenantId,
      query_text: queryText,
      match_threshold: matchThreshold,
      match_count: matchCount
    })

    if (error) {
      console.error('Error searching documents by tenant:', error)
      return []
    }
    return data
  }

  /**
   * Get all users in a tenant
   */
  async getTenantUsers(tenantId: string): Promise<User[]> {
    const { data, error } = await this.supabase
      .from('users')
      .select('*')
      .eq('tenant_id', tenantId)

    if (error) {
      console.error('Error getting tenant users:', error)
      return []
    }
    return data || []
  }

  /**
   * Log usage for a tenant
   */
  async logUsage(logData: {
    tenantId: string
    userId?: string
    action: string
    resourceType?: string
    resourceId?: string
    metadata?: Record<string, any>
  }) {
    const { error } = await this.supabase
      .from('usage_logs')
      .insert({
        tenant_id: logData.tenantId,
        user_id: logData.userId,
        action: logData.action,
        resource_type: logData.resourceType,
        resource_id: logData.resourceId,
        metadata: logData.metadata
      })

    if (error) {
      console.error('Error logging usage:', error)
    }
  }
}

/**
 * Middleware to extract tenant information from request
 */
export function extractTenantFromRequest(request: Request): {
  tenantId?: string
  apiKey?: string
  domain?: string
} {
  const url = new URL(request.url)
  const domain = url.hostname
  
  // Try to get API key from headers
  const apiKey = request.headers.get('x-api-key') || 
                 request.headers.get('authorization')?.replace('Bearer ', '')

  return {
    domain,
    apiKey
  }
}

/**
 * Generate a secure API key for a tenant
 */
export function generateApiKey(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let result = ''
  for (let i = 0; i < 32; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}
