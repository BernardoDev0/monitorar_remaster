-- Create table for queuing emails to be processed by the frontend (EmailJS) or background workers
-- This migration unblocks Edge Function 'send-confirmation-email' which inserts into public.email_queue

-- Ensure uuid generation function is available
create extension if not exists "pgcrypto";

-- Table
create table if not exists public.email_queue (
  id uuid primary key default gen_random_uuid(),
  recipient_email text not null,
  recipient_name text,
  employee_name text not null,
  "date" text not null, -- keeping string to match Edge Function payload
  refinery text,
  points integer,
  observations text,
  status text not null default 'pending' check (status in ('pending','sent','failed')),
  error text,
  created_at timestamptz not null default timezone('utc', now()),
  sent_at timestamptz,
  updated_at timestamptz not null default timezone('utc', now())
);

-- Indexes for common queries
create index if not exists email_queue_status_created_at_idx on public.email_queue (status, created_at desc);
create index if not exists email_queue_recipient_email_idx on public.email_queue (recipient_email);

-- RLS
alter table public.email_queue enable row level security;

-- Allow inserts from Edge Functions using the service role key (CREATE POLICY não suporta IF NOT EXISTS; usar DO block condicional)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'email_queue'
      AND policyname = 'Allow inserts from service role'
  ) THEN
    CREATE POLICY "Allow inserts from service role" ON public.email_queue
      FOR INSERT
      TO public
      WITH CHECK (auth.role() = 'service_role');
  END IF;
END
$$;

-- Optional: allow reading the queue to authenticated users (comment out if not needed)
-- create policy if not exists "Allow select for authenticated" on public.email_queue
--   for select
--   to authenticated
--   using (true);

-- Optional: allow updates (e.g., marking as sent/failed) to authenticated users (comment out if not needed)
-- create policy if not exists "Allow update for authenticated" on public.email_queue
--   for update
--   to authenticated
--   using (true)
--   with check (true);

-- Trigger to maintain updated_at
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$ language plpgsql;

create trigger email_queue_set_updated_at
before update on public.email_queue
for each row execute function public.set_updated_at();