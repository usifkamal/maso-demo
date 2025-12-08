import { NextRequest, NextResponse } from 'next/server'
import { createTenantClient } from '@/lib/supabase-tenant'
import { extractTenantFromRequest } from '@/lib/tenant-utils'

export async function GET(request: NextRequest) {
  try {
    // Extract tenant information from request
    const { tenantId, apiKey, domain } = extractTenantFromRequest(request)
    
    // Create tenant-aware client
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
    
    const client = createTenantClient(supabaseUrl, supabaseKey)
    const tenantManager = client.getTenantManager()

    // Try to identify tenant by API key or domain
    let identifiedTenant = null
    if (apiKey) {
      identifiedTenant = await tenantManager.getTenantByApiKey(apiKey)
    } else if (domain) {
      identifiedTenant = await tenantManager.getTenantByDomain(domain)
    }

    if (!identifiedTenant) {
      return NextResponse.json(
        { error: 'Tenant not found' },
        { status: 404 }
      )
    }

    // Set tenant context
    await client.setTenant(identifiedTenant.id)

    // Get tenant data
    const documents = await client.getDocuments()
    const messages = await client.getMessages(10)
    const users = await tenantManager.getTenantUsers(identifiedTenant.id)

    return NextResponse.json({
      tenant: identifiedTenant,
      documents: documents.length,
      messages: messages.length,
      users: users.length
    })

  } catch (error) {
    console.error('Error in tenant example:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { tenantId, apiKey, domain } = extractTenantFromRequest(request)
    
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
    
    const client = createTenantClient(supabaseUrl, supabaseKey)
    const tenantManager = client.getTenantManager()

    // Identify tenant
    let identifiedTenant = null
    if (apiKey) {
      identifiedTenant = await tenantManager.getTenantByApiKey(apiKey)
    } else if (domain) {
      identifiedTenant = await tenantManager.getTenantByDomain(domain)
    }

    if (!identifiedTenant) {
      return NextResponse.json(
        { error: 'Tenant not found' },
        { status: 404 }
      )
    }

    await client.setTenant(identifiedTenant.id)

    // Create a message
    const message = await client.createMessage({
      content: body.content,
      role: body.role || 'user',
      userId: body.userId
    })

    // Log usage
    await client.logUsage({
      action: 'message_created',
      resourceType: 'message',
      resourceId: message.id,
      userId: body.userId
    })

    return NextResponse.json({ message })

  } catch (error) {
    console.error('Error creating message:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
