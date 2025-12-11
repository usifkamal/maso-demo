'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import toast from 'react-hot-toast'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { IconCopy, IconCheck, IconExternalLink, IconRefresh } from '@/components/ui/icons'
import { cn } from '@/lib/utils'

// Check if demo mode is enabled
const isDemoMode = () => process.env.NEXT_PUBLIC_DEMO_MODE === 'true'
const DEMO_TENANT_ID = 'demo-tenant-1'

interface WidgetSettings {
  primaryColor: string
  logo: string
  greeting: string
  position?: string
  buttonText?: string
}

const DEFAULT_SETTINGS: WidgetSettings = {
  primaryColor: '#4F46E5',
  logo: '',
  greeting: 'Hello! How can I help you today?',
  position: 'bottom-right',
  buttonText: '💬',
}

export default function WidgetSettingsPage() {
  const [tenantId, setTenantId] = useState<string>('')
  const [settings, setSettings] = useState<WidgetSettings>(DEFAULT_SETTINGS)
  const [isSaving, setIsSaving] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [copied, setCopied] = useState(false)
  const [appUrl, setAppUrl] = useState<string>('')
  const [sriIntegrity, setSriIntegrity] = useState<string>('')

  const supabase = createClientComponentClient()

  // Get app URL and SRI hash
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setAppUrl(window.location.origin)
      
      // In demo mode, skip SRI (integrity attribute) for easier local testing
      if (isDemoMode()) {
        setSriIntegrity('')
        return
      }
      
      // Fetch SRI hash for embed.js (only in production)
      fetch('/api/widget/sri')
        .then(res => res.json())
        .then(data => {
          if (data.integrity) {
            setSriIntegrity(' integrity="' + data.integrity + '"')
          }
        })
        .catch(() => {
          // Silently fail - SRI is optional
        })
    }
  }, [])

  // Fetch tenant settings
  useEffect(() => {
    async function fetchSettings() {
      try {
        // Demo mode: use mock tenant data
        if (isDemoMode()) {
          setTenantId(DEMO_TENANT_ID)
          setSettings({
            primaryColor: DEFAULT_SETTINGS.primaryColor,
            logo: DEFAULT_SETTINGS.logo,
            greeting: DEFAULT_SETTINGS.greeting,
            position: DEFAULT_SETTINGS.position,
            buttonText: DEFAULT_SETTINGS.buttonText,
          })
          setIsLoading(false)
          return
        }

        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
          toast.error('Please sign in to manage widget settings')
          return
        }

        // Get tenant ID from user metadata
        const userTenantId = user.user_metadata?.tenant_id || user.id

        const { data: tenant, error } = await supabase
          .from('tenants')
          .select('id, name, settings')
          .eq('id', userTenantId)
          .single()

        if (error) throw error

        if (tenant) {
          setTenantId(tenant.id)
          
          // Parse settings
          const existingSettings = typeof tenant.settings === 'string'
            ? JSON.parse(tenant.settings)
            : tenant.settings || {}

          setSettings({
            primaryColor: existingSettings.primaryColor || existingSettings.color || DEFAULT_SETTINGS.primaryColor,
            logo: existingSettings.logo || existingSettings.logoUrl || DEFAULT_SETTINGS.logo,
            greeting: existingSettings.greeting || existingSettings.greetingMessage || DEFAULT_SETTINGS.greeting,
            position: existingSettings.position || DEFAULT_SETTINGS.position,
            buttonText: existingSettings.buttonText || DEFAULT_SETTINGS.buttonText,
          })
        }
      } catch (error) {
        console.error('Error fetching settings:', error)
        toast.error('Failed to load widget settings')
      } finally {
        setIsLoading(false)
      }
    }

    fetchSettings()
  }, [supabase])

  // Auto-save settings on change
  useEffect(() => {
    if (!tenantId || isLoading) return

    const timeoutId = setTimeout(() => {
      handleSave(false) // Silent save
    }, 1000) // Debounce 1 second

    return () => clearTimeout(timeoutId)
  }, [settings, tenantId])

  const handleSave = async (showToast = true) => {
    // Demo mode: disable saving
    if (isDemoMode()) {
      if (showToast) {
        toast.error('Demo mode — settings cannot be saved')
      }
      return
    }

    setIsSaving(true)
    try {
      const { error } = await supabase
        .from('tenants')
        .update({ 
          settings: {
            primaryColor: settings.primaryColor,
            color: settings.primaryColor, // Alias for compatibility
            logo: settings.logo,
            logoUrl: settings.logo, // Alias for compatibility
            greeting: settings.greeting,
            greetingMessage: settings.greeting, // Alias for compatibility
            position: settings.position,
            buttonText: settings.buttonText,
          }
        })
        .eq('id', tenantId)

      if (error) throw error

      if (showToast) {
        toast.success('Widget settings saved successfully!')
      }
    } catch (error) {
      console.error('Error saving settings:', error)
      if (showToast) {
        toast.error('Failed to save widget settings')
      }
    } finally {
      setIsSaving(false)
    }
  }

  const handleResetDefaults = async () => {
    if (!confirm('Are you sure you want to reset all widget settings to defaults?')) {
      return
    }

    setSettings(DEFAULT_SETTINGS)
    
    // Auto-save will trigger, but we'll show a toast
    setTimeout(() => {
      toast.success('Settings reset to defaults!', {
        icon: '✅',
        duration: 2000,
      })
    }, 500)
  }

  // Generate embed code with optional SRI
  // Fix: Properly format the embed code, handle logo URL correctly, and ensure tenantId is never empty
  const effectiveTenantId = tenantId || (isDemoMode() ? DEMO_TENANT_ID : '')
  const logoAttr = settings.logo ? ` data-logo-url="${settings.logo}"` : ''
  const embedCode = `<script src="${appUrl}/embed.js?v=1.0.0"${sriIntegrity} data-bot-id="${effectiveTenantId}" data-position="${settings.position}" data-color="${settings.primaryColor}" data-button-text="${settings.buttonText}"${logoAttr}></script>`

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(embedCode)
      setCopied(true)
      toast.success('Embed code copied to clipboard!', {
        icon: '✅',
        duration: 2000,
      })
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      toast.error('Failed to copy embed code')
    }
  }

  const handleTestWidget = () => {
    if (tenantId) {
      window.open(`/embed/${tenantId}`, '_blank', 'noopener,noreferrer')
    }
  }

  if (isLoading) {
    return (
      <div className="flex h-[calc(100vh-200px)] items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500 mx-auto"></div>
          <p className="mt-4 text-gray-400">Loading widget settings...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-100">Widget Customization</h1>
          <p className="text-gray-400 mt-2">
            Customize the appearance and behavior of your embeddable chat widget
          </p>
        </div>
        <Button
          onClick={handleResetDefaults}
          variant="outline"
          className="border-gray-700 text-gray-300 hover:bg-gray-800/60 hover:text-gray-100 transition-all duration-300 ease-in-out"
        >
          <IconRefresh className="h-4 w-4 mr-2" />
          Reset to Defaults
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Settings Form */}
        <div className="space-y-6">
          <div className="glassy-card rounded-lg p-6 space-y-6">
            <h2 className="text-xl font-semibold text-gray-100">Settings</h2>
            
            {/* Primary Color */}
            <div className="space-y-2">
              <Label htmlFor="primaryColor" className="text-white">Primary Color</Label>
              <div className="flex gap-3 items-center">
                <Input
                  id="primaryColor"
                  type="color"
                  value={settings.primaryColor}
                  onChange={(e) => setSettings({ ...settings, primaryColor: e.target.value })}
                  className="w-24 h-12 cursor-pointer bg-gray-800 border-gray-700"
                />
                <Input
                  type="text"
                  value={settings.primaryColor}
                  onChange={(e) => setSettings({ ...settings, primaryColor: e.target.value })}
                  placeholder="#4F46E5"
                  className="flex-1 bg-gray-800/60 text-gray-100 border-gray-700 focus:border-indigo-500"
                />
              </div>
              <p className="text-sm text-gray-400">
                This color will be used for the chat button, header, and user messages
              </p>
            </div>

            {/* Logo URL */}
            <div className="space-y-2">
              <Label htmlFor="logo" className="text-white">Logo URL</Label>
              <Input
                id="logo"
                type="url"
                value={settings.logo}
                onChange={(e) => setSettings({ ...settings, logo: e.target.value })}
                placeholder="https://example.com/logo.png"
                className="bg-gray-800/60 text-gray-100 border-gray-700 focus:border-indigo-500"
              />
              <p className="text-sm text-gray-400">
                Optional: URL to your logo image (will appear in the chat header)
              </p>
              {settings.logo && (
                <div className="mt-2">
                  <img 
                    src={settings.logo} 
                    alt="Logo preview" 
                    className="w-12 h-12 rounded-full object-cover border border-gray-700"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none'
                    }}
                  />
                </div>
              )}
            </div>

            {/* Greeting Message */}
            <div className="space-y-2">
              <Label htmlFor="greeting" className="text-white">Greeting Message</Label>
              <Textarea
                id="greeting"
                value={settings.greeting}
                onChange={(e) => setSettings({ ...settings, greeting: e.target.value })}
                placeholder="Hello! How can I help you today?"
                rows={3}
                className="bg-gray-800/60 text-gray-100 border-gray-700 focus:border-indigo-500 resize-none"
              />
              <p className="text-sm text-gray-400">
                The first message users will see when they open the chat widget
              </p>
            </div>

            {/* Position */}
            <div className="space-y-2">
              <Label htmlFor="position" className="text-white">Position</Label>
              <select
                id="position"
                value={settings.position}
                onChange={(e) => setSettings({ ...settings, position: e.target.value })}
                className="w-full px-4 py-2 bg-gray-800/60 text-gray-100 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-300 ease-in-out"
              >
                <option value="bottom-right">Bottom Right</option>
                <option value="bottom-left">Bottom Left</option>
                <option value="top-right">Top Right</option>
                <option value="top-left">Top Left</option>
              </select>
            </div>

            {/* Button Text */}
            <div className="space-y-2">
              <Label htmlFor="buttonText" className="text-white">Button Text</Label>
              <Input
                id="buttonText"
                type="text"
                value={settings.buttonText}
                onChange={(e) => setSettings({ ...settings, buttonText: e.target.value })}
                placeholder="💬"
                maxLength={10}
                className="bg-gray-800/60 text-gray-100 border-gray-700 focus:border-indigo-500"
              />
              <p className="text-sm text-gray-400">
                Emoji or text displayed on the chat button (max 10 characters)
              </p>
            </div>

            {/* Save Indicator */}
            {isSaving && (
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-indigo-500"></div>
                <span>Saving...</span>
              </div>
            )}
          </div>

          {/* Embed Code */}
          <div className="glassy-card rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-100">Embed Code</h2>
              <Button
                onClick={handleCopyCode}
                className={cn(
                  "transition-all duration-300 ease-in-out",
                  copied 
                    ? "bg-green-600 hover:bg-green-700" 
                    : "bg-indigo-600 hover:bg-indigo-700"
                )}
                size="sm"
              >
                {copied ? (
                  <>
                    <IconCheck className="h-4 w-4 mr-2" />
                    Copied!
                  </>
                ) : (
                  <>
                    <IconCopy className="h-4 w-4 mr-2" />
                    Copy Code
                  </>
                )}
              </Button>
            </div>
            <p className="text-sm text-gray-400 mb-4">
              Copy and paste this code into your website, just before the closing <code className="bg-gray-800/60 px-1 py-0.5 rounded text-indigo-400">&lt;/body&gt;</code> tag
            </p>
            {sriIntegrity && (
              <p className="text-xs text-green-400 mb-2">
                ✓ Subresource Integrity (SRI) enabled for secure CDN hosting
              </p>
            )}
            <div className="relative">
              <pre className="bg-gray-900/60 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm border border-gray-800/40">
                <code className="text-gray-100">{embedCode}</code>
              </pre>
            </div>
            <div className="mt-4">
              <Button
                onClick={handleTestWidget}
                variant="outline"
                className="w-full border-gray-700 text-gray-100 hover:bg-gray-800/60 transition-all duration-300 ease-in-out"
              >
                <IconExternalLink className="h-4 w-4 mr-2" />
                Test Widget
              </Button>
            </div>
          </div>
        </div>

        {/* Preview Pane */}
        <div className="glassy-card rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-100 mb-4">Live Preview</h2>
          <div className="relative bg-gradient-to-br from-gray-900 to-gray-950 rounded-lg p-8 min-h-[600px] flex items-end justify-end border border-gray-800/40">
            {/* Preview Button */}
            <div
              className={cn(
                "w-14 h-14 rounded-full flex items-center justify-center text-2xl cursor-pointer shadow-lg transition-all duration-300 ease-in-out hover:scale-110",
                settings.position?.includes('bottom') ? 'bottom-4' : 'top-4',
                settings.position?.includes('right') ? 'right-4' : 'left-4',
              )}
              style={{ 
                backgroundColor: settings.primaryColor,
                position: 'absolute',
              }}
            >
              {settings.buttonText || '💬'}
            </div>
            
            {/* Preview Info */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center space-y-2">
              <p className="text-sm text-gray-400">Chat widget preview</p>
              <p className="text-xs text-gray-500">
                The button will appear in the {settings.position?.replace('-', ' ')} corner
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
