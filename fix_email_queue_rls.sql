-- EXECUTE NO SUPABASE SQL EDITOR PARA CORRIGIR O PROBLEMA DE RLS

-- Adicionar política para permitir INSERT pelo frontend (anon/authenticated)
CREATE POLICY IF NOT EXISTS "Allow insert for frontend" ON public.email_queue
  FOR INSERT
  TO public
  WITH CHECK (true);

-- Verificar se as políticas foram criadas corretamente
SELECT 
  policyname,
  cmd,
  roles
FROM pg_policies 
WHERE tablename = 'email_queue'
ORDER BY policyname;