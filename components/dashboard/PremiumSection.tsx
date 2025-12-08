'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { IconCheck, IconStar, IconArrowRight } from '@/components/ui/icons'

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

export function PremiumSection() {
  const supabase = createClientComponentClient()
  const [currentPlan, setCurrentPlan] = useState<Plan | null>(null)
  const [subscription, setSubscription] = useState<Subscription | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [hasUpgrade, setHasUpgrade] = useState(false)

  useEffect(() => {
    async function loadData() {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        const tenantId = user.user_metadata?.tenant_id || user.id

        // Load plans
        const { data: plansData } = await supabase
          .from('plans')
          .select('*')
          .eq('is_active', true)
          .order('price', { ascending: true })

        // Load current subscription
        const { data: subData } = await supabase
          .from('subscriptions')
          .select('*')
          .eq('tenant_id', tenantId)
          .eq('status', 'active')
          .maybeSingle()

        if (subData && plansData) {
          const plan = plansData.find(p => p.id === subData.plan_id)
          setCurrentPlan(plan || null)
          setSubscription(subData)
          
          // Check if there's a higher tier plan available
          if (plan && plansData.length > 1) {
            const currentPlanIndex = plansData.findIndex(p => p.id === plan.id)
            setHasUpgrade(currentPlanIndex < plansData.length - 1)
          }
        } else if (plansData && plansData.length > 0) {
          // No subscription, default to Free plan
          const freePlan = plansData.find(p => p.price === 0) || plansData[0]
          setCurrentPlan(freePlan)
          setHasUpgrade(true)
        }
      } catch (error) {
        console.error('Error loading subscription data:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [supabase])

  if (isLoading) {
    return (
      <div className="glassy-card rounded-lg p-6 neon-glow">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-700 rounded w-1/4 mb-4"></div>
          <div className="h-4 bg-gray-700 rounded w-1/2"></div>
        </div>
      </div>
    )
  }

  if (!currentPlan) {
    return null
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price)
  }

  const isPremium = currentPlan.price > 0

  return (
    <div className="glassy-card rounded-lg p-6 neon-glow">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <h2 className="text-xl font-semibold text-gray-100">Subscription Plan</h2>
          {isPremium && (
            <span className="px-2 py-1 rounded-full text-xs font-semibold bg-gradient-to-r from-yellow-500/20 to-orange-500/20 text-yellow-300 border border-yellow-500/30 flex items-center gap-1">
              <IconStar className="h-3 w-3" />
              Premium
            </span>
          )}
        </div>
        {hasUpgrade && (
          <Link
            href="/dashboard/billing"
            className="text-sm font-medium text-indigo-400 hover:text-indigo-300 flex items-center gap-1 transition-colors"
          >
            Upgrade <IconArrowRight className="h-4 w-4" />
          </Link>
        )}
      </div>

      <div className="space-y-4">
        <div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-gray-100">
              {formatPrice(currentPlan.price)}
            </span>
            {currentPlan.price > 0 && (
              <span className="text-gray-400 text-sm">
                /{currentPlan.interval}
              </span>
            )}
          </div>
          <p className="text-lg font-medium text-gray-200 mt-1">{currentPlan.name}</p>
          {currentPlan.description && (
            <p className="text-sm text-gray-400 mt-1">{currentPlan.description}</p>
          )}
        </div>

        {subscription?.current_period_end && (
          <div className="pt-4 border-t border-gray-700/30">
            <p className="text-sm text-gray-400">
              {subscription.cancel_at_period_end ? (
                <>Cancels on {new Date(subscription.current_period_end).toLocaleDateString()}</>
              ) : (
                <>Renews on {new Date(subscription.current_period_end).toLocaleDateString()}</>
              )}
            </p>
          </div>
        )}

        <div className="pt-4 border-t border-gray-700/30 space-y-2">
          <div className="flex items-center gap-2 text-sm text-gray-300">
            <IconCheck className="h-4 w-4 text-green-400 flex-shrink-0" />
            <span>
              <strong>{currentPlan.max_bots === -1 ? 'Unlimited' : currentPlan.max_bots}</strong> bots
            </span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-300">
            <IconCheck className="h-4 w-4 text-green-400 flex-shrink-0" />
            <span>
              <strong>{currentPlan.max_docs === -1 ? 'Unlimited' : currentPlan.max_docs.toLocaleString()}</strong> documents
            </span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-300">
            <IconCheck className="h-4 w-4 text-green-400 flex-shrink-0" />
            <span>
              <strong>{currentPlan.max_chat_messages === -1 ? 'Unlimited' : currentPlan.max_chat_messages.toLocaleString()}</strong> messages/month
            </span>
          </div>
        </div>

        {hasUpgrade && (
          <Link
            href="/dashboard/billing"
            className="block mt-4 w-full text-center px-4 py-2 rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-medium hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 neon-glow-purple"
          >
            Upgrade Plan
          </Link>
        )}
      </div>
    </div>
  )
}


