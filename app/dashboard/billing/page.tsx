'use client'

import { useState, useEffect } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Button } from '@/components/ui/button'
import toast from 'react-hot-toast'
import { IconCheck, IconStar } from '@/components/ui/icons'

interface Plan {
  id: string
  name: string
  description: string
  price: number
  interval: string
  max_bots: number
  max_docs: number
  max_chat_messages: number
  features: any
  is_active: boolean
}

interface Subscription {
  id: string
  plan_id: string
  status: string
  current_period_end: string | null
  cancel_at_period_end: boolean
}

export default function BillingPage() {
  const supabase = createClientComponentClient()
  const [plans, setPlans] = useState<Plan[]>([])
  const [subscription, setSubscription] = useState<Subscription | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isUpgrading, setIsUpgrading] = useState<string | null>(null)

  useEffect(() => {
    async function loadData() {
      try {
        const { data: { user }, error: userError } = await supabase.auth.getUser()
        
        if (userError) {
          console.error('Auth error:', userError)
          toast.error('Authentication error. Please sign in again.')
          return
        }
        
        if (!user) {
          toast.error('Please sign in')
          return
        }

        const tenantId = user.user_metadata?.tenant_id || user.id
        console.log('Loading billing data for tenant:', tenantId)

        // Load plans
        const { data: plansData, error: plansError } = await supabase
          .from('plans')
          .select('*')
          .eq('is_active', true)
          .order('price', { ascending: true })

        if (plansError) {
          console.error('Plans query error:', plansError)
          // Check if table doesn't exist
          if (plansError.code === 'PGRST116' || plansError.message?.includes('relation') || plansError.message?.includes('does not exist')) {
            toast.error('Billing tables not found. Please run the database migration first.')
            return
          }
          throw plansError
        }
        
        console.log('Plans loaded:', plansData?.length || 0)
        setPlans(plansData || [])

        // Load current subscription
        const { data: subData, error: subError } = await supabase
          .from('subscriptions')
          .select('*')
          .eq('tenant_id', tenantId)
          .eq('status', 'active')
          .maybeSingle()

        if (subError) {
          // Check if table doesn't exist
          if (subError.code === 'PGRST116' || subError.message?.includes('relation') || subError.message?.includes('does not exist')) {
            console.warn('Subscriptions table not found. Run migration first.')
            setSubscription(null)
          } else {
            console.error('Subscription query error:', subError)
            // Don't throw - subscription is optional
            setSubscription(null)
          }
        } else {
          console.log('Subscription loaded:', subData ? 'Found' : 'None')
          setSubscription(subData || null)
        }
      } catch (error) {
        console.error('Error loading billing data:', error)
        const errorMessage = error instanceof Error ? error.message : 'Unknown error'
        console.error('Full error details:', JSON.stringify(error, null, 2))
        toast.error(`Failed to load billing information: ${errorMessage}`)
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [supabase])

  const handleUpgrade = async (planId: string) => {
    setIsUpgrading(planId)
    try {
      // TODO: Integrate with LemonSqueezy or Stripe
      // For now, just create a subscription record
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        toast.error('Please sign in')
        return
      }

      const tenantId = user.user_metadata?.tenant_id || user.id

      // Check if subscription exists
      const { data: existingSub } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('tenant_id', tenantId)
        .eq('status', 'active')
        .single()

      if (existingSub) {
        // Update existing subscription
        const { error } = await supabase
          .from('subscriptions')
          .update({
            plan_id: planId,
            status: 'active',
            current_period_start: new Date().toISOString(),
            current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
            cancel_at_period_end: false
          })
          .eq('id', existingSub.id)

        if (error) throw error
        toast.success('Plan updated successfully!')
      } else {
        // Create new subscription
        const { error } = await supabase
          .from('subscriptions')
          .insert({
            tenant_id: tenantId,
            plan_id: planId,
            status: 'active',
            current_period_start: new Date().toISOString(),
            current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
          })

        if (error) throw error
        toast.success('Subscription created successfully!')
      }

      // Reload data
      const { data: subData } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('tenant_id', tenantId)
        .eq('status', 'active')
        .maybeSingle()

      setSubscription(subData || null)
    } catch (error) {
      console.error('Upgrade error:', error)
      toast.error('Failed to upgrade plan. Please try again.')
    } finally {
      setIsUpgrading(null)
    }
  }

  const getCurrentPlan = () => {
    if (!subscription || !plans.length) return null
    return plans.find(p => p.id === subscription.plan_id)
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price)
  }

  const formatFeatureValue = (value: number) => {
    if (value === -1) return 'Unlimited'
    return value.toLocaleString()
  }

  if (isLoading) {
    return (
      <div className="flex h-[calc(100vh-64px)] items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading plans...</p>
        </div>
      </div>
    )
  }

  // Show error message if tables don't exist
  if (plans.length === 0 && !isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Billing & Plans</h1>
        </div>
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-yellow-900 mb-2">Database Migration Required</h2>
          <p className="text-yellow-800 mb-4">
            The billing tables (plans and subscriptions) have not been created yet. Please run the database migration first.
          </p>
          <div className="bg-white rounded p-4 border border-yellow-200">
            <p className="text-sm font-mono text-gray-900 mb-2">Migration file location:</p>
            <code className="text-xs text-gray-700">supabase/migrations/20250123_add_billing_tables.sql</code>
            <p className="text-sm text-gray-600 mt-3">
              Run this SQL file in your Supabase SQL Editor or via the Supabase CLI.
            </p>
          </div>
        </div>
      </div>
    )
  }

  const currentPlan = getCurrentPlan()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Billing & Plans</h1>
        <p className="mt-2 text-white">
          Choose the plan that fits your needs. Upgrade or downgrade at any time.
        </p>
      </div>

      {currentPlan && (
        <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-indigo-900">Current Plan</h2>
              <p className="text-indigo-700 mt-1">{currentPlan.name}</p>
              {subscription?.current_period_end && (
                <p className="text-sm text-indigo-600 mt-1">
                  Renews on {new Date(subscription.current_period_end).toLocaleDateString()}
                </p>
              )}
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-indigo-900">
                {formatPrice(currentPlan.price)}
                <span className="text-base font-normal text-indigo-600">
                  /{currentPlan.interval}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {plans.map((plan) => {
          const isCurrent = currentPlan?.id === plan.id
          const features = typeof plan.features === 'string' 
            ? JSON.parse(plan.features) 
            : plan.features || {}

          return (
            <div
              key={plan.id}
              className={cn(
                'bg-white rounded-lg border-2 p-6 flex flex-col',
                isCurrent
                  ? 'border-indigo-600 shadow-lg'
                  : 'border-gray-200 hover:border-indigo-300 hover:shadow-md transition-all'
              )}
            >
              {isCurrent && (
                <div className="mb-4">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-indigo-100 text-indigo-800">
                    Current Plan
                  </span>
                </div>
              )}

              <div className="flex-1">
                <h3 className="text-2xl font-bold text-gray-900">{plan.name}</h3>
                {plan.description && (
                  <p className="text-sm text-gray-600 mt-1">{plan.description}</p>
                )}

                <div className="mt-4">
                  <div className="flex items-baseline">
                    <span className="text-4xl font-bold text-gray-900">
                      {formatPrice(plan.price)}
                    </span>
                    {plan.price > 0 && (
                      <span className="text-gray-600 ml-2">
                        /{plan.interval}
                      </span>
                    )}
                  </div>
                </div>

                <div className="mt-6 space-y-3">
                  <div className="flex items-start">
                    <IconCheck className="h-5 w-5 text-indigo-600 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-gray-700 ml-2">
                      <strong>{formatFeatureValue(plan.max_bots)}</strong> bots
                    </span>
                  </div>
                  <div className="flex items-start">
                    <IconCheck className="h-5 w-5 text-indigo-600 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-gray-700 ml-2">
                      <strong>{formatFeatureValue(plan.max_docs)}</strong> documents
                    </span>
                  </div>
                  <div className="flex items-start">
                    <IconCheck className="h-5 w-5 text-indigo-600 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-gray-700 ml-2">
                      <strong>{formatFeatureValue(plan.max_chat_messages)}</strong> chat messages/month
                    </span>
                  </div>
                  {features.api_access && (
                    <div className="flex items-start">
                      <IconCheck className="h-5 w-5 text-indigo-600 mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-gray-700 ml-2">API Access</span>
                    </div>
                  )}
                  {features.priority_support && (
                    <div className="flex items-start">
                      <IconCheck className="h-5 w-5 text-indigo-600 mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-gray-700 ml-2">Priority Support</span>
                    </div>
                  )}
                  {features.custom_branding && (
                    <div className="flex items-start">
                      <IconCheck className="h-5 w-5 text-indigo-600 mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-gray-700 ml-2">Custom Branding</span>
                    </div>
                  )}
                  {features.advanced_analytics && (
                    <div className="flex items-start">
                      <IconCheck className="h-5 w-5 text-indigo-600 mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-gray-700 ml-2">Advanced Analytics</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-6">
                {isCurrent ? (
                  <Button disabled className="w-full" variant="outline">
                    Current Plan
                  </Button>
                ) : (
                  <Button
                    onClick={() => handleUpgrade(plan.id)}
                    disabled={isUpgrading === plan.id}
                    className="w-full"
                  >
                    {isUpgrading === plan.id ? 'Processing...' : plan.price === 0 ? 'Get Started' : 'Upgrade'}
                  </Button>
                )}
              </div>
            </div>
          )
        })}
      </div>

      <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Payment Information</h3>
        <p className="text-sm text-gray-600">
          Payment processing will be integrated with LemonSqueezy or Stripe. For now, plan upgrades are stored locally.
          To enable actual payments, configure your payment provider API keys in the environment variables.
        </p>
      </div>
    </div>
  )
}

function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ')
}

