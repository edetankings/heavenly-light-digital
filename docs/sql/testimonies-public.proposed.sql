-- REVIEW ONLY. Not a migration. Do not run on production without approval.
-- Compare live schema/policies first. Execute as the trusted database owner.
-- This transaction rolls back by default, including all definitions.
BEGIN;

-- Deliberately narrow definer function: no arguments, dynamic SQL, private
-- columns, or writes. It bypasses table RLS ONLY to publish approved content.
-- The owner must be a trusted role that can read testimonies (e.g. postgres).
-- An invoker view over admin-only table RLS cannot serve ordinary visitors.
CREATE FUNCTION public.list_approved_testimonies()
RETURNS TABLE (
  id uuid, name text, title text, message text,
  is_approved boolean, created_at timestamptz
)
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT t.id, t.name, t.title, t.message, t.is_approved, t.created_at
  FROM public.testimonies AS t
  WHERE t.is_approved IS TRUE;
$$;
REVOKE ALL ON FUNCTION public.list_approved_testimonies() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.list_approved_testimonies() TO anon, authenticated;

CREATE OR REPLACE VIEW public.testimonies_public
WITH (security_invoker = true, security_barrier = true) AS
SELECT id, name, title, message, is_approved, created_at
FROM public.list_approved_testimonies();
REVOKE ALL ON public.testimonies_public FROM PUBLIC, anon, authenticated;
GRANT SELECT ON public.testimonies_public TO anon, authenticated;

-- Leave direct-table admin RLS, submission validation, and has_role grants intact.
-- No public SELECT policy is added to the table: that could expose email.
-- Before approval, verify as anon, authenticated non-admin, and admin:
-- view/RPC return approved rows without email; direct public table SELECT does
-- not reveal email or pending rows; existing admin CRUD still works.
ROLLBACK;
