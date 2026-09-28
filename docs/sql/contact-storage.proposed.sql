-- REVIEW ONLY. Not automatically applied by Supabase CLI or the app build.
-- Requires owner approval and nonproduction verification before installation.
-- Storage only: no paid service, email delivery, or database trigger is introduced.
BEGIN;

CREATE TABLE public.contact_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL CHECK (char_length(btrim(name)) BETWEEN 1 AND 120),
  email text NOT NULL CHECK (
    char_length(email) BETWEEN 3 AND 254 AND email ~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$'
  ),
  phone text CHECK (phone IS NULL OR char_length(phone) <= 40),
  subject text NOT NULL CHECK (char_length(btrim(subject)) BETWEEN 1 AND 200),
  message text NOT NULL CHECK (char_length(btrim(message)) BETWEEN 1 AND 4000),
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.contact_messages FROM PUBLIC, anon, authenticated;
-- Clients may submit only these columns; IDs and timestamps remain server-set.
GRANT INSERT (name, email, phone, subject, message)
  ON public.contact_messages TO anon, authenticated;
GRANT SELECT, DELETE ON public.contact_messages TO authenticated;
CREATE POLICY "public submits contact messages" ON public.contact_messages
  FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "admins read contact messages" ON public.contact_messages
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "admins delete contact messages" ON public.contact_messages
  FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Invoker security preserves the caller's RLS restrictions. No privileged key.
CREATE FUNCTION public.submit_contact_message(
  p_name text, p_email text, p_phone text, p_subject text, p_message text
) RETURNS void
LANGUAGE sql VOLATILE SECURITY INVOKER
SET search_path = ''
AS $$
  INSERT INTO public.contact_messages (name, email, phone, subject, message)
  VALUES (btrim(p_name), btrim(p_email), nullif(btrim(p_phone), ''),
          btrim(p_subject), btrim(p_message));
$$;
REVOKE ALL ON FUNCTION public.submit_contact_message(text, text, text, text, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.submit_contact_message(text, text, text, text, text)
  TO anon, authenticated;

-- Before enabling: approve retention/access ownership and spam controls.
-- Public inserts need rate limiting/CAPTCHA before broad exposure; UI busy state
-- prevents accidental double clicks but is NOT server-side abuse prevention.
-- Verify successful storage, validation failures, no public reads/deletes,
-- role-gated admin reads, and network-failure preservation of form input.
-- The owner can initially read submissions in the existing Supabase dashboard.
-- No new website dashboard section or automatic email promise is made.
ROLLBACK;
