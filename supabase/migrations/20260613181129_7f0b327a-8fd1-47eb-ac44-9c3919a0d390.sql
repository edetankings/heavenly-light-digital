
DROP POLICY IF EXISTS "anyone submits testimony" ON public.testimonies;

CREATE POLICY "public can submit testimony"
ON public.testimonies
FOR INSERT
TO anon, authenticated
WITH CHECK (
  is_approved = false
  AND char_length(btrim(name)) BETWEEN 1 AND 120
  AND char_length(btrim(message)) BETWEEN 1 AND 4000
  AND (title IS NULL OR char_length(title) <= 200)
  AND (email IS NULL OR char_length(email) <= 254)
);

GRANT INSERT ON public.testimonies TO anon;
