-- =====================================================================
-- INTERNORA — Storage buckets & object policies
-- =====================================================================
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types) values
  ('avatars',        'avatars',        true,  2097152,  array['image/jpeg','image/png','image/webp']),
  ('payment-proofs', 'payment-proofs', false, 5242880,  array['image/jpeg','image/png','application/pdf']),
  ('submissions',    'submissions',    false, 26214400, array['application/pdf','image/jpeg','image/png','application/zip','text/plain','application/vnd.openxmlformats-officedocument.wordprocessingml.document']),
  ('documents',      'documents',      false, 10485760, array['application/pdf'])
on conflict (id) do nothing;

-- Objects are stored under  <bucket>/<user-id>/<filename>  so ownership is
-- provable from the path itself.
create policy "avatars: public read" on storage.objects for select using (bucket_id = 'avatars');
create policy "avatars: owner write" on storage.objects for insert
  with check (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "avatars: owner update" on storage.objects for update
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "proofs: owner read" on storage.objects for select
  using (bucket_id = 'payment-proofs' and ((storage.foldername(name))[1] = auth.uid()::text or public.is_admin()));
create policy "proofs: owner write" on storage.objects for insert
  with check (bucket_id = 'payment-proofs' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "subs: owner read" on storage.objects for select
  using (bucket_id = 'submissions' and ((storage.foldername(name))[1] = auth.uid()::text or public.is_admin()));
create policy "subs: owner write" on storage.objects for insert
  with check (bucket_id = 'submissions' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "docs: owner read" on storage.objects for select
  using (bucket_id = 'documents' and ((storage.foldername(name))[1] = auth.uid()::text or public.is_admin()));
create policy "docs: admin write" on storage.objects for insert
  with check (bucket_id = 'documents' and public.is_admin());
