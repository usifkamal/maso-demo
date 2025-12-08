# How to Create a Tenant for Testing

If you're getting a "Tenant not found" error when testing the widget, you need to create a tenant record in the database.

## Quick Fix: Create Tenant via SQL

1. **Open Supabase Dashboard** → SQL Editor

2. **Run this SQL** (replace with your user ID from dashboard/profile):

```sql
-- Get your user ID first (from dashboard/profile or auth.users table)
-- Then create a tenant record

INSERT INTO public.tenants (
  id,
  name,
  api_key,
  settings,
  is_onboarded
)
VALUES (
  'f8aa1a1a-436c-4faf-8807-2f341d16b38d', -- Your tenant ID (same as user ID or custom UUID)
  'My Test Tenant',
  'test_api_key_' || gen_random_uuid()::text,
  '{
    "primaryColor": "#4F46E5",
    "position": "bottom-right",
    "buttonText": "💬",
    "greeting": "Hello! How can I help you today?"
  }'::jsonb,
  false
)
ON CONFLICT (id) DO NOTHING;
```

## Alternative: Auto-Create Tenant on Sign Up

Add this database trigger to automatically create a tenant when a user signs up:

```sql
-- Function to create tenant on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Create tenant for new user
  INSERT INTO public.tenants (
    id,
    name,
    api_key,
    settings,
    is_onboarded
  )
  VALUES (
    NEW.id, -- Use user ID as tenant ID
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    'api_key_' || gen_random_uuid()::text,
    '{
      "primaryColor": "#4F46E5",
      "position": "bottom-right",
      "buttonText": "💬",
      "greeting": "Hello! How can I help you today?"
    }'::jsonb,
    false
  )
  ON CONFLICT (id) DO NOTHING;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to run on user creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
```

## Verify Tenant Exists

Run this query to check:

```sql
SELECT id, name, api_key, settings, is_onboarded 
FROM public.tenants 
WHERE id = 'f8aa1a1a-436c-4faf-8807-2f341d16b38d';
```

If the query returns a row, your tenant exists! If not, create it using one of the methods above.






