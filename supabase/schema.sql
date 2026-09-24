-- =====================================================================
-- INTERNORA — PostgreSQL / Supabase schema
-- Run this first, then policies.sql, then storage.sql
-- =====================================================================

create extension if not exists "pgcrypto";
create extension if not exists "citext";

-- ---------------------------------------------------------------- enums
create type user_role          as enum ('student','admin');
create type application_status as enum ('draft','submitted','payment_submitted','under_verification','approved','rejected','cancelled');
create type payment_status     as enum ('submitted','under_verification','verified','rejected','correction_requested','refunded');
create type payment_method     as enum ('jazzcash','easypaisa');
create type internship_status  as enum ('pending','active','completed','terminated');
create type week_status        as enum ('locked','active','completed');
create type task_status        as enum ('locked','available','in_progress','submitted','under_review','revision_required','approved','rejected','overdue');
create type submission_status  as enum ('under_review','approved','rejected','revision_required');
create type doc_status         as enum ('issued','revoked');
create type lor_status         as enum ('draft','approved','issued','revoked');
create type reward_status      as enum ('pending','eligible','approved','paid','not_eligible');
create type ticket_status      as enum ('open','in_progress','resolved','closed');

-- ------------------------------------------------------------- profiles
-- One row per auth.users row. Role lives here and is enforced by RLS.
create table public.profiles (
  id                uuid primary key references auth.users(id) on delete cascade,
  role              user_role not null default 'student',
  student_id        text unique,                       -- INT-STU-2026-000123
  username          citext unique,
  full_name         text not null,
  email             citext not null unique,
  phone             text,
  whatsapp          text,
  date_of_birth     date,
  gender            text,
  city              text,
  country           text default 'Pakistan',
  education_level   text,
  university        text,
  field_of_study    text,
  avatar_url        text,
  bio               text,
  skills            text[] default '{}',
  linkedin_url      text,
  portfolio_url     text,
  public_profile    boolean not null default false,
  is_demo           boolean not null default false,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);
create index on public.profiles (role);
create index on public.profiles (username) where public_profile;

-- --------------------------------------------------- internship catalog
create table public.internship_fields (
  id                   uuid primary key default gen_random_uuid(),
  slug                 text unique not null,
  name                 text not null,
  short_description    text not null,
  description          text not null,
  skills               text[] not null default '{}',
  evaluation_criteria  text not null,
  certificate_criteria text not null,
  reward_criteria      text not null,
  icon                 text,
  sort_order           int not null default 0,
  is_active            boolean not null default true,
  created_at           timestamptz not null default now()
);

-- Roadmap template: one row per (field, duration, week)
create table public.roadmap_weeks (
  id           uuid primary key default gen_random_uuid(),
  field_id     uuid not null references public.internship_fields(id) on delete cascade,
  duration     int  not null check (duration in (4,6,8)),
  week_number  int  not null check (week_number between 1 and 8),
  title        text not null,
  summary      text not null,
  objectives   text[] not null default '{}',
  is_final     boolean not null default false,
  unique (field_id, duration, week_number)
);

create table public.roadmap_tasks (
  id                 uuid primary key default gen_random_uuid(),
  week_id            uuid not null references public.roadmap_weeks(id) on delete cascade,
  task_number        int not null,
  title              text not null,
  description        text not null,
  instructions       text not null,
  objective          text not null,
  deliverable        text not null,
  points             int not null default 10,
  is_required        boolean not null default true,
  submission_type    text not null default 'file_or_url',  -- file | url | text | file_or_url
  allowed_file_types text[] not null default '{pdf,docx,jpg,png,zip,txt}',
  deadline_offset_days int not null default 7,             -- days after week start
  unique (week_id, task_number)
);

-- ---------------------------------------------------------- batches
create table public.batches (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  field_id    uuid references public.internship_fields(id) on delete set null,
  duration    int check (duration in (4,6,8)),
  start_date  date,
  notes       text,
  created_at  timestamptz not null default now()
);

-- ------------------------------------------------------- applications
create table public.applications (
  id          uuid primary key default gen_random_uuid(),
  student_id  uuid not null references public.profiles(id) on delete cascade,
  field_id    uuid not null references public.internship_fields(id),
  duration    int not null check (duration in (4,6,8)),
  fee_pkr     int not null,
  status      application_status not null default 'submitted',
  batch_id    uuid references public.batches(id) on delete set null,
  applied_at  timestamptz not null default now(),
  reviewed_at timestamptz,
  reviewed_by uuid references public.profiles(id),
  admin_note  text,
  is_demo     boolean not null default false
);
create index on public.applications (student_id);
create index on public.applications (status);

-- ------------------------------------------------------------ payments
create table public.payments (
  id              uuid primary key default gen_random_uuid(),
  application_id  uuid not null references public.applications(id) on delete cascade,
  student_id      uuid not null references public.profiles(id) on delete cascade,
  method          payment_method not null,
  transaction_id  text not null,
  payment_date    date not null,
  amount_pkr      int not null,
  screenshot_url  text not null,
  status          payment_status not null default 'submitted',
  admin_note      text,
  verified_by     uuid references public.profiles(id),
  verified_at     timestamptz,
  created_at      timestamptz not null default now()
);
create index on public.payments (status);
create unique index payments_txn_unique on public.payments (lower(transaction_id), method);

