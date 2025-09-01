-- Add RLS policies so the frontend (anon/authenticated) can read and update the queue
-- This enables the EmailQueueWorker to fetch pending emails and mark them as sent/failed

-- Ensure RLS is enabled (idempotent)
alter table if exists public.email_queue enable row level security;

-- Create SELECT policy (idempotent via DO block)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'email_queue' AND policyname = 'Allow select for clients'
  ) THEN
    CREATE POLICY "Allow select for clients" ON public.email_queue
      FOR SELECT
      TO public
      USING (true);
  END IF;
END
$$;

-- Create UPDATE policy (idempotent via DO block)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'email_queue' AND policyname = 'Allow update for clients'
  ) THEN
    CREATE POLICY "Allow update for clients" ON public.email_queue
      FOR UPDATE
      TO public
      USING (true)
      WITH CHECK (true);
  END IF;
END
$$;