-- Create chats table to store chat history
-- This table stores complete chat sessions for each user

-- Create the chats table
create table if not exists public.chats (
  id text primary key,
  payload jsonb not null,
  user_id uuid references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Create indexes for better query performance
create index if not exists idx_chats_user_id on public.chats(user_id);
create index if not exists idx_chats_created_at on public.chats(created_at desc);

-- Enable RLS (Row Level Security)
alter table public.chats enable row level security;

-- Drop existing policies if they exist
drop policy if exists "Users can view their own chats" on public.chats;
drop policy if exists "Users can insert their own chats" on public.chats;
drop policy if exists "Users can update their own chats" on public.chats;
drop policy if exists "Users can delete their own chats" on public.chats;
drop policy if exists "Service role full access chats" on public.chats;

-- Create RLS policies for user access
create policy "Users can view their own chats"
  on public.chats for select
  using (auth.uid() = user_id);

create policy "Users can insert their own chats"
  on public.chats for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own chats"
  on public.chats for update
  using (auth.uid() = user_id);

create policy "Users can delete their own chats"
  on public.chats for delete
  using (auth.uid() = user_id);

-- Create policy for service role (used by API routes)
create policy "Service role full access chats"
  on public.chats for all
  using (true)
  with check (true);

-- Create function to update the updated_at timestamp
create or replace function public.update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Create trigger to automatically update updated_at
drop trigger if exists update_chats_updated_at on public.chats;
create trigger update_chats_updated_at
  before update on public.chats
  for each row
  execute function public.update_updated_at_column();

-- Grant permissions
grant all on public.chats to service_role;
grant select, insert, update, delete on public.chats to authenticated;








