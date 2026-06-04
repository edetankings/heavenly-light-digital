
CREATE TABLE public.admin_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  device_id text NOT NULL,
  user_agent text,
  last_seen_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, device_id)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.admin_sessions TO authenticated;
GRANT ALL ON public.admin_sessions TO service_role;

ALTER TABLE public.admin_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage own sessions select"
  ON public.admin_sessions FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins manage own sessions insert"
  ON public.admin_sessions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins manage own sessions update"
  ON public.admin_sessions FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id AND public.has_role(auth.uid(), 'admin'))
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins manage own sessions delete"
  ON public.admin_sessions FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id AND public.has_role(auth.uid(), 'admin'));

CREATE INDEX admin_sessions_user_last_seen_idx ON public.admin_sessions (user_id, last_seen_at DESC);
