-- Migration: Add onboarding status and chat memory system
-- Created: 2025-01-23

-- Add is_onboarded column to tenants table
ALTER TABLE public.tenants
ADD COLUMN IF NOT EXISTS is_onboarded BOOLEAN DEFAULT FALSE;

-- Create chat_memory table for session-based chat history
CREATE TABLE IF NOT EXISTS public.chat_memory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id TEXT NOT NULL,
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  user_message TEXT NOT NULL,
  ai_message TEXT NOT NULL,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for efficient queries
CREATE INDEX IF NOT EXISTS chat_memory_session_idx ON public.chat_memory(session_id);
CREATE INDEX IF NOT EXISTS chat_memory_tenant_idx ON public.chat_memory(tenant_id);
CREATE INDEX IF NOT EXISTS chat_memory_created_idx ON public.chat_memory(created_at DESC);

-- Add comment for documentation
COMMENT ON TABLE public.chat_memory IS 'Stores chat history per session for context-aware conversations';
COMMENT ON COLUMN public.tenants.is_onboarded IS 'Tracks whether tenant has completed the onboarding wizard';






