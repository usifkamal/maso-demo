-- Multi-tenancy support migration
-- Adds tenant support to the White-Label AI Chatbot Platform

-- Create tenants table
create table tenants (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  domain text unique,
  api_key text unique not null,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now()
);

-- Create users table
create table users (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  email text not null,
  role text not null default 'user' check (role in ('admin', 'user')),
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now(),
  unique(tenant_id, email)
);

-- Add tenant_id to existing documents table
alter table documents 
add column tenant_id uuid references tenants(id) on delete cascade;

-- Add tenant_id to document_sections (chunks)
alter table document_sections 
add column tenant_id uuid references tenants(id) on delete cascade;

-- Create messages table
create table messages (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  user_id uuid references users(id) on delete set null,
  content text not null,
  role text not null check (role in ('user', 'assistant', 'system')),
  created_at timestamp with time zone not null default now()
);

-- Create usage_logs table
create table usage_logs (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  user_id uuid references users(id) on delete set null,
  action text not null,
  resource_type text,
  resource_id uuid,
  metadata jsonb,
  created_at timestamp with time zone not null default now()
);

-- Create indexes for performance
create index idx_documents_tenant_id on documents(tenant_id);
create index idx_document_sections_tenant_id on document_sections(tenant_id);
create index idx_messages_tenant_id on messages(tenant_id);
create index idx_usage_logs_tenant_id on usage_logs(tenant_id);
create index idx_users_tenant_id on users(tenant_id);

-- Enable RLS on all tables
alter table tenants enable row level security;
alter table users enable row level security;
alter table messages enable row level security;
alter table usage_logs enable row level security;

-- RLS Policies for tenants
create policy "Tenants can view their own data"
on tenants for select to authenticated using (
  id in (
    select tenant_id 
    from users 
    where id = auth.uid()
  )
);

create policy "Tenants can update their own data"
on tenants for update to authenticated using (
  id in (
    select tenant_id 
    from users 
    where id = auth.uid()
  )
);

-- RLS Policies for users
create policy "Users can view users in their tenant"
on users for select to authenticated using (
  tenant_id in (
    select tenant_id 
    from users 
    where id = auth.uid()
  )
);

create policy "Users can insert users in their tenant"
on users for insert to authenticated with check (
  tenant_id in (
    select tenant_id 
    from users 
    where id = auth.uid()
  )
);

create policy "Users can update users in their tenant"
on users for update to authenticated using (
  tenant_id in (
    select tenant_id 
    from users 
    where id = auth.uid()
  )
);

-- RLS Policies for documents (updated for multi-tenancy)
drop policy if exists "Users can insert documents" on documents;
drop policy if exists "Users can query their own documents" on documents;

create policy "Users can insert documents in their tenant"
on documents for insert to authenticated with check (
  tenant_id in (
    select tenant_id 
    from users 
    where id = auth.uid()
  )
);

create policy "Users can query documents in their tenant"
on documents for select to authenticated using (
  tenant_id in (
    select tenant_id 
    from users 
    where id = auth.uid()
  )
);

-- RLS Policies for document_sections (updated for multi-tenancy)
drop policy if exists "Users can insert document sections" on document_sections;
drop policy if exists "Users can update their own document sections" on document_sections;
drop policy if exists "Users can query their own document sections" on document_sections;

create policy "Users can insert document sections in their tenant"
on document_sections for insert to authenticated with check (
  tenant_id in (
    select tenant_id 
    from users 
    where id = auth.uid()
  )
);

create policy "Users can update document sections in their tenant"
on document_sections for update to authenticated using (
  tenant_id in (
    select tenant_id 
    from users 
    where id = auth.uid()
  )
);

create policy "Users can query document sections in their tenant"
on document_sections for select to authenticated using (
  tenant_id in (
    select tenant_id 
    from users 
    where id = auth.uid()
  )
);

-- RLS Policies for messages
create policy "Users can view messages in their tenant"
on messages for select to authenticated using (
  tenant_id in (
    select tenant_id 
    from users 
    where id = auth.uid()
  )
);

create policy "Users can insert messages in their tenant"
on messages for insert to authenticated with check (
  tenant_id in (
    select tenant_id 
    from users 
    where id = auth.uid()
  )
);

-- RLS Policies for usage_logs
create policy "Users can view usage logs in their tenant"
on usage_logs for select to authenticated using (
  tenant_id in (
    select tenant_id 
    from users 
    where id = auth.uid()
  )
);

create policy "Users can insert usage logs in their tenant"
on usage_logs for insert to authenticated with check (
  tenant_id in (
    select tenant_id 
    from users 
    where id = auth.uid()
  )
);

-- Create RPC function for tenant-specific document search
create or replace function search_documents_by_tenant(
  tenant_id_param uuid,
  query_text text,
  match_threshold float default 0.5,
  match_count int default 10
)
returns table (
  id bigint,
  document_id bigint,
  content text,
  similarity float
)
language plpgsql
security definer
as $$
declare
  query_embedding vector(384);
begin
  -- Get the embedding for the query text
  -- This would typically call an embedding service
  -- For now, we'll use a placeholder - you'll need to implement the actual embedding
  -- query_embedding := get_embedding(query_text);
  
  -- For now, return empty result - implement embedding service integration
  return query
  select 
    ds.id,
    ds.document_id,
    ds.content,
    0.0::float as similarity
  from document_sections ds
  where ds.tenant_id = tenant_id_param
  limit 0;
end;
$$;

-- Create function to get user's tenant_id
create or replace function get_user_tenant_id()
returns uuid
language plpgsql
security definer
as $$
begin
  return (
    select tenant_id 
    from users 
    where id = auth.uid()
  );
end;
$$;

-- Create function to check if user belongs to tenant
create or replace function user_belongs_to_tenant(tenant_id_param uuid)
returns boolean
language plpgsql
security definer
as $$
begin
  return exists (
    select 1 
    from users 
    where id = auth.uid() 
    and tenant_id = tenant_id_param
  );
end;
$$;

-- Update the existing match_document_sections function to include tenant filtering
create or replace function match_document_sections(
  embedding vector(384), 
  match_threshold float,
  tenant_id_param uuid default null
)
returns setof document_sections
language plpgsql
as $$
#variable_conflict use_variable
begin
  return query
  select *
  from document_sections
  where document_sections.embedding <#> embedding < -match_threshold
    and (tenant_id_param is null or document_sections.tenant_id = tenant_id_param)
  order by document_sections.embedding <#> embedding;
end;
$$;

-- Create updated_at trigger function
create or replace function update_updated_at_column()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- Add updated_at triggers
create trigger update_tenants_updated_at
  before update on tenants
  for each row
  execute function update_updated_at_column();

create trigger update_users_updated_at
  before update on users
  for each row
  execute function update_updated_at_column();
