# Quick Fix: Create Your Tenant Record

## The Problem
You're getting "Tenant not found" because the tenant record doesn't exist in the database.

## Solution: Create Tenant via Supabase Dashboard

### Step 1: Open Supabase SQL Editor
1. Go to your Supabase Dashboard
2. Click **SQL Editor** in the sidebar
3. Click **New Query**

### Step 2: Run This SQL
Replace `f8aa1a1a-436c-4faf-8807-2f341d16b38d` with your actual tenant ID:

```sql
INSERT INTO public.tenants (
  id,
  name,
  api_key,
  settings,
  is_onboarded
)
VALUES (
  'f8aa1a1a-436c-4faf-8807-2f341d16b38d', -- Your tenant ID
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
  name = EXCLUDED.name,
  settings = EXCLUDED.settings;
```

### Step 3: Verify
```sql
SELECT id, name, api_key, settings 
FROM public.tenants 
WHERE id = 'f8aa1a1a-436c-4faf-8807-2f341d16b38d';
```

## Alternative: Auto-Create for All Users

Run this migration to automatically create tenants for all existing users:

```sql
-- Create tenant for existing users that don't have one
INSERT INTO public.tenants (
  id,
  name,
  api_key,
  settings,
  is_onboarded
)
SELECT 
  u.id,
  COALESCE(u.raw_user_meta_data->>'full_name', split_part(u.email, '@', 1), 'User'),
  'api_key_' || gen_random_uuid()::text,
  '{
    "primaryColor": "#4F46E5",
    "position": "bottom-right",
    "buttonText": "💬",
    "greeting": "Hello! How can I help you today?"
  }'::jsonb,
  false
FROM auth.users u
WHERE NOT EXISTS (
  SELECT 1 FROM public.tenants t WHERE t.id = u.id
)
ON CONFLICT (id) DO NOTHING;
```

After running this, refresh your test page - the widget should work!






