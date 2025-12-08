-- Migration: create core multi-tenant tables for White-Label AI Chatbot MVP
-- Created: 2025-10-22

-- Enable pgcrypto for gen_random_uuid()
create extension if not exists pgcrypto;

-- Tenants table: stores tenant metadata and API key
create table if not exists public.tenants (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  domain text unique,
  api_key text unique not null,
  created_at timestamptz not null default now()
);

-- Users table: tenant-scoped users. password_hash nullable to support external auth providers.
create table if not exists public.users (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  email text not null,
  password_hash text,
  role text not null default 'member',
  created_at timestamptz not null default now(),
  constraint users_tenant_email_unique unique (tenant_id, email)
);

-- Requests table: tracks usage per tenant/day (lightweight counter)
create table if not exists public.requests (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  user_id uuid references public.users(id) on delete set null,
  endpoint text not null,
  "count" integer not null default 0,
  day date not null,
  created_at timestamptz not null default now()
);

create index if not exists requests_tenant_day_idx on public.requests (tenant_id, day);
create index if not exists requests_tenant_endpoint_idx on public.requests (tenant_id, endpoint);

-- Documents table: stores uploaded files / crawled URLs and pointer to stored content
create table if not exists public.documents (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  title text,
  source text,
  content_path text,
  created_at timestamptz not null default now()
);

create index if not exists documents_tenant_idx on public.documents (tenant_id);

-- Optional: audit table triggers or policies can be added later for Row Level Security.
