-- Auto-create tenant when user signs up
-- This ensures every user has a tenant record for widget functionality

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
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1), 'User'),
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

-- Also create tenant for existing users that don't have one
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






