-- Setup Database for Gemini Embeddings
-- Run this in Supabase SQL Editor: https://supabase.com/dashboard/project/YOUR_PROJECT/sql

-- Enable required extensions
create extension if not exists vector with schema extensions;
create extension if not exists pg_net with schema extensions;

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
  embedding vector(768), -- Gemini text-embedding-004 uses 768 dimensions
  tenant_id uuid references public.tenants(id) on delete cascade,
  created_at timestamptz not null default now()
);

-- Create indexes for better performance
create index if not exists idx_documents_tenant on public.documents(tenant_id);
create index if not exists idx_document_sections_tenant on public.document_sections(tenant_id);
create index if not exists idx_document_sections_document on public.document_sections(document_id);

-- Create vector similarity index (using HNSW for fast searches)
create index if not exists idx_document_sections_embedding 
  on public.document_sections 
  using hnsw (embedding vector_cosine_ops);

-- Enable Row Level Security (RLS)
alter table public.documents enable row level security;
alter table public.document_sections enable row level security;

-- RLS Policies for documents
create policy if not exists "Users can view their tenant's documents"
  on public.documents for select
  using (true); -- Adjust based on your auth requirements

create policy if not exists "Service role can insert documents"
  on public.documents for insert
  with check (true); -- Backend uses service role key

create policy if not exists "Service role can update documents"
  on public.documents for update
  using (true);

create policy if not exists "Service role can delete documents"
  on public.documents for delete
  using (true);

-- RLS Policies for document_sections
create policy if not exists "Users can view their tenant's document sections"
  on public.document_sections for select
  using (true);

create policy if not exists "Service role can insert document sections"
  on public.document_sections for insert
  with check (true);

create policy if not exists "Service role can update document sections"
  on public.document_sections for update
  using (true);

create policy if not exists "Service role can delete document sections"
  on public.document_sections for delete
  using (true);

-- Create function to search documents by similarity
create or replace function match_document_sections(
  query_embedding vector(768),
  match_threshold float default 0.5,
  match_count int default 5,
  filter_tenant_id uuid default null
)
returns table (
  id bigint,
  document_id uuid,
  content text,
  similarity float
)
language plpgsql
as $$
begin
  return query
  select
    document_sections.id,
    document_sections.document_id,
    document_sections.content,
    1 - (document_sections.embedding <=> query_embedding) as similarity
  from document_sections
  where 
    (filter_tenant_id is null or document_sections.tenant_id = filter_tenant_id)
    and 1 - (document_sections.embedding <=> query_embedding) > match_threshold
  order by document_sections.embedding <=> query_embedding
  limit match_count;
end;
$$;

-- Verify tables were created
select 
  schemaname,
  tablename,
  tableowner
from pg_tables
where schemaname = 'public'
  and tablename in ('documents', 'document_sections', 'tenants')
order by tablename;

-- Success message
do $$
begin
  raise notice '✅ Database setup complete!';
  raise notice 'Tables created: documents, document_sections';
  raise notice 'Vector dimension: 768 (Gemini compatible)';
  raise notice 'Indexes created for fast similarity search';
end $$;