-- --------------------------------------------------------- internships
create table public.internships (
  id              uuid primary key default gen_random_uuid(),
  application_id  uuid not null unique references public.applications(id) on delete cascade,
  student_id      uuid not null references public.profiles(id) on delete cascade,
  field_id        uuid not null references public.internship_fields(id),
  duration        int not null check (duration in (4,6,8)),
  status          internship_status not null default 'pending',
  start_date      date,
  end_date        date,
  current_week    int not null default 0,
  weekly_score    numeric(5,2) default 0,      -- 0-100, weighted 70%
  final_project_score numeric(5,2) default 0,  -- 0-100, weighted 30%
  overall_score   numeric(5,2) default 0,
  completed_at    timestamptz,
  is_demo         boolean not null default false,
  created_at      timestamptz not null default now()
);
create index on public.internships (student_id);
create index on public.internships (status);

create table public.internship_weeks (
  id            uuid primary key default gen_random_uuid(),
  internship_id uuid not null references public.internships(id) on delete cascade,
  week_number   int not null,
  title         text not null,
  summary       text not null,
  objectives    text[] not null default '{}',
  is_final      boolean not null default false,
  start_date    date not null,
  end_date      date not null,
  status        week_status not null default 'locked',
  unlocked_at   timestamptz,
  completed_at  timestamptz,
  unique (internship_id, week_number)
);

create table public.internship_tasks (
  id               uuid primary key default gen_random_uuid(),
  internship_id    uuid not null references public.internships(id) on delete cascade,
  week_id          uuid not null references public.internship_weeks(id) on delete cascade,
  roadmap_task_id  uuid references public.roadmap_tasks(id),
  task_code        text not null,                 -- INT-TSK-W3-02
  task_number      int not null,
  title            text not null,
  description      text not null,
  instructions     text not null,
  objective        text not null,
  deliverable      text not null,
  points           int not null default 10,
  is_required      boolean not null default true,
  submission_type  text not null default 'file_or_url',
  allowed_file_types text[] not null default '{pdf,docx,jpg,png,zip,txt}',
  unlock_date      date not null,
  deadline         date not null,
  status           task_status not null default 'locked',
  score            int,
  created_at       timestamptz not null default now()
);
create index on public.internship_tasks (internship_id, week_id);
create index on public.internship_tasks (status);

create table public.submissions (
  id            uuid primary key default gen_random_uuid(),
  task_id       uuid not null references public.internship_tasks(id) on delete cascade,
  internship_id uuid not null references public.internships(id) on delete cascade,
  student_id    uuid not null references public.profiles(id) on delete cascade,
  attempt       int not null default 1,
  file_url      text,
  file_name     text,
  file_size     int,
  url           text,
  text_response text,
  comments      text,
  status        submission_status not null default 'under_review',
  submitted_at  timestamptz not null default now(),
  reviewed_by   uuid references public.profiles(id),
  reviewed_at   timestamptz,
  score         int,
  feedback      text
);
create index on public.submissions (status);
create index on public.submissions (internship_id);

create table public.evaluations (
  id            uuid primary key default gen_random_uuid(),
  internship_id uuid not null references public.internships(id) on delete cascade,
  weekly_score  numeric(5,2) not null,
  final_project_score numeric(5,2) not null,
  overall_score numeric(5,2) not null,
  remarks       text,
  evaluated_by  uuid references public.profiles(id),
  evaluated_at  timestamptz not null default now()
);

-- ------------------------------------------------------------ documents
create table public.offer_letters (
  id              uuid primary key default gen_random_uuid(),
  internship_id   uuid not null unique references public.internships(id) on delete cascade,
  public_id       text not null unique,            -- INT-OL-2026-000001
  issue_date      date not null default current_date,
  pdf_url         text,
  status          doc_status not null default 'issued',
  revoked_reason  text,
  created_at      timestamptz not null default now()
);

create table public.certificates (
  id              uuid primary key default gen_random_uuid(),
  internship_id   uuid not null unique references public.internships(id) on delete cascade,
  public_id       text not null unique,            -- INT-CERT-2026-000001
  issue_date      date not null default current_date,
  overall_score   numeric(5,2) not null,
  pdf_url         text,
  status          doc_status not null default 'issued',
  revoked_reason  text,
  created_at      timestamptz not null default now()
);

create table public.certificate_verifications (
  id             uuid primary key default gen_random_uuid(),
  certificate_id uuid references public.certificates(id) on delete cascade,
  queried_id     text not null,
  found          boolean not null,
  ip_hash        text,
  created_at     timestamptz not null default now()
);

