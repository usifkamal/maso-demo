import { cookies } from 'next/headers'
import { auth } from '@/auth'
import Link from 'next/link'
import { createServerSupabase } from '@/lib/supabaseClient'
import { IconArrowDown, IconCopy, IconMessage, IconUser, IconRefresh, IconCheck, IconCode } from '@/components/ui/icons'
import { PremiumSection } from '@/components/dashboard/PremiumSection'
import { AnalyticsSection } from '@/components/dashboard/AnalyticsSection'
import { isDemoMode } from '@/lib/env'
import { MOCK_DOCUMENTS, MOCK_TENANT } from '@/lib/demo'

export default async function DashboardPage() {
  const cookieStore = await cookies()
  
  // Demo mode: use mock data
  if (isDemoMode()) {
    const displayName = 'Demo User'
    const hasDocuments = MOCK_DOCUMENTS.length > 0
    const hasWidgetSettings = !!(MOCK_TENANT.settings?.primaryColor || MOCK_TENANT.settings?.greeting)
    const hasEmbedCode = true

    const onboardingItems = [
      { 
        id: 'upload', 
        label: 'Upload documents or crawl URLs', 
        completed: hasDocuments,
        href: '/dashboard/upload'
      },
      { 
        id: 'widget', 
        label: 'Customize widget settings', 
        completed: hasWidgetSettings,
        href: '/dashboard/widget'
      },
      { 
        id: 'embed', 
        label: 'Copy embed code', 
        completed: hasEmbedCode,
        href: '/dashboard/embed'
      }
    ]

    const allCompleted = onboardingItems.every(item => item.completed)

    return (
      <div className="space-y-6">
        {/* Welcome Section */}
        <div>
          <h1 className="text-3xl font-bold text-gray-100">Welcome back, {displayName}!</h1>
          <p className="mt-2 text-gray-400">
            Manage your AI chatbot, upload data, and monitor usage from your dashboard.
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Total Documents"
            value={MOCK_DOCUMENTS.length.toString()}
            icon={<IconArrowDown className="h-6 w-6 text-indigo-400" />}
            bgColor="bg-indigo-500/20"
          />
          <StatCard
            title="Chat Sessions"
            value="2"
            icon={<IconMessage className="h-6 w-6 text-green-400" />}
            bgColor="bg-green-500/20"
          />
          <StatCard
            title="API Calls"
            value="150"
            icon={<IconRefresh className="h-6 w-6 text-blue-400" />}
            bgColor="bg-blue-500/20"
          />
          <StatCard
            title="Active Widgets"
            value="1"
            icon={<IconCopy className="h-6 w-6 text-purple-400" />}
            bgColor="bg-purple-500/20"
          />
        </div>

        {/* Premium & Analytics Grid */}
        <div className="grid gap-6 lg:grid-cols-2">
          <PremiumSection />
          <AnalyticsSection />
        </div>

        {/* Onboarding Checklist */}
        <div className="glassy-card rounded-lg p-6 neon-glow">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-100">Onboarding Checklist</h2>
            {allCompleted && (
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-500/20 text-green-400 border border-green-500/30">
                Complete! 🎉
              </span>
            )}
          </div>
          <div className="space-y-3">
            {onboardingItems.map((item) => (
              <Link
                key={item.id}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 p-3 rounded-lg transition-all duration-300 ease-in-out',
                  item.completed
                    ? 'bg-green-500/10 border border-green-500/20 hover:bg-green-500/15'
                    : 'glassy-card hover:bg-gray-800/40 border border-gray-700/30'
                )}
              >
                <div className={cn(
                  'flex h-6 w-6 items-center justify-center rounded-full border-2 transition-all',
                  item.completed
                    ? 'bg-green-500/20 border-green-500 text-green-400'
                    : 'border-gray-600 text-gray-500'
                )}>
                  {item.completed ? (
                    <IconCheck className="h-4 w-4" />
                  ) : (
                    <span className="text-xs font-semibold">{onboardingItems.indexOf(item) + 1}</span>
                  )}
                </div>
                <span className={cn(
                  'flex-1 text-sm font-medium',
                  item.completed ? 'text-green-300 line-through' : 'text-gray-300'
                )}>
                  {item.label}
                </span>
                {!item.completed && (
                  <IconArrowDown className="h-4 w-4 text-gray-500 rotate-[-90deg]" />
                )}
              </Link>
            ))}
          </div>
          {!allCompleted && (
            <p className="mt-4 text-xs text-gray-400">
              Complete all steps to get your chatbot up and running!
            </p>
          )}
        </div>

        {/* Quick Actions */}
        <div className="glassy-card rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-100 mb-4">Quick Actions</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <QuickActionCard
              title="Upload Documents"
              description="Add PDFs, text files, or crawl URLs"
              href="/dashboard/upload"
              icon={<IconArrowDown className="h-5 w-5" />}
            />
            <QuickActionCard
              title="Customize Widget"
              description="Change colors, logo, and greeting"
              href="/dashboard/widget"
              icon={<IconCopy className="h-5 w-5" />}
            />
            <QuickActionCard
              title="Get Embed Code"
              description="Copy code to add to your website"
              href="/dashboard/embed"
              icon={<IconCode className="h-5 w-5" />}
            />
            <QuickActionCard
              title="Test Chat"
              description="Try out your AI chatbot"
              href="/dashboard/chat"
              icon={<IconMessage className="h-5 w-5" />}
            />
            <QuickActionCard
              title="View Analytics"
              description="Monitor usage and performance"
              href="/dashboard/analytics"
              icon={<IconRefresh className="h-5 w-5" />}
            />
            <QuickActionCard
              title="Profile Settings"
              description="Manage your account"
              href="/dashboard/profile"
              icon={<IconUser className="h-5 w-5" />}
            />
          </div>
        </div>
      </div>
    )
  }

  // Normal mode: use real data
  const session = await auth({ cookieStore })

  const displayName = session?.user?.user_metadata?.full_name || session?.user?.email?.split('@')[0] || 'User'
  const tenantId = session?.user?.user_metadata?.tenant_id || session?.user?.id

  // Check onboarding checklist items
  const supabase = createServerSupabase({ cookieStoreOrFn: cookieStore })
  
  let hasDocuments = false
  let hasWidgetSettings = false
  let hasEmbedCode = false
  
  try {
    // Check documents
    const { count: docCount } = await supabase
      .from('documents')
      .select('*', { count: 'exact', head: true })
      .eq('tenant_id', tenantId)
    
    hasDocuments = (docCount || 0) > 0

    // Check widget settings
    const { data: tenant } = await supabase
      .from('tenants')
      .select('settings')
      .eq('id', tenantId)
      .single()

    if (tenant?.settings) {
      const settings = typeof tenant.settings === 'string' 
        ? JSON.parse(tenant.settings) 
        : tenant.settings
      hasWidgetSettings = !!(settings.primaryColor || settings.logo || settings.greeting)
    }

    // Embed code is always available, but check if user has accessed it
    hasEmbedCode = true // Always available
  } catch (error) {
    console.error('Error checking onboarding status:', error)
  }

  const onboardingItems = [
    { 
      id: 'upload', 
      label: 'Upload documents or crawl URLs', 
      completed: hasDocuments,
      href: '/dashboard/upload'
    },
    { 
      id: 'widget', 
      label: 'Customize widget settings', 
      completed: hasWidgetSettings,
      href: '/dashboard/widget'
    },
    { 
      id: 'embed', 
      label: 'Copy embed code', 
      completed: hasEmbedCode,
      href: '/dashboard/embed'
    }
  ]

  const allCompleted = onboardingItems.every(item => item.completed)

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div>
        <h1 className="text-3xl font-bold text-gray-100">Welcome back, {displayName}!</h1>
        <p className="mt-2 text-gray-400">
          Manage your AI chatbot, upload data, and monitor usage from your dashboard.
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Documents"
          value="0"
          icon={<IconArrowDown className="h-6 w-6 text-indigo-400" />}
          bgColor="bg-indigo-500/20"
        />
        <StatCard
          title="Chat Sessions"
          value="0"
          icon={<IconMessage className="h-6 w-6 text-green-400" />}
          bgColor="bg-green-500/20"
        />
        <StatCard
          title="API Calls"
          value="0"
          icon={<IconRefresh className="h-6 w-6 text-blue-400" />}
          bgColor="bg-blue-500/20"
        />
        <StatCard
          title="Active Widgets"
          value="1"
          icon={<IconCopy className="h-6 w-6 text-purple-400" />}
          bgColor="bg-purple-500/20"
        />
      </div>

      {/* Premium & Analytics Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        <PremiumSection />
        <AnalyticsSection />
      </div>

      {/* Onboarding Checklist */}
      <div className="glassy-card rounded-lg p-6 neon-glow">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-100">Onboarding Checklist</h2>
          {allCompleted && (
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-500/20 text-green-400 border border-green-500/30">
              Complete! 🎉
            </span>
          )}
        </div>
        <div className="space-y-3">
          {onboardingItems.map((item) => (
            <Link
              key={item.id}
              href={item.href}
              className={cn(
                'flex items-center gap-3 p-3 rounded-lg transition-all duration-300 ease-in-out',
                item.completed
                  ? 'bg-green-500/10 border border-green-500/20 hover:bg-green-500/15'
                  : 'glassy-card hover:bg-gray-800/40 border border-gray-700/30'
              )}
            >
              <div className={cn(
                'flex h-6 w-6 items-center justify-center rounded-full border-2 transition-all',
                item.completed
                  ? 'bg-green-500/20 border-green-500 text-green-400'
                  : 'border-gray-600 text-gray-500'
              )}>
                {item.completed ? (
                  <IconCheck className="h-4 w-4" />
                ) : (
                  <span className="text-xs font-semibold">{onboardingItems.indexOf(item) + 1}</span>
                )}
              </div>
              <span className={cn(
                'flex-1 text-sm font-medium',
                item.completed ? 'text-green-300 line-through' : 'text-gray-300'
              )}>
                {item.label}
              </span>
              {!item.completed && (
                <IconArrowDown className="h-4 w-4 text-gray-500 rotate-[-90deg]" />
              )}
            </Link>
          ))}
        </div>
        {!allCompleted && (
          <p className="mt-4 text-xs text-gray-400">
            Complete all steps to get your chatbot up and running!
          </p>
        )}
      </div>

      {/* Quick Actions */}
      <div className="glassy-card rounded-lg p-6">
        <h2 className="text-xl font-semibold text-gray-100 mb-4">Quick Actions</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <QuickActionCard
            title="Upload Documents"
            description="Add PDFs, text files, or crawl URLs"
            href="/dashboard/upload"
            icon={<IconArrowDown className="h-5 w-5" />}
          />
          <QuickActionCard
            title="Customize Widget"
            description="Change colors, logo, and greeting"
            href="/dashboard/widget"
            icon={<IconCopy className="h-5 w-5" />}
          />
          <QuickActionCard
            title="Get Embed Code"
            description="Copy code to add to your website"
            href="/dashboard/embed"
            icon={<IconCode className="h-5 w-5" />}
          />
          <QuickActionCard
            title="Test Chat"
            description="Try out your AI chatbot"
            href="/dashboard/chat"
            icon={<IconMessage className="h-5 w-5" />}
          />
          <QuickActionCard
            title="View Analytics"
            description="Monitor usage and performance"
            href="/dashboard/analytics"
            icon={<IconRefresh className="h-5 w-5" />}
          />
          <QuickActionCard
            title="Profile Settings"
            description="Manage your account"
            href="/dashboard/profile"
            icon={<IconUser className="h-5 w-5" />}
          />
        </div>
      </div>
    </div>
  )
}

function StatCard({ title, value, icon, bgColor }: { title: string; value: string; icon: React.ReactNode; bgColor: string }) {
  return (
    <div className="glassy-card rounded-lg p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-400">{title}</p>
          <p className="mt-2 text-3xl font-bold text-gray-100">{value}</p>
        </div>
        <div className={`rounded-lg p-3 ${bgColor} neon-glow-purple`}>
          {icon}
        </div>
      </div>
    </div>
  )
}

function QuickActionCard({ title, description, href, icon }: { title: string; description: string; href: string; icon: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="block p-4 rounded-lg glassy-card hover:bg-gray-800/40 transition-all group"
    >
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-500/20 text-indigo-400 group-hover:bg-indigo-500/30 group-hover:neon-glow transition-all">
          {icon}
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-gray-200 group-hover:text-indigo-300 transition-colors">{title}</h3>
          <p className="mt-1 text-sm text-gray-400">{description}</p>
        </div>
      </div>
    </Link>
  )
}

function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ')
}
