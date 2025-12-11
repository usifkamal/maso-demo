import { createClient } from '@supabase/supabase-js'
import { Database } from '@/lib/types/database'
import { TenantManager } from './tenant-utils'

export class SupabaseTenantClient {
  private supabase: ReturnType<typeof createClient<Database>>
  private tenantManager: TenantManager
  private currentTenantId: string | null = null

  constructor(
    supabaseUrl: string,
    supabaseKey: string,
    tenantId?: string
  ) {
    this.supabase = createClient<Database>(supabaseUrl, supabaseKey)
    this.tenantManager = new TenantManager(this.supabase)
    this.currentTenantId = tenantId || null
  }

  /**
   * Set the current tenant context
   */
  async setTenant(tenantId: string): Promise<boolean> {
    const belongs = await this.tenantManager.userBelongsToTenant(tenantId)
    if (belongs) {
      this.currentTenantId = tenantId
      return true
    }
    return false
  }

  /**
   * Get the current tenant ID
   */
  getCurrentTenantId(): string | null {
    return this.currentTenantId
  }

  /**
   * Get the tenant manager instance
   */
  getTenantManager(): TenantManager {
    return this.tenantManager
  }

  /**
   * Get the underlying Supabase client
   */
  getClient() {
    return this.supabase
  }

  /**
   * Create a document with tenant context
   */
  async createDocument(documentData: {
    name: string
    storageObjectId: string
    tenantId?: string
  }) {
    const tenantId = documentData.tenantId || this.currentTenantId
    if (!tenantId) {
      throw new Error('No tenant context available')
    }

    const { data, error } = await this.supabase
      .from('documents')
      .insert({
        name: documentData.name,
        storage_object_id: documentData.storageObjectId,
        tenant_id: tenantId
      })
      .select()
      .single()

    if (error) throw error
    return data
  }

  /**
   * Get documents for the current tenant
   */
  async getDocuments() {
    if (!this.currentTenantId) {
      throw new Error('No tenant context available')
    }

    const { data, error } = await this.supabase
      .from('documents')
      .select('*')
      .eq('tenant_id', this.currentTenantId)

    if (error) throw error
    return data
  }

  /**
   * Create a message with tenant context
   */
  async createMessage(messageData: {
    content: string
    role: 'user' | 'assistant' | 'system'
    userId?: string
    tenantId?: string
  }) {
    const tenantId = messageData.tenantId || this.currentTenantId
    if (!tenantId) {
      throw new Error('No tenant context available')
    }

    const { data, error } = await this.supabase
      .from('messages')
      .insert({
        content: messageData.content,
        role: messageData.role,
        user_id: messageData.userId,
        tenant_id: tenantId
      })
      .select()
      .single()

    if (error) throw error
    return data
  }

  /**
   * Get messages for the current tenant
   */
  async getMessages(limit: number = 50) {
    if (!this.currentTenantId) {
      throw new Error('No tenant context available')
    }

    const { data, error } = await this.supabase
      .from('messages')
      .select('*')
      .eq('tenant_id', this.currentTenantId)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) throw error
    return data
  }

  /**
   * Search documents within the current tenant
   */
  async searchDocuments(
    queryText: string,
    matchThreshold: number = 0.5,
    matchCount: number = 10
  ) {
    if (!this.currentTenantId) {
      throw new Error('No tenant context available')
    }

    return await this.tenantManager.searchDocumentsByTenant(
      this.currentTenantId,
      queryText,
      matchThreshold,
      matchCount
    )
  }

  /**
   * Log usage for the current tenant
   */
  async logUsage(logData: {
    action: string
    resourceType?: string
    resourceId?: string
    metadata?: Record<string, any>
    userId?: string
  }) {
    if (!this.currentTenantId) {
      throw new Error('No tenant context available')
    }

    await this.tenantManager.logUsage({
      tenantId: this.currentTenantId,
      userId: logData.userId,
      action: logData.action,
      resourceType: logData.resourceType,
      resourceId: logData.resourceId,
      metadata: logData.metadata
    })
  }
}

/**
 * Create a tenant-aware Supabase client
 */
export function createTenantClient(
  supabaseUrl: string,
  supabaseKey: string,
  tenantId?: string
): SupabaseTenantClient {
  return new SupabaseTenantClient(supabaseUrl, supabaseKey, tenantId)
}