create table public.lor_records (
  id             uuid primary key default gen_random_uuid(),
  internship_id  uuid not null unique references public.internships(id) on delete cascade,
  public_id      text not null unique,             -- INT-LOR-2026-000001
  position       int check (position between 1 and 3),
  performance    text,
  skills         text[] default '{}',
  achievements   text,
  recommendation text,
  status         lor_status not null default 'draft',
  issue_date     date,
  pdf_url        text,
  approved_by    uuid references public.profiles(id),
  created_at     timestamptz not null default now()
);

create table public.rewards (
  id                uuid primary key default gen_random_uuid(),
  internship_id     uuid not null unique references public.internships(id) on delete cascade,
  student_id        uuid not null references public.profiles(id) on delete cascade,
  duration          int not null,
  position          int check (position between 1 and 3),
  amount_pkr        int not null default 0,
  includes_lor      boolean not null default true,
  status            reward_status not null default 'pending',
  payment_date      date,
  payment_reference text,
  payment_method    text,
  notes             text,
  created_at        timestamptz not null default now()
);

-- -------------------------------------------------- comms & operations
create table public.notifications (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references public.profiles(id) on delete cascade,
  type       text not null,
  title      text not null,
  message    text not null,
  link       text,
  is_read    boolean not null default false,
  created_at timestamptz not null default now()
);
create index on public.notifications (user_id, is_read);

create table public.invitations (
  id          uuid primary key default gen_random_uuid(),
  full_name   text not null,
  email       citext not null,
  token_hash  text not null unique,     -- sha256(token); raw token never stored
  expires_at  timestamptz not null,
  accepted_at timestamptz,
  created_by  uuid references public.profiles(id),
  created_at  timestamptz not null default now()
);
create index on public.invitations (email);

create table public.email_log (
  id         uuid primary key default gen_random_uuid(),
  to_email   citext not null,
  template   text not null,
  subject    text not null,
  status     text not null default 'sent',
  error      text,
  created_at timestamptz not null default now()
);

create table public.support_tickets (
  id          uuid primary key default gen_random_uuid(),
  student_id  uuid not null references public.profiles(id) on delete cascade,
  subject     text not null,
  message     text not null,
  attachment_url text,
  status      ticket_status not null default 'open',
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create table public.support_messages (
  id         uuid primary key default gen_random_uuid(),
  ticket_id  uuid not null references public.support_tickets(id) on delete cascade,
  author_id  uuid not null references public.profiles(id) on delete cascade,
  body       text not null,
  created_at timestamptz not null default now()
);

create table public.announcements (
  id         uuid primary key default gen_random_uuid(),
  title      text not null,
  body       text not null,
  audience   text not null default 'all',
  published  boolean not null default true,
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now()
);

create table public.audit_logs (
  id         uuid primary key default gen_random_uuid(),
  actor_id   uuid references public.profiles(id) on delete set null,
  action     text not null,
  entity     text not null,
  entity_id  text,
  meta       jsonb default '{}'::jsonb,
  ip_hash    text,
  created_at timestamptz not null default now()
);
create index on public.audit_logs (entity, entity_id);

-- ----------------------------------------------------- sequence helpers
create table public.id_counters (
  scope text primary key,
  year  int  not null,
  value bigint not null default 0
);

create or replace function public.next_public_id(p_prefix text, p_scope text)
returns text language plpgsql security definer set search_path = public as $$
declare v_year int := extract(year from now())::int; v_next bigint;
begin
  insert into id_counters(scope, year, value) values (p_scope, v_year, 1)
  on conflict (scope) do update
    set value = case when id_counters.year = v_year then id_counters.value + 1 else 1 end,
        year  = v_year
  returning value into v_next;
  return p_prefix || '-' || v_year || '-' || lpad(v_next::text, 6, '0');
end $$;

-- ----------------------------------------------- new user -> profile row
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email, full_name, student_id, username)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email,'@',1)),
    public.next_public_id('INT-STU','student'),
    lower(regexp_replace(coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email,'@',1)), '[^a-zA-Z0-9]+', '-', 'g'))
      || '-' || substr(new.id::text, 1, 6)
  )
  on conflict (id) do nothing;
  return new;
end $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ----------------------------------------------------- updated_at touch
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end $$;

create trigger profiles_touch before update on public.profiles
  for each row execute function public.touch_updated_at();
create trigger tickets_touch before update on public.support_tickets
  for each row execute function public.touch_updated_at();

-- ---------------------------------------------------------- leaderboard
create or replace view public.leaderboard_view as
select
  i.id                as internship_id,
  i.student_id,
  p.full_name,
  p.avatar_url,
  p.student_id        as student_code,
  f.name              as field_name,
  f.slug              as field_slug,
  i.duration,
  i.overall_score,
  i.status,
  rank() over (partition by i.field_id, i.duration order by i.overall_score desc, i.completed_at asc nulls last) as field_rank,
  rank() over (partition by i.duration order by i.overall_score desc, i.completed_at asc nulls last) as duration_rank
from public.internships i
join public.profiles p on p.id = i.student_id
join public.internship_fields f on f.id = i.field_id
where i.status in ('active','completed');
