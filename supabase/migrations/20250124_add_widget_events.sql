-- Create widget_events table for telemetry
create table if not exists public.widget_events (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  event_type text not null default 'widget_load', -- 'widget_load', 'widget_open', etc.
  referrer_origin text, -- Origin of the page hosting the widget
  user_agent text,
  created_at timestamptz not null default now()
);

-- Index for fast queries
create index if not exists widget_events_tenant_id_idx on public.widget_events (tenant_id);
create index if not exists widget_events_created_at_idx on public.widget_events (created_at);
create index if not exists widget_events_event_type_idx on public.widget_events (event_type);

-- Row Level Security (RLS)
alter table public.widget_events enable row level security;

-- Policy: Service role can insert (for API usage)
create policy "Service role can insert widget events"
  on public.widget_events
  for insert
  to service_role
  with check (true);

-- Policy: Tenants can view their own events
create policy "Tenants can view their own widget events"
  on public.widget_events
  for select
  to authenticated
  using (
    tenant_id in (
      select id from public.tenants where id = tenant_id
    )
  );






