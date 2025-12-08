import 'server-only'
import { cookies } from 'next/headers'
import { createServerSupabase } from '@/lib/supabaseClient'
import { auth } from '@/auth'
import { NextResponse } from 'next/server'
import { isDemoMode } from '@/lib/env'
import { getMockAnalytics } from '@/lib/demo'

export async function GET() {
  try {
    // Demo mode: return mock analytics
    if (isDemoMode()) {
      return NextResponse.json(getMockAnalytics())
    }

    const cookieStore = await cookies()
    const session = await auth({ cookieStore })

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const tenantId = session.user.user_metadata?.tenant_id || session.user.id
    const supabase = createServerSupabase({ cookieStoreOrFn: cookieStore })

    // Get date range (last 30 days)
    const endDate = new Date()
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - 30)

    // 1. Total chats per day
    const { data: chatsData, error: chatsError } = await supabase
      .from('chats')
      .select('created_at')
      .eq('user_id', session.user.id)
      .gte('created_at', startDate.toISOString())
      .order('created_at', { ascending: true })

    if (chatsError) {
      console.error('Error fetching chats:', chatsError)
    }

    // Group chats by day
    const chatsPerDay = (chatsData || []).reduce((acc: Record<string, number>, chat: any) => {
      const date = new Date(chat.created_at).toISOString().split('T')[0]
      acc[date] = (acc[date] || 0) + 1
      return acc
    }, {})

    // 2. Total documents uploaded
    const { data: documentsData, error: documentsError } = await supabase
      .from('documents')
      .select('created_at')
      .eq('tenant_id', tenantId)
      .gte('created_at', startDate.toISOString())
      .order('created_at', { ascending: true })

    if (documentsError) {
      console.error('Error fetching documents:', documentsError)
    }

    // Group documents by day
    const documentsPerDay = (documentsData || []).reduce((acc: Record<string, number>, doc: any) => {
      const date = new Date(doc.created_at).toISOString().split('T')[0]
      acc[date] = (acc[date] || 0) + 1
      return acc
    }, {})

    // 3. API usage per tenant (from requests table)
    const { data: requestsData, error: requestsError } = await supabase
      .from('requests')
      .select('day, endpoint, count')
      .eq('tenant_id', tenantId)
      .gte('day', startDate.toISOString().split('T')[0])
      .order('day', { ascending: true })

    if (requestsError) {
      console.error('Error fetching requests:', requestsError)
    }

    // Group API usage by day
    const apiUsagePerDay = (requestsData || []).reduce((acc: Record<string, number>, req: any) => {
      const date = req.day
      acc[date] = (acc[date] || 0) + req.count
      return acc
    }, {})

    // Format data for charts (fill in missing dates with 0)
    const allDates: string[] = []
    for (let i = 0; i < 30; i++) {
      const date = new Date(startDate)
      date.setDate(date.getDate() + i)
      allDates.push(date.toISOString().split('T')[0])
    }

    const chatsChart = allDates.map(date => ({
      date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      count: chatsPerDay[date] || 0
    }))

    const documentsChart = allDates.map(date => ({
      date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      count: documentsPerDay[date] || 0
    }))

    const apiUsageChart = allDates.map(date => ({
      date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      count: apiUsagePerDay[date] || 0
    }))

    // Summary stats
    const totalChats = Object.values(chatsPerDay).reduce((sum: number, count: number) => sum + count, 0)
    const totalDocuments = Object.values(documentsPerDay).reduce((sum: number, count: number) => sum + count, 0)
    const totalApiCalls = Object.values(apiUsagePerDay).reduce((sum: number, count: number) => sum + count, 0)

    return NextResponse.json({
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
    })
  } catch (error) {
    console.error('Analytics API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch analytics data' },
      { status: 500 }
    )
  }
}






