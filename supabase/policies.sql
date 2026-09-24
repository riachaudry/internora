-- =====================================================================
-- INTERNORA — Row Level Security
-- A student can only ever read/write rows that belong to them.
-- Admin access is granted through the is_admin() helper.
-- The service-role key bypasses RLS and is used only in server code.
-- =====================================================================

create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.profiles where id = auth.uid() and role = 'admin');
$$;

create or replace function public.owns_internship(p_internship uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.internships where id = p_internship and student_id = auth.uid());
$$;

alter table public.profiles            enable row level security;
alter table public.internship_fields   enable row level security;
alter table public.roadmap_weeks       enable row level security;
alter table public.roadmap_tasks       enable row level security;
alter table public.batches             enable row level security;
alter table public.applications        enable row level security;
alter table public.payments            enable row level security;
alter table public.internships         enable row level security;
alter table public.internship_weeks    enable row level security;
alter table public.internship_tasks    enable row level security;
alter table public.submissions         enable row level security;
alter table public.evaluations         enable row level security;
alter table public.offer_letters       enable row level security;
alter table public.certificates        enable row level security;
alter table public.lor_records         enable row level security;
alter table public.rewards             enable row level security;
alter table public.notifications       enable row level security;
alter table public.invitations         enable row level security;
alter table public.support_tickets     enable row level security;
alter table public.support_messages    enable row level security;
alter table public.announcements       enable row level security;
alter table public.audit_logs          enable row level security;
alter table public.email_log           enable row level security;
alter table public.certificate_verifications enable row level security;

-- profiles ------------------------------------------------------------
create policy "profiles: read own"        on public.profiles for select using (id = auth.uid());
create policy "profiles: read public"     on public.profiles for select using (public_profile = true);
create policy "profiles: admin read all"  on public.profiles for select using (public.is_admin());
create policy "profiles: update own"      on public.profiles for update using (id = auth.uid()) with check (id = auth.uid());
create policy "profiles: admin update"    on public.profiles for update using (public.is_admin());

-- Students may not promote themselves to admin.
create or replace function public.guard_role_change()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if new.role is distinct from old.role and not public.is_admin() then
    raise exception 'Only an admin can change a role';
  end if;
  return new;
end $$;
create trigger profiles_guard_role before update on public.profiles
  for each row execute function public.guard_role_change();

-- catalog (public read, admin write) ----------------------------------
create policy "fields: public read"   on public.internship_fields for select using (true);
create policy "fields: admin write"   on public.internship_fields for all using (public.is_admin()) with check (public.is_admin());
create policy "rweeks: public read"   on public.roadmap_weeks for select using (true);
create policy "rweeks: admin write"   on public.roadmap_weeks for all using (public.is_admin()) with check (public.is_admin());
create policy "rtasks: public read"   on public.roadmap_tasks for select using (true);
create policy "rtasks: admin write"   on public.roadmap_tasks for all using (public.is_admin()) with check (public.is_admin());
create policy "batches: read"         on public.batches for select using (true);
create policy "batches: admin write"  on public.batches for all using (public.is_admin()) with check (public.is_admin());

-- applications ---------------------------------------------------------
create policy "apps: read own"    on public.applications for select using (student_id = auth.uid() or public.is_admin());
create policy "apps: insert own"  on public.applications for insert with check (student_id = auth.uid());
create policy "apps: admin write" on public.applications for update using (public.is_admin());

-- payments -------------------------------------------------------------
create policy "pay: read own"    on public.payments for select using (student_id = auth.uid() or public.is_admin());
create policy "pay: insert own"  on public.payments for insert with check (student_id = auth.uid());
create policy "pay: admin write" on public.payments for update using (public.is_admin());
-- NOTE: no student UPDATE policy — a student can never mark a payment verified.

-- internships ----------------------------------------------------------
create policy "int: read own"    on public.internships for select using (student_id = auth.uid() or public.is_admin());
create policy "int: admin write" on public.internships for all using (public.is_admin()) with check (public.is_admin());

create policy "weeks: read own"    on public.internship_weeks for select using (public.owns_internship(internship_id) or public.is_admin());
create policy "weeks: admin write" on public.internship_weeks for all using (public.is_admin()) with check (public.is_admin());

create policy "tasks: read own"    on public.internship_tasks for select using (public.owns_internship(internship_id) or public.is_admin());
create policy "tasks: admin write" on public.internship_tasks for all using (public.is_admin()) with check (public.is_admin());

-- submissions ----------------------------------------------------------
create policy "sub: read own"   on public.submissions for select using (student_id = auth.uid() or public.is_admin());
create policy "sub: insert own" on public.submissions for insert with check (student_id = auth.uid());
create policy "sub: admin write" on public.submissions for update using (public.is_admin());

create policy "eval: read own"   on public.evaluations for select using (public.owns_internship(internship_id) or public.is_admin());
create policy "eval: admin write" on public.evaluations for all using (public.is_admin()) with check (public.is_admin());

-- documents ------------------------------------------------------------
create policy "ol: read own"     on public.offer_letters for select using (public.owns_internship(internship_id) or public.is_admin());
create policy "ol: admin write"  on public.offer_letters for all using (public.is_admin()) with check (public.is_admin());
create policy "cert: public read" on public.certificates for select using (true);  -- required for /verify
create policy "cert: admin write" on public.certificates for all using (public.is_admin()) with check (public.is_admin());
create policy "lor: read own"    on public.lor_records for select using (public.owns_internship(internship_id) or public.is_admin());
create policy "lor: admin write" on public.lor_records for all using (public.is_admin()) with check (public.is_admin());
create policy "rew: read own"    on public.rewards for select using (student_id = auth.uid() or public.is_admin());
create policy "rew: admin write" on public.rewards for all using (public.is_admin()) with check (public.is_admin());
create policy "certver: admin read" on public.certificate_verifications for select using (public.is_admin());

-- comms ----------------------------------------------------------------
create policy "notif: read own"   on public.notifications for select using (user_id = auth.uid());
create policy "notif: update own" on public.notifications for update using (user_id = auth.uid());
create policy "notif: admin all"  on public.notifications for all using (public.is_admin()) with check (public.is_admin());

create policy "inv: admin only"   on public.invitations for all using (public.is_admin()) with check (public.is_admin());
create policy "mail: admin only"  on public.email_log for select using (public.is_admin());

create policy "tick: read own"    on public.support_tickets for select using (student_id = auth.uid() or public.is_admin());
create policy "tick: insert own"  on public.support_tickets for insert with check (student_id = auth.uid());
create policy "tick: admin write" on public.support_tickets for update using (public.is_admin());

create policy "tmsg: read own"    on public.support_messages for select
  using (exists (select 1 from public.support_tickets t where t.id = ticket_id and (t.student_id = auth.uid() or public.is_admin())));
create policy "tmsg: insert own"  on public.support_messages for insert with check (author_id = auth.uid());

create policy "ann: read"         on public.announcements for select using (published = true or public.is_admin());
create policy "ann: admin write"  on public.announcements for all using (public.is_admin()) with check (public.is_admin());
create policy "audit: admin read" on public.audit_logs for select using (public.is_admin());
