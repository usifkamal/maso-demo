-- Add settings column to tenants table for widget customization
-- Run this in your Supabase SQL Editor

-- Add settings column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'tenants' 
    AND column_name = 'settings'
  ) THEN
    ALTER TABLE public.tenants 
    ADD COLUMN settings jsonb DEFAULT '{}'::jsonb;
    
    COMMENT ON COLUMN public.tenants.settings IS 'Widget customization settings (primaryColor, logo, greeting, etc.)';
  END IF;
END $$;

-- Example: Update a tenant with default settings
-- Uncomment and modify the tenant_id to set default settings for your tenant
/*
UPDATE public.tenants
SET settings = jsonb_build_object(
  'primaryColor', '#4F46E5',
  'logo', null,
  'greeting', 'Hello! How can I help you today?'
)
WHERE id = 'YOUR_TENANT_ID_HERE';
*/

-- Verify the column was added
SELECT 
  column_name, 
  data_type, 
  column_default,
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'tenants' 
AND column_name = 'settings';







