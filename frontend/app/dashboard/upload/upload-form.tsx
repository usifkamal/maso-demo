'use client'

import React, { useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { toast } from 'react-hot-toast'

const isDemoMode = () => process.env.NEXT_PUBLIC_DEMO_MODE === 'true'

export default function UploadForm({ user }: { user: any }) {
  const supabase = createClientComponentClient()
  const [url, setUrl] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [status, setStatus] = useState<string | null>(null)

  const submitUrl = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Demo mode: no writes allowed
    if (isDemoMode()) {
      toast.error('Demo mode — no writes allowed')
      setStatus('Demo mode: URL crawling is disabled')
      return
    }
    
    setStatus('Crawling URL...')
    try {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3004'
      const apiKey = process.env.NEXT_PUBLIC_TENANT_API_KEY
      
      if (!apiKey) {
        setStatus('Error: NEXT_PUBLIC_TENANT_API_KEY not configured')
        return
      }
      
      const resp = await fetch(`${backendUrl}/api/ingest/url`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({ url })
      })
      const data = await resp.json()
      
      if (!resp.ok) {
        setStatus(`Error: ${data.error || data.details || 'Failed to crawl URL'}`)
        return
      }
      
      setStatus(data?.message || 'Done!')
    } catch (err) {
      setStatus(`Error: ${(err as Error).message}`)
    }
  }

  const submitFile = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Demo mode: no writes allowed
    if (isDemoMode()) {
      toast.error('Demo mode — no writes allowed')
      setStatus('Demo mode: File uploads are disabled')
      return
    }
    
    if (!file) return setStatus('No file selected')
    setStatus('Uploading file...')
    try {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3004'
      const apiKey = process.env.NEXT_PUBLIC_TENANT_API_KEY
      
      if (!apiKey) {
        setStatus('Error: NEXT_PUBLIC_TENANT_API_KEY not configured')
        return
      }
      
      const fd = new FormData()
      fd.append('file', file)
      const resp = await fetch(`${backendUrl}/api/ingest/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`
        },
        body: fd
      })
      const data = await resp.json()
      
      if (!resp.ok) {
        setStatus(`Error: ${data.error || data.details || 'Failed to upload file'}`)
        return
      }
      
      setStatus(data?.message || 'Done!')
    } catch (err) {
      setStatus(`Error: ${(err as Error).message}`)
    }
  }

  return (
    <div className="space-y-4">
      <form onSubmit={submitUrl} className="space-y-2">
        <label className="block text-sm font-medium">Crawl URL</label>
        <div className="flex gap-2">
          <input value={url} onChange={e => setUrl(e.target.value)} placeholder="https://example.com" className="flex-1 rounded border px-3 py-2" />
          <button className="rounded bg-blue-700 hover:bg-blue-800 px-3 py-2 text-white transition-all duration-300 ease-in-out">Crawl</button>
        </div>
      </form>

      <form onSubmit={submitFile} className="space-y-2">
        <label className="block text-sm font-medium">Upload File</label>
        <input type="file" onChange={e => setFile(e.target.files?.[0] ?? null)} />
        <div>
          <button className="rounded bg-blue-700 hover:bg-blue-800 px-3 py-2 text-white transition-all duration-300 ease-in-out">Upload</button>
        </div>
      </form>

      {status && <div className="text-sm text-muted-foreground">{status}</div>}
    </div>
  )
}
