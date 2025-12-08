import React from 'react'
import { cookies } from 'next/headers'
import { auth } from '@/auth'

export default async function EmbedPage() {
  const cookieStore = await cookies()
  const session = await auth({ cookieStore })
  if (!session?.user) return <div className="p-8">Please sign in</div>

  const tenantId = session.user.user_metadata?.tenant_id || session.user.id
  const apiKey = session.user.user_metadata?.tenant_api_key || ''

  const embedCode = `<script src=\"https://yourdomain.com/embed.js\" data-tenant=\"${tenantId}\" data-api-key=\"${apiKey}\"></script>`

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Embed</h1>
      <p className="text-sm text-muted-foreground">Copy this code to embed the chat widget on your site.</p>
      <pre className="rounded bg-gray-900/60 text-gray-100 backdrop-blur-lg border border-gray-800/40 p-4 overflow-auto">{embedCode}</pre>

      <div className="border border-gray-800/40 rounded p-4 bg-gray-900/60 backdrop-blur-lg text-gray-100">
        <div className="text-sm text-gray-400 mb-2">Preview</div>
        <div className="p-6 rounded border border-gray-800/40 bg-gray-900/40">Widget preview for tenant <strong>{tenantId}</strong></div>
      </div>
    </div>
  )
}
