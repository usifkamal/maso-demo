-- Create a tenant with API key for development/testing
-- This script creates a default tenant and generates an API key for it

-- Insert or update the default tenant
INSERT INTO tenants (name, domain, api_key)
VALUES (
  'Default Tenant',
  'localhost',
  'dev_api_key_' || encode(gen_random_bytes(32), 'hex')
)
ON CONFLICT (domain) DO UPDATE SET
  name = EXCLUDED.name,
  api_key = 'dev_api_key_' || encode(gen_random_bytes(32), 'hex')
RETURNING id, name, domain, api_key, created_at;

-- Instructions:
-- 1. Run this SQL in your Supabase SQL Editor
-- 2. Copy the api_key from the result (looks like: dev_api_key_abc123...)
-- 3. Add it to your frontend/.env.local as NEXT_PUBLIC_TENANT_API_KEY
-- 4. Add it to your backend/.env.local as well
-- 5. Restart your dev servers

