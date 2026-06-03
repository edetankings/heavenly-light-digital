
-- Events table
CREATE TABLE public.events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  starts_at timestamptz NOT NULL,
  location text,
  cover_image text,
  is_archived boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.events TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.events TO authenticated;
GRANT ALL ON public.events TO service_role;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read events" ON public.events FOR SELECT USING (true);
CREATE POLICY "admins manage events" ON public.events FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role)) WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
CREATE TRIGGER events_touch BEFORE UPDATE ON public.events FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- Testimonies table
CREATE TABLE public.testimonies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text,
  title text,
  message text NOT NULL,
  is_approved boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.testimonies TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.testimonies TO authenticated;
GRANT ALL ON public.testimonies TO service_role;
ALTER TABLE public.testimonies ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read approved testimonies" ON public.testimonies FOR SELECT
  USING (is_approved = true OR has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "anyone submits testimony" ON public.testimonies FOR INSERT WITH CHECK (true);
CREATE POLICY "admins manage testimonies" ON public.testimonies FOR UPDATE TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role)) WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "admins delete testimonies" ON public.testimonies FOR DELETE TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Add email field to prayer_requests
ALTER TABLE public.prayer_requests ADD COLUMN IF NOT EXISTS email text;
