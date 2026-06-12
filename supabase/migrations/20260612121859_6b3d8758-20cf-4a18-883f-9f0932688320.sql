DROP POLICY IF EXISTS "public read blog" ON public.blog_posts;
CREATE POLICY "anon read published blog" ON public.blog_posts FOR SELECT TO anon USING (published = true);
CREATE POLICY "authenticated read blog" ON public.blog_posts FOR SELECT TO authenticated USING (published = true OR public.has_role(auth.uid(), 'admin'::public.app_role));