import React from 'react'
import { cookies } from 'next/headers'
import { auth } from '@/auth'
import UploadForm from './upload-form'

export default async function UploadPage() {
  const cookieStore = await cookies()
  const session = await auth({ cookieStore })
  if (!session?.user) {
    return (
      <div className="p-8">
        <h2 className="text-xl">Please sign in</h2>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Upload or Crawl</h1>
      <UploadForm user={session.user} />
    </div>
  )
}
