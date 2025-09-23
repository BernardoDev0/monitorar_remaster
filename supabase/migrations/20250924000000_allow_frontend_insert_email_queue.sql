-- Allow frontend (anon/authenticated users) to insert into email_queue
-- This enables the addToEmailQueue function to work from the browser

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' 
      AND tablename = 'email_queue' 
      AND policyname = 'Allow insert for frontend'
  ) THEN
    CREATE POLICY "Allow insert for frontend" ON public.email_queue
      FOR INSERT
      TO public
      WITH CHECK (true);
  END IF;
END
$$;