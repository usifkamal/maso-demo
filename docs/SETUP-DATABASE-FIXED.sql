-- Setup Database for Gemini Embeddings - FIXED VERSION
-- Run this in Supabase SQL Editor

-- Enable required extensions
create extension if not exists vector with schema extensions;

-- Create documents table (if not exists)
create table if not exists public.documents (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid references public.tenants(id) on delete cascade,
  title text,
  source text,
  content_path text,
  created_at timestamptz not null default now()
);

-- Create document_sections table with Gemini's 768-dimension vectors
create table if not exists public.document_sections (
  id bigserial primary key,
  document_id uuid not null references public.documents(id) on delete cascade,
  content text not null,
  embedding vector(768), -- Gemini uses 768 dimensions
  tenant_id uuid references public.tenants(id) on delete cascade,
  created_at timestamptz not null default now()
);

-- Create indexes
create index if not exists idx_documents_tenant on public.documents(tenant_id);
create index if not exists idx_document_sections_tenant on public.document_sections(tenant_id);
create index if not exists idx_document_sections_document on public.document_sections(document_id);
create index if not exists idx_document_sections_embedding 
  on public.document_sections 
  using hnsw (embedding vector_cosine_ops);

-- Enable RLS
alter table public.documents enable row level security;
alter table public.document_sections enable row level security;

-- Drop existing policies if they exist (to avoid conflicts)
drop policy if exists "Service role full access documents" on public.documents;
drop policy if exists "Service role full access document_sections" on public.document_sections;

-- Create RLS Policies (allow service role to do everything)
create policy "Service role full access documents"
  on public.documents for all using (true) with check (true);

create policy "Service role full access document_sections"
  on public.document_sections for all using (true) with check (true);








