
-- 1. Public view for testimonies (excludes email)
CREATE OR REPLACE VIEW public.testimonies_public
WITH (security_invoker = on) AS
SELECT id, name, title, message, is_approved, created_at
FROM public.testimonies
WHERE is_approved = true;

GRANT SELECT ON public.testimonies_public TO anon, authenticated;

-- 2. Restrict direct table SELECT on testimonies to admins only
DROP POLICY IF EXISTS "public read approved testimonies" ON public.testimonies;
CREATE POLICY "admins read testimonies" ON public.testimonies
  FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

-- 3. Add validation to public INSERT policies
DROP POLICY IF EXISTS "anyone submits testimony" ON public.testimonies;
CREATE POLICY "anyone submits testimony" ON public.testimonies
  FOR INSERT WITH CHECK (
    is_approved = false
    AND char_length(btrim(name)) BETWEEN 1 AND 120
    AND char_length(btrim(message)) BETWEEN 5 AND 4000
    AND (title IS NULL OR char_length(title) <= 200)
    AND (email IS NULL OR char_length(email) <= 254)
  );

DROP POLICY IF EXISTS "anyone submits prayer" ON public.prayer_requests;
CREATE POLICY "anyone submits prayer" ON public.prayer_requests
  FOR INSERT WITH CHECK (
    char_length(btrim(name)) BETWEEN 1 AND 120
    AND char_length(btrim(message)) BETWEEN 5 AND 4000
    AND char_length(btrim(prayer_type)) BETWEEN 1 AND 60
    AND (email IS NULL OR char_length(email) <= 254)
  );

-- 4. Remove blog_posts from realtime publication (unpublished drafts could leak)
ALTER PUBLICATION supabase_realtime DROP TABLE public.blog_posts;
