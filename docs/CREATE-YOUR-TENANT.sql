-- Quick SQL to create your tenant record
-- Replace 'f8aa1a1a-436c-4faf-8807-2f341d16b38d' with your actual tenant ID
-- Get your tenant ID from: http://localhost:3000/dashboard/profile

-- Option 1: Create tenant with your specific ID
-- First, ensure settings column exists
ALTER TABLE public.tenants
ADD COLUMN IF NOT EXISTS settings JSONB DEFAULT '{}'::jsonb;

ALTER TABLE public.tenants
ADD COLUMN IF NOT EXISTS is_onboarded BOOLEAN DEFAULT FALSE;

-- Now create your tenant
INSERT INTO public.tenants (
  id,
  name,
  api_key,
  settings,
  is_onboarded
)
VALUES (
  'f8aa1a1a-436c-4faf-8807-2f341d16b38d', -- REPLACE THIS with your tenant ID
  'My Test Tenant',
  'api_key_' || gen_random_uuid()::text,
  '{
    "primaryColor": "#4F46E5",
    "position": "bottom-right",
    "buttonText": "💬",
    "greeting": "Hello! How can I help you today?"
  }'::jsonb,
  false
)
ON CONFLICT (id) DO UPDATE SET
  name = COALESCE(EXCLUDED.name, tenants.name),
  settings = COALESCE(EXCLUDED.settings, tenants.settings);

-- Option 2: Auto-create tenants for ALL existing users (recommended)
-- This will create tenant records for all users in auth.users that don't have one

-- First, ensure columns exist
ALTER TABLE public.tenants
ADD COLUMN IF NOT EXISTS settings JSONB DEFAULT '{}'::jsonb;

ALTER TABLE public.tenants
ADD COLUMN IF NOT EXISTS is_onboarded BOOLEAN DEFAULT FALSE;

-- Now create tenants for all users
INSERT INTO public.tenants (
  id,
  name,
  api_key,
  settings,
  is_onboarded
)
SELECT 
  u.id,
  COALESCE(
    u.raw_user_meta_data->>'full_name',
    split_part(u.email, '@', 1),
    'User'
  ) as name,
  'api_key_' || gen_random_uuid()::text as api_key,
  '{
    "primaryColor": "#4F46E5",
    "position": "bottom-right",
    "buttonText": "💬",
    "greeting": "Hello! How can I help you today?"
  }'::jsonb as settings,
  false as is_onboarded
FROM auth.users u
WHERE NOT EXISTS (
  SELECT 1 FROM public.tenants t WHERE t.id = u.id
)
ON CONFLICT (id) DO NOTHING;

-- Verify your tenant exists
SELECT 
  id,
  name,
  api_key,
  settings,
  is_onboarded,
  created_at
FROM public.tenants 
WHERE id = 'f8aa1a1a-436c-4faf-8807-2f341d16b38d'; -- REPLACE with your tenant ID

