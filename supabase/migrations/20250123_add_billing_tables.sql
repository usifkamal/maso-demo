-- Migration: Add billing and subscription tables
-- Created: 2025-01-23

-- Create plans table
CREATE TABLE IF NOT EXISTS public.plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  features JSONB DEFAULT '{}'::jsonb,
  price NUMERIC(10, 2) NOT NULL DEFAULT 0,
  currency TEXT DEFAULT 'USD',
  interval TEXT DEFAULT 'month' CHECK (interval IN ('month', 'year')),
  max_bots INTEGER DEFAULT 1,
  max_docs INTEGER DEFAULT 10,
  max_chat_messages INTEGER DEFAULT 1000,
  is_active BOOLEAN DEFAULT true,
  stripe_price_id TEXT,
  lemonsqueezy_product_id TEXT,
  lemonsqueezy_variant_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create subscriptions table
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  plan_id UUID REFERENCES public.plans(id),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'canceled', 'past_due', 'trialing', 'incomplete', 'incomplete_expired')),
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  cancel_at_period_end BOOLEAN DEFAULT false,
  stripe_subscription_id TEXT,
  stripe_customer_id TEXT,
  lemonsqueezy_subscription_id TEXT,
  lemonsqueezy_customer_id TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS subscriptions_tenant_idx ON public.subscriptions(tenant_id);
CREATE INDEX IF NOT EXISTS subscriptions_status_idx ON public.subscriptions(status);
CREATE INDEX IF NOT EXISTS subscriptions_stripe_idx ON public.subscriptions(stripe_subscription_id) WHERE stripe_subscription_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS subscriptions_lemonsqueezy_idx ON public.subscriptions(lemonsqueezy_subscription_id) WHERE lemonsqueezy_subscription_id IS NOT NULL;

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_plans_updated_at BEFORE UPDATE ON public.plans
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_subscriptions_updated_at BEFORE UPDATE ON public.subscriptions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert default plans
INSERT INTO public.plans (name, description, features, price, interval, max_bots, max_docs, max_chat_messages, is_active) VALUES
  ('Free', 'Perfect for trying out the platform', '{"api_access": true, "basic_support": true}', 0, 'month', 1, 10, 1000, true),
  ('Starter', 'For small businesses', '{"api_access": true, "priority_support": true, "custom_branding": true}', 29, 'month', 3, 100, 10000, true),
  ('Professional', 'For growing teams', '{"api_access": true, "priority_support": true, "custom_branding": true, "advanced_analytics": true}', 99, 'month', 10, 500, 50000, true),
  ('Enterprise', 'For large organizations', '{"api_access": true, "dedicated_support": true, "custom_branding": true, "advanced_analytics": true, "sla": true}', 299, 'month', -1, -1, -1, true)
ON CONFLICT DO NOTHING;

-- Add comments
COMMENT ON TABLE public.plans IS 'Available subscription plans';
COMMENT ON TABLE public.subscriptions IS 'Tenant subscriptions to plans';
COMMENT ON COLUMN public.plans.max_bots IS '-1 means unlimited';
COMMENT ON COLUMN public.plans.max_docs IS '-1 means unlimited';
COMMENT ON COLUMN public.plans.max_chat_messages IS '-1 means unlimited';

