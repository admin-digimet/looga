-- ============================================================
-- LOOGA — Schema complet
-- À exécuter dans Supabase → SQL Editor
-- ============================================================

-- Extensions
create extension if not exists "uuid-ossp";

-- ============================================================
-- PROFILES (lié à auth.users)
-- ============================================================
create table if not exists public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  email       text not null default '',
  name        text not null default '',
  phone       text,
  avatar_url  text,
  role        text not null default 'user'
                check (role in ('user','organizer','staff','admin','super_admin')),
  is_active   boolean not null default true,
  created_at  timestamptz not null default now()
);

-- Crée automatiquement un profil à chaque inscription
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles (id, email, name, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data->>'role', 'user')
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================================
-- ORGANIZERS
-- ============================================================
create table if not exists public.organizers (
  id            uuid primary key default uuid_generate_v4(),
  user_id       uuid not null references public.profiles(id) on delete cascade,
  name          text not null,
  description   text,
  logo_url      text,
  website       text,
  is_approved   boolean not null default true,
  is_suspended  boolean not null default false,
  created_at    timestamptz not null default now()
);

-- ============================================================
-- EVENTS
-- ============================================================
create table if not exists public.events (
  id                uuid primary key default uuid_generate_v4(),
  organizer_id      uuid not null references public.organizers(id) on delete cascade,
  title             text not null,
  description       text,
  category          text not null default 'soirees'
                      check (category in ('concerts','soirees','culture','sports','workshops','food')),
  event_date        date not null,
  event_time        time not null default '20:00',
  location_name     text not null,
  location_address  text,
  image_url         text,
  status            text not null default 'draft'
                      check (status in ('draft','published','cancelled','past')),
  is_sold_out       boolean not null default false,
  min_price         numeric(10,0) not null default 0,
  views_count       integer not null default 0,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

-- ============================================================
-- TICKET TYPES
-- ============================================================
create table if not exists public.ticket_types (
  id              uuid primary key default uuid_generate_v4(),
  event_id        uuid not null references public.events(id) on delete cascade,
  name            text not null,
  description     text,
  price           numeric(10,0) not null default 0,
  advantages      text,
  stock_total     integer not null default 100,
  stock_remaining integer not null default 100,
  is_active       boolean not null default true,
  created_at      timestamptz not null default now()
);

-- ============================================================
-- TICKETS
-- ============================================================
create table if not exists public.tickets (
  id              uuid primary key default uuid_generate_v4(),
  user_id         uuid not null references public.profiles(id),
  event_id        uuid not null references public.events(id),
  ticket_type_id  uuid not null references public.ticket_types(id),
  ticket_number   text not null unique default 'TK-' || upper(substr(md5(random()::text), 1, 8)),
  quantity        integer not null default 1,
  total_price     numeric(10,0) not null default 0,
  status          text not null default 'pending'
                    check (status in ('pending','valid','used','expired','cancelled')),
  qr_code         text,
  created_at      timestamptz not null default now()
);

-- ============================================================
-- PAYMENTS
-- ============================================================
create table if not exists public.payments (
  id              uuid primary key default uuid_generate_v4(),
  ticket_id       uuid not null references public.tickets(id),
  user_id         uuid not null references public.profiles(id),
  amount          numeric(10,0) not null,
  currency        text not null default 'XOF',
  provider        text not null default 'cinetpay',
  transaction_id  text,
  status          text not null default 'pending'
                    check (status in ('pending','success','failed','refunded')),
  created_at      timestamptz not null default now()
);

-- ============================================================
-- STAFF ACCOUNTS
-- ============================================================
create table if not exists public.staff_accounts (
  id            uuid primary key default uuid_generate_v4(),
  organizer_id  uuid not null references public.organizers(id) on delete cascade,
  user_id       uuid not null references public.profiles(id) on delete cascade,
  name          text not null,
  is_active     boolean not null default true,
  created_at    timestamptz not null default now(),
  unique (organizer_id, user_id)
);

-- ============================================================
-- TICKET SCANS
-- ============================================================
create table if not exists public.ticket_scans (
  id            uuid primary key default uuid_generate_v4(),
  ticket_id     uuid references public.tickets(id),
  event_id      uuid not null references public.events(id),
  staff_id      uuid references public.profiles(id),
  scanner_name  text,
  status        text not null default 'valid'
                  check (status in ('valid','already_used','invalid')),
  scanned_at    timestamptz not null default now()
);

-- ============================================================
-- RLS (Row Level Security)
-- ============================================================

-- Activer RLS sur toutes les tables
alter table public.profiles      enable row level security;
alter table public.organizers    enable row level security;
alter table public.events        enable row level security;
alter table public.ticket_types  enable row level security;
alter table public.tickets       enable row level security;
alter table public.payments      enable row level security;
alter table public.staff_accounts enable row level security;
alter table public.ticket_scans  enable row level security;

-- Drop policies si elles existent déjà
drop policy if exists "profiles_select_own"      on public.profiles;
drop policy if exists "profiles_update_own"      on public.profiles;
drop policy if exists "events_select_published"  on public.events;
drop policy if exists "ticket_types_select"      on public.ticket_types;
drop policy if exists "organizers_select_own"    on public.organizers;
drop policy if exists "staff_accounts_select"    on public.staff_accounts;
drop policy if exists "ticket_scans_select"      on public.ticket_scans;
drop policy if exists "tickets_select"           on public.tickets;

-- Profiles : chacun voit son propre profil
create policy "profiles_select_own" on public.profiles
  for select using (auth.uid() = id);
create policy "profiles_update_own" on public.profiles
  for update using (auth.uid() = id);

-- Events : publics en lecture
create policy "events_select_published" on public.events
  for select using (status = 'published' or organizer_id in (
    select id from public.organizers where user_id = auth.uid()
  ));

-- Ticket types : publics en lecture
create policy "ticket_types_select" on public.ticket_types
  for select using (true);

-- Organizers : lecture propre
create policy "organizers_select_own" on public.organizers
  for select using (user_id = auth.uid());

-- Staff accounts : lecture par l'organisateur
create policy "staff_accounts_select" on public.staff_accounts
  for select using (organizer_id in (
    select id from public.organizers where user_id = auth.uid()
  ));

-- Ticket scans : lecture par l'organisateur
create policy "ticket_scans_select" on public.ticket_scans
  for select using (event_id in (
    select e.id from public.events e
    join public.organizers o on o.id = e.organizer_id
    where o.user_id = auth.uid()
  ));

-- Tickets : lecture par le propriétaire ou l'organisateur
create policy "tickets_select" on public.tickets
  for select using (
    user_id = auth.uid()
    or event_id in (
      select e.id from public.events e
      join public.organizers o on o.id = e.organizer_id
      where o.user_id = auth.uid()
    )
  );
