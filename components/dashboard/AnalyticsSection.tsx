'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { IconMessage, IconArrowDown, IconRefresh, IconArrowRight } from '@/components/ui/icons'

interface AnalyticsData {
  chats: {
    data: Array<{ date: string; count: number }>
    total: number
  }
  documents: {
    data: Array<{ date: string; count: number }>
    total: number
  }
  apiUsage: {
    data: Array<{ date: string; count: number }>
    total: number
  }
}

export function AnalyticsSection() {
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function loadAnalytics() {
      try {
        const response = await fetch('/api/analytics')
        if (response.ok) {
          const analyticsData = await response.json()
          setData(analyticsData)
        }
      } catch (err) {
        console.error('Error loading analytics:', err)
      } finally {
        setIsLoading(false)
      }
    }

    loadAnalytics()
  }, [])

  if (isLoading) {
    return (
      <div className="glassy-card rounded-lg p-6 neon-glow">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-700 rounded w-1/4"></div>
          <div className="h-64 bg-gray-700 rounded"></div>
        </div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="glassy-card rounded-lg p-6 neon-glow">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-100">Analytics</h2>
          <Link
            href="/dashboard/analytics"
            className="text-sm font-medium text-indigo-400 hover:text-indigo-300 flex items-center gap-1 transition-colors"
          >
            View All <IconArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <p className="text-gray-400 text-sm">No analytics data available yet.</p>
      </div>
    )
  }

  // Take last 7 days for dashboard preview
  const chatsChartData = data.chats.data.slice(-7)
  const apiChartData = data.apiUsage.data.slice(-7)

  return (
    <div className="glassy-card rounded-lg p-6 neon-glow">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-100">Analytics Overview</h2>
        <Link
          href="/dashboard/analytics"
          className="text-sm font-medium text-indigo-400 hover:text-indigo-300 flex items-center gap-1 transition-colors"
        >
          View All <IconArrowRight className="h-4 w-4" />
        </Link>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 mb-1">
            <IconMessage className="h-4 w-4 text-indigo-400" />
            <p className="text-xs text-gray-400">Total Chats</p>
          </div>
          <p className="text-2xl font-bold text-gray-100">{data.chats.total.toLocaleString()}</p>
        </div>
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 mb-1">
            <IconArrowDown className="h-4 w-4 text-green-400" />
            <p className="text-xs text-gray-400">Documents</p>
          </div>
          <p className="text-2xl font-bold text-gray-100">{data.documents.total.toLocaleString()}</p>
        </div>
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 mb-1">
            <IconRefresh className="h-4 w-4 text-blue-400" />
            <p className="text-xs text-gray-400">API Calls</p>
          </div>
          <p className="text-2xl font-bold text-gray-100">{data.apiUsage.total.toLocaleString()}</p>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Chats Chart */}
        <div>
          <h3 className="text-sm font-medium text-gray-300 mb-3">Chats (Last 7 Days)</h3>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={chatsChartData}>
              <defs>
                <linearGradient id="chatsGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#818cf8" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#818cf8" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis 
                dataKey="date" 
                stroke="#9ca3af"
                style={{ fontSize: '10px' }}
                tick={{ fill: '#9ca3af' }}
              />
              <YAxis 
                stroke="#9ca3af"
                style={{ fontSize: '10px' }}
                tick={{ fill: '#9ca3af' }}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1f2937', 
                  border: '1px solid #374151',
                  borderRadius: '8px',
                  color: '#f3f4f6'
                }} 
                labelStyle={{ color: '#f3f4f6' }}
              />
              <Area 
                type="monotone" 
                dataKey="count" 
                stroke="#818cf8" 
                fillOpacity={1}
                fill="url(#chatsGradient)"
                name="Chats"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* API Usage Chart */}
        <div>
          <h3 className="text-sm font-medium text-gray-300 mb-3">API Calls (Last 7 Days)</h3>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={apiChartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis 
                dataKey="date" 
                stroke="#9ca3af"
                style={{ fontSize: '10px' }}
                tick={{ fill: '#9ca3af' }}
              />
              <YAxis 
                stroke="#9ca3af"
                style={{ fontSize: '10px' }}
                tick={{ fill: '#9ca3af' }}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1f2937', 
                  border: '1px solid #374151',
                  borderRadius: '8px',
                  color: '#f3f4f6'
                }} 
                labelStyle={{ color: '#f3f4f6' }}
              />
              <Line 
                type="monotone" 
                dataKey="count" 
                stroke="#60a5fa" 
                strokeWidth={2}
                dot={{ fill: '#60a5fa', r: 3 }}
                activeDot={{ r: 5 }}
                name="API Calls"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}

