-- Add settings column to tenants table if it doesn't exist
-- This column stores widget configuration (color, logo, greeting, etc.)

ALTER TABLE public.tenants
ADD COLUMN IF NOT EXISTS settings JSONB DEFAULT '{}'::jsonb;

-- Add comment
COMMENT ON COLUMN public.tenants.settings IS 'Widget and tenant-specific settings stored as JSON (color, logo, greeting, position, buttonText)';






