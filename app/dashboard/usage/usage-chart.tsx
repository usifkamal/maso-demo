'use client'

import React from 'react'

export default function UsageChart({ data }: { data: { day: string; count: number }[] }) {
  const max = Math.max(1, ...(data?.map(d => d.count) ?? [0]))

  return (
    <div className="w-full border rounded p-4">
      {data?.length ? (
        <svg width="100%" height={120} viewBox={`0 0 ${data.length * 30} 120`}>
          {data.map((d, i) => {
            const h = (d.count / max) * 80
            return (
              <g key={d.day} transform={`translate(${i * 30},0)`}> 
                <rect x={6} y={100 - h} width={18} height={h} fill="#4f46e5" />
                <text x={15} y={112} fontSize={9} textAnchor="middle" fill="#6b7280">{d.day}</text>
              </g>
            )
          })}
        </svg>
      ) : (
        <div className="text-sm text-muted-foreground">No usage data available</div>
      )}
    </div>
  )
}
