drop policy "Admins manage own sessions update" on public.admin_sessions;
create policy "Admins manage own sessions update"
on public.admin_sessions for update to authenticated
using (auth.uid() = user_id and public.has_role(auth.uid(), 'admin'))
with check (auth.uid() = user_id and public.has_role(auth.uid(), 'admin'));