import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { rateLimiter, getClientIdentifier } from '@/lib/rate-limit'
import { isDemoMode } from '@/lib/env'
import { MOCK_TENANT } from '@/lib/demo'

/**
 * GET /api/tenant/[botId]
 * Returns widget configuration for a tenant
 * CORS-enabled for embed usage
 * Rate-limited to prevent abuse
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ botId: string }> }
) {
  try {
    const { botId } = await params

    if (!botId) {
      return NextResponse.json(
        { error: 'Bot ID is required' },
        { 
          status: 400,
          headers: {
            'Access-Control-Allow-Origin': '*',
          },
        }
      )
    }

    // Demo mode: return mock tenant data
    if (isDemoMode()) {
      const widgetConfig = {
        tenantId: MOCK_TENANT.id,
        name: MOCK_TENANT.name,
        settings: MOCK_TENANT.settings || {
          primaryColor: '#4F46E5',
          position: 'bottom-right',
          buttonText: '💬',
          greeting: 'Hello! How can I help you today?'
        }
      }

      return NextResponse.json(widgetConfig, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
          'Content-Type': 'application/json',
          'Cache-Control': 'public, max-age=300, s-maxage=300',
        }
      })
    }

    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    if (!uuidRegex.test(botId)) {
      return NextResponse.json(
        { 
          error: 'Invalid tenant ID format',
          message: `The tenant ID "${botId}" is not a valid UUID. Please check your tenant ID.`,
          suggestion: 'Get your tenant ID from /dashboard/widget or /dashboard/profile'
        },
        { 
          status: 400,
          headers: {
            'Access-Control-Allow-Origin': '*',
          },
        }
      )
    }

    // Rate limiting
    const clientId = getClientIdentifier(request)
    const rateLimit = rateLimiter.check(clientId)
    
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Please try again later.' },
        {
          status: 429,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Retry-After': Math.ceil((rateLimit.resetAt - Date.now()) / 1000).toString(),
            'X-RateLimit-Limit': '100',
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': new Date(rateLimit.resetAt).toISOString(),
          },
        }
      )
    }

    // Create Supabase client with service role for public widget endpoint
    // This bypasses RLS and avoids auth-related fetch issues
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !serviceRoleKey) {
      console.error('Missing Supabase configuration:', {
        hasUrl: !!supabaseUrl,
        hasKey: !!serviceRoleKey
      })
      return NextResponse.json(
        { error: 'Server configuration error', details: 'Supabase credentials not configured' },
        { 
          status: 500,
          headers: {
            'Access-Control-Allow-Origin': '*',
          },
        }
      )
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey)

    // Fetch tenant data
    const { data: tenant, error } = await supabase
      .from('tenants')
      .select('id, name, settings')
      .eq('id', botId)
      .maybeSingle()

    if (error) {
      console.error('Error fetching tenant:', error)
      return NextResponse.json(
        { error: 'Database error', details: error.message },
        { 
          status: 500,
          headers: {
            'Access-Control-Allow-Origin': '*',
          },
        }
      )
    }

    if (!tenant) {
      console.error(`Tenant not found: ${botId}`)
      return NextResponse.json(
        { 
          error: 'Tenant not found',
          message: `No tenant found with ID: ${botId}. Please ensure the tenant exists in the database.`,
          suggestion: 'Create a tenant record or check your tenant ID in /dashboard/profile'
        },
        { 
          status: 404,
          headers: {
            'Access-Control-Allow-Origin': '*',
          },
        }
      )
    }

    // Parse settings (handle both JSON string and object)
    let settings: any = {}
    if (tenant.settings) {
      if (typeof tenant.settings === 'string') {
        try {
          settings = JSON.parse(tenant.settings)
        } catch {
          settings = {}
        }
      } else {
        settings = tenant.settings
      }
    }

    // Build widget configuration response
    const widgetConfig = {
      tenantId: tenant.id,
      name: tenant.name || 'AI Assistant',
      settings: {
        color: settings.primaryColor || settings.color || '#4F46E5',
        position: settings.position || 'bottom-right',
        logoUrl: settings.logo || settings.logoUrl || null,
        buttonText: settings.buttonText || '💬',
        greetingMessage: settings.greeting || settings.greetingMessage || 'Hello! How can I help you today?',
      },
    }

    // Log widget load event (fire and forget)
    try {
      const referrerOrigin = request.headers.get('referer') 
        ? new URL(request.headers.get('referer')!).origin 
        : null
      const userAgent = request.headers.get('user-agent') || null

      // Use service role for insert (telemetry)
      const supabaseService = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
      )

      // Async insert - don't await (fire and forget)
      Promise.resolve(
        supabaseService
          .from('widget_events')
          .insert({
            tenant_id: tenant.id,
            event_type: 'widget_load',
            referrer_origin: referrerOrigin,
            user_agent: userAgent,
          })
      ).catch((err) => {
        // Silently fail telemetry - don't affect widget loading
        console.error('Telemetry error (non-critical):', err)
      })
    } catch (telemetryError) {
      // Silently fail telemetry
      console.error('Telemetry error (non-critical):', telemetryError)
    }

    // CORS headers for embed usage
    const headers = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Content-Type': 'application/json',
      'Cache-Control': 'public, max-age=300, s-maxage=300', // 5 minutes cache
      'X-RateLimit-Limit': '100',
      'X-RateLimit-Remaining': rateLimit.remaining.toString(),
      'X-RateLimit-Reset': new Date(rateLimit.resetAt).toISOString(),
    }

    return NextResponse.json(widgetConfig, { headers })
  } catch (error) {
    console.error('Error fetching tenant config:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { 
        status: 500,
        headers: {
          'Access-Control-Allow-Origin': '*',
        },
      }
    )
  }
}

/**
 * OPTIONS /api/tenant/[botId]
 * Handle CORS preflight requests
 */
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  })
}
