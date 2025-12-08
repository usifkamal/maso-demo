'use client'

import { useState, useEffect } from 'react'
import { LineChart, Line, BarChart, Bar, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { IconMessage, IconArrowDown, IconRefresh } from '@/components/ui/icons'

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

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadAnalytics() {
      try {
        const response = await fetch('/api/analytics')
        if (!response.ok) {
          throw new Error('Failed to load analytics')
        }
        const analyticsData = await response.json()
        setData(analyticsData)
      } catch (err) {
        console.error('Error loading analytics:', err)
        setError(err instanceof Error ? err.message : 'Failed to load analytics')
      } finally {
        setIsLoading(false)
      }
    }

    loadAnalytics()
  }, [])

  if (isLoading) {
    return (
      <div className="flex h-[calc(100vh-64px)] items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading analytics...</p>
        </div>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-gray-900">Analytics</h1>
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <p className="text-red-800">{error || 'Failed to load analytics data'}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Analytics</h1>
        <p className="mt-2 text-gray-600">
          Track your chatbot usage, documents, and API calls over the last 30 days.
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-6 sm:grid-cols-3">
        <SummaryCard
          title="Total Chats"
          value={data.chats.total}
          icon={<IconMessage className="h-6 w-6 text-indigo-600" />}
          bgColor="bg-indigo-50"
        />
        <SummaryCard
          title="Documents Uploaded"
          value={data.documents.total}
          icon={<IconArrowDown className="h-6 w-6 text-green-600" />}
          bgColor="bg-green-50"
        />
        <SummaryCard
          title="API Calls"
          value={data.apiUsage.total}
          icon={<IconRefresh className="h-6 w-6 text-blue-600" />}
          bgColor="bg-blue-50"
        />
      </div>

      {/* Charts */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Chats Chart */}
        <ChartCard title="Chats Per Day">
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={data.chats.data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis 
                dataKey="date" 
                stroke="#6b7280"
                style={{ fontSize: '12px' }}
                angle={-45}
                textAnchor="end"
                height={60}
              />
              <YAxis stroke="#6b7280" style={{ fontSize: '12px' }} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#fff', 
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px'
                }} 
              />
              <Area 
                type="monotone" 
                dataKey="count" 
                stroke="#4f46e5" 
                fill="#818cf8" 
                fillOpacity={0.6}
                name="Chats"
              />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Documents Chart */}
        <ChartCard title="Documents Uploaded Per Day">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data.documents.data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis 
                dataKey="date" 
                stroke="#6b7280"
                style={{ fontSize: '12px' }}
                angle={-45}
                textAnchor="end"
                height={60}
              />
              <YAxis stroke="#6b7280" style={{ fontSize: '12px' }} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#fff', 
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px'
                }} 
              />
              <Bar dataKey="count" fill="#10b981" name="Documents" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* API Usage Chart - Full Width */}
        <ChartCard title="API Usage Per Day" className="lg:col-span-2">
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data.apiUsage.data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis 
                dataKey="date" 
                stroke="#6b7280"
                style={{ fontSize: '12px' }}
                angle={-45}
                textAnchor="end"
                height={60}
              />
              <YAxis stroke="#6b7280" style={{ fontSize: '12px' }} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#fff', 
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px'
                }} 
              />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="count" 
                stroke="#3b82f6" 
                strokeWidth={2}
                dot={{ fill: '#3b82f6', r: 4 }}
                activeDot={{ r: 6 }}
                name="API Calls"
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>
    </div>
  )
}

function SummaryCard({ 
  title, 
  value, 
  icon, 
  bgColor 
}: { 
  title: string
  value: number
  icon: React.ReactNode
  bgColor: string
}) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="mt-2 text-3xl font-bold text-gray-900">{value.toLocaleString()}</p>
        </div>
        <div className={`rounded-lg p-3 ${bgColor}`}>
          {icon}
        </div>
      </div>
    </div>
  )
}

function ChartCard({ 
  title, 
  children, 
  className = '' 
}: { 
  title: string
  children: React.ReactNode
  className?: string
}) {
  return (
    <div className={`bg-white rounded-lg border border-gray-200 p-6 ${className}`}>
      <h2 className="text-xl font-semibold text-gray-900 mb-4">{title}</h2>
      {children}
    </div>
  )
}






