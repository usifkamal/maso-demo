'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import toast from 'react-hot-toast'
import { IconArrowRight, IconCheck, IconUpload, IconCode, IconPalette } from '@/components/ui/icons'

type Step = 1 | 2 | 3

interface TenantSettings {
  primaryColor: string
  logo: string
  greeting: string
}

export default function OnboardingPage() {
  const router = useRouter()
  const supabase = createClientComponentClient()
  const [currentStep, setCurrentStep] = useState<Step>(1)
  const [tenantId, setTenantId] = useState<string>('')
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  
  // Step 1: Upload data
  const [uploadType, setUploadType] = useState<'file' | 'url'>('file')
  const [file, setFile] = useState<File | null>(null)
  const [url, setUrl] = useState('')
  const [uploadStatus, setUploadStatus] = useState<string | null>(null)
  
  // Step 2: Widget customization
  const [settings, setSettings] = useState<TenantSettings>({
    primaryColor: '#4F46E5',
    logo: '',
    greeting: 'Hello! How can I help you today?'
  })
  
  // Step 3: Embed code
  const [embedCode, setEmbedCode] = useState('')

  useEffect(() => {
    async function init() {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
          router.push('/sign-in')
          return
        }

        const tenantIdFromUser = user.user_metadata?.tenant_id || user.id
        
        // Check if already onboarded
        const { data: tenant } = await supabase
          .from('tenants')
          .select('is_onboarded, settings')
          .eq('id', tenantIdFromUser)
          .single()

        if (tenant?.is_onboarded) {
          router.push('/dashboard')
          return
        }

        setTenantId(tenantIdFromUser)
        
        // Load existing settings if any
        if (tenant?.settings) {
          const existingSettings = typeof tenant.settings === 'string'
            ? JSON.parse(tenant.settings)
            : tenant.settings || {}
          setSettings(prev => ({ ...prev, ...existingSettings }))
        }
      } catch (error) {
        console.error('Initialization error:', error)
        toast.error('Failed to initialize onboarding')
      } finally {
        setIsLoading(false)
      }
    }

    init()
  }, [router, supabase])

  const handleStep1Submit = async () => {
    // Demo mode: no writes allowed
    if (process.env.NEXT_PUBLIC_DEMO_MODE === 'true') {
      toast.error('Demo mode — no writes allowed')
      setUploadStatus('Demo mode: Uploads are disabled')
      return
    }

    if (uploadType === 'file' && !file) {
      toast.error('Please select a file')
      return
    }
    if (uploadType === 'url' && !url.trim()) {
      toast.error('Please enter a URL')
      return
    }

    setIsSaving(true)
    setUploadStatus('Processing...')

    try {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3004'
      const { data: { user } } = await supabase.auth.getUser()
      const apiKey = user?.user_metadata?.tenant_api_key

      if (!apiKey) {
        throw new Error('API key not found')
      }

      if (uploadType === 'file' && file) {
        const formData = new FormData()
        formData.append('file', file)

        const resp = await fetch(`${backendUrl}/api/ingest/upload`, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${apiKey}` },
          body: formData
        })

        if (!resp.ok) {
          const error = await resp.json()
          throw new Error(error.error || 'Upload failed')
        }

        const data = await resp.json()
        setUploadStatus(`✅ Uploaded ${data.sectionsCount} sections`)
        toast.success('File uploaded successfully!')
      } else if (uploadType === 'url' && url) {
        const resp = await fetch(`${backendUrl}/api/ingest/url`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ url })
        })

        if (!resp.ok) {
          const error = await resp.json()
          throw new Error(error.error || 'URL crawl failed')
        }

        const data = await resp.json()
        setUploadStatus(`✅ Crawled ${data.sectionsCount} sections`)
        toast.success('URL crawled successfully!')
      }

      // Move to next step after short delay
      setTimeout(() => {
        setCurrentStep(2)
      }, 1000)
    } catch (error) {
      console.error('Upload error:', error)
      toast.error(error instanceof Error ? error.message : 'Upload failed')
      setUploadStatus(null)
    } finally {
      setIsSaving(false)
    }
  }

  const handleStep2Save = async () => {
    setIsSaving(true)
    try {
      const { error } = await supabase
        .from('tenants')
        .update({ 
          settings: JSON.stringify(settings)
        })
        .eq('id', tenantId)

      if (error) throw error

      toast.success('Widget settings saved!')
      setCurrentStep(3)
    } catch (error) {
      console.error('Save error:', error)
      toast.error('Failed to save settings')
    } finally {
      setIsSaving(false)
    }
  }

  const handleComplete = async () => {
    setIsSaving(true)
    try {
      // Mark tenant as onboarded
      const { error } = await supabase
        .from('tenants')
        .update({ is_onboarded: true })
        .eq('id', tenantId)

      if (error) throw error

      toast.success('Onboarding complete! 🎉')
      router.push('/dashboard')
    } catch (error) {
      console.error('Complete error:', error)
      toast.error('Failed to complete onboarding')
    } finally {
      setIsSaving(false)
    }
  }

  useEffect(() => {
    if (currentStep === 3 && tenantId) {
      const origin = typeof window !== 'undefined' ? window.location.origin : 'https://yourdomain.com'
      const code = `<script src="${origin}/widget-loader.js" data-bot-id="${tenantId}"></script>`
      setEmbedCode(code)
    }
  }, [currentStep, tenantId])

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading onboarding...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {[1, 2, 3].map((step) => (
              <div key={step} className="flex items-center flex-1">
                <div className="flex flex-col items-center flex-1">
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-full border-2 ${
                      currentStep >= step
                        ? 'bg-indigo-600 border-indigo-600 text-white'
                        : 'bg-white border-gray-300 text-gray-500'
                    }`}
                  >
                    {currentStep > step ? (
                      <IconCheck className="h-5 w-5" />
                    ) : (
                      <span>{step}</span>
                    )}
                  </div>
                  <p className={`mt-2 text-xs font-medium ${currentStep >= step ? 'text-indigo-600' : 'text-gray-500'}`}>
                    {step === 1 && 'Upload Data'}
                    {step === 2 && 'Customize Widget'}
                    {step === 3 && 'Get Embed Code'}
                  </p>
                </div>
                {step < 3 && (
                  <div className={`flex-1 h-0.5 mx-2 ${currentStep > step ? 'bg-indigo-600' : 'bg-gray-300'}`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Step Content */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          {currentStep === 1 && (
            <div className="space-y-6">
              <div className="text-center">
                <IconUpload className="h-12 w-12 text-indigo-600 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-gray-900">Step 1: Upload Your Data</h2>
                <p className="mt-2 text-gray-600">Add documents or crawl a website to feed your AI chatbot</p>
              </div>

              <div className="space-y-4">
                <div className="flex gap-4">
                  <button
                    onClick={() => setUploadType('file')}
                    className={`flex-1 p-4 rounded-lg border-2 transition-colors ${
                      uploadType === 'file'
                        ? 'border-indigo-600 bg-indigo-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="font-semibold text-gray-900">Upload File</div>
                    <div className="text-sm text-gray-600 mt-1">PDF, TXT files</div>
                  </button>
                  <button
                    onClick={() => setUploadType('url')}
                    className={`flex-1 p-4 rounded-lg border-2 transition-colors ${
                      uploadType === 'url'
                        ? 'border-indigo-600 bg-indigo-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="font-semibold text-gray-900">Crawl URL</div>
                    <div className="text-sm text-gray-600 mt-1">Website content</div>
                  </button>
                </div>

                {uploadType === 'file' ? (
                  <div className="space-y-2">
                    <Label htmlFor="file">Select File</Label>
                    <Input
                      id="file"
                      type="file"
                      accept=".pdf,.txt"
                      onChange={(e) => setFile(e.target.files?.[0] || null)}
                      className="cursor-pointer"
                    />
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Label htmlFor="url">Website URL</Label>
                    <Input
                      id="url"
                      type="url"
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                      placeholder="https://example.com"
                    />
                  </div>
                )}

                {uploadStatus && (
                  <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-800">
                    {uploadStatus}
                  </div>
                )}

                <Button
                  onClick={handleStep1Submit}
                  disabled={isSaving || (uploadType === 'file' && !file) || (uploadType === 'url' && !url.trim())}
                  className="w-full"
                >
                  {isSaving ? 'Processing...' : 'Continue'} <IconArrowRight className="ml-2 h-4 w-4" />
                </Button>

                <button
                  onClick={() => setCurrentStep(2)}
                  className="text-sm text-gray-600 hover:text-gray-900 w-full text-center"
                >
                  Skip this step →
                </button>
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-6">
              <div className="text-center">
                <IconPalette className="h-12 w-12 text-indigo-600 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-gray-900">Step 2: Customize Your Widget</h2>
                <p className="mt-2 text-gray-600">Make the chatbot match your brand</p>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="primaryColor">Primary Color</Label>
                  <div className="flex gap-3 items-center">
                    <Input
                      id="primaryColor"
                      type="color"
                      value={settings.primaryColor}
                      onChange={(e) => setSettings({ ...settings, primaryColor: e.target.value })}
                      className="w-24 h-12 cursor-pointer"
                    />
                    <Input
                      type="text"
                      value={settings.primaryColor}
                      onChange={(e) => setSettings({ ...settings, primaryColor: e.target.value })}
                      placeholder="#4F46E5"
                      className="flex-1"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="logo">Logo URL (optional)</Label>
                  <Input
                    id="logo"
                    type="url"
                    value={settings.logo}
                    onChange={(e) => setSettings({ ...settings, logo: e.target.value })}
                    placeholder="https://example.com/logo.png"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="greeting">Greeting Message</Label>
                  <Textarea
                    id="greeting"
                    value={settings.greeting}
                    onChange={(e) => setSettings({ ...settings, greeting: e.target.value })}
                    placeholder="Hello! How can I help you today?"
                    rows={3}
                  />
                </div>

                <Button
                  onClick={handleStep2Save}
                  disabled={isSaving}
                  className="w-full"
                >
                  {isSaving ? 'Saving...' : 'Continue'} <IconArrowRight className="ml-2 h-4 w-4" />
                </Button>

                <button
                  onClick={() => setCurrentStep(3)}
                  className="text-sm text-gray-600 hover:text-gray-900 w-full text-center"
                >
                  Skip this step →
                </button>
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-6">
              <div className="text-center">
                <IconCode className="h-12 w-12 text-indigo-600 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-gray-900">Step 3: Get Your Embed Code</h2>
                <p className="mt-2 text-gray-600">Copy this code and add it to your website</p>
              </div>

              <div className="space-y-4">
                <div className="relative">
                  <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
                    <code>{embedCode}</code>
                  </pre>
                  <Button
                    size="sm"
                    variant="outline"
                    className="absolute top-2 right-2"
                    onClick={() => {
                      navigator.clipboard.writeText(embedCode)
                      toast.success('Copied to clipboard!')
                    }}
                  >
                    Copy
                  </Button>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-blue-800">
                    <strong>How to use:</strong> Paste this code just before the closing <code className="bg-blue-100 px-1 rounded">&lt;/body&gt;</code> tag on your website.
                  </p>
                </div>

                <Button
                  onClick={handleComplete}
                  disabled={isSaving}
                  className="w-full"
                >
                  {isSaving ? 'Completing...' : 'Complete Setup'} <IconCheck className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}






