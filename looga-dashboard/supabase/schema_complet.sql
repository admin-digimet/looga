-- ================================================================
-- LOOGA — Schéma complet v2
-- Apps : looga-client · looga-dashboard · looga-scan · looga-admin
-- À envoyer au backend dev pour qu'il applique sur Supabase prod
-- ================================================================

-- Extensions
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- ================================================================
-- PROFILES
-- Lié à auth.users — créé automatiquement à l'inscription
-- ================================================================
create table if not exists public.profiles (
  id          uuid        primary key references auth.users(id) on delete cascade,
  name        text        not null default '',
  phone       text,
  avatar_url  text,
  role        text        not null default 'user'
                check (role in ('user','organizer','staff','admin','super_admin')),
  push_token  text,
  is_active   boolean     not null default true,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- Trigger : crée le profil automatiquement à chaque inscription auth
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, name, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data->>'role', 'user')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ================================================================
-- ORGANIZERS
-- Créé par le backend lors de l'inscription organisateur
-- is_approved = false par défaut → admin Looga doit approuver
-- ================================================================
create table if not exists public.organizers (
  id            uuid        primary key default uuid_generate_v4(),
  user_id       uuid        not null unique references public.profiles(id) on delete cascade,
  name          text        not null,
  description   text,
  logo_url      text,
  website       text,
  is_approved   boolean     not null default false,
  is_suspended  boolean     not null default false,
  approved_at   timestamptz,
  approved_by   uuid        references public.profiles(id),
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- ================================================================
-- EVENTS
-- ================================================================
create table if not exists public.events (
  id               uuid        primary key default uuid_generate_v4(),
  organizer_id     uuid        not null references public.organizers(id) on delete cascade,
  title            text        not null,
  description      text,
  category         text        not null check (category in ('concerts','soirees','culture','sports','workshops','food')),
  event_date       date        not null,
  event_time       time        not null,
  location_name    text        not null,
  location_address text,
  latitude         numeric,
  longitude        numeric,
  image_url        text,
  status           text        not null default 'draft'
                     check (status in ('draft','published','cancelled','past')),
  is_sold_out      boolean     not null default false,
  min_price        integer     not null default 0,
  views_count      integer     not null default 0,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

-- ================================================================
-- TICKET TYPES
-- ================================================================
create table if not exists public.ticket_types (
  id              uuid        primary key default uuid_generate_v4(),
  event_id        uuid        not null references public.events(id) on delete cascade,
  name            text        not null,
  description     text,
  price           integer     not null default 0,
  advantages      text,
  stock_total     integer     not null,
  stock_remaining integer     not null,
  is_active       boolean     not null default true,
  created_at      timestamptz not null default now()
);

-- ================================================================
-- TICKETS
-- ================================================================
create table if not exists public.tickets (
  id              uuid        primary key default uuid_generate_v4(),
  user_id         uuid        not null references public.profiles(id),
  event_id        uuid        not null references public.events(id),
  ticket_type_id  uuid        not null references public.ticket_types(id),
  ticket_number   text        not null unique,
  qr_code         text        not null unique,
  quantity        integer     not null default 1,
  total_price     integer     not null,
  status          text        not null default 'pending'
                    check (status in ('pending','valid','used','expired','cancelled')),
  payment_ref     text,
  purchased_at    timestamptz,
  created_at      timestamptz not null default now()
);

-- ================================================================
-- PAYMENTS
-- ================================================================
create table if not exists public.payments (
  id              uuid        primary key default uuid_generate_v4(),
  ticket_id       uuid        not null references public.tickets(id),
  user_id         uuid        not null references public.profiles(id),
  amount          integer     not null,
  payment_method  text        not null
                    check (payment_method in ('mtn_momo','orange_money','wave','card')),
  transaction_ref text,
  status          text        not null default 'pending'
                    check (status in ('pending','success','failed','refunded')),
  phone_number    text,
  confirmed_at    timestamptz,
  raw_webhook     jsonb,
  created_at      timestamptz not null default now()
);

-- ================================================================
-- STAFF ACCOUNTS
-- Comptes scanners créés par l'organisateur depuis le dashboard
-- ================================================================
create table if not exists public.staff_accounts (
  id            uuid        primary key default uuid_generate_v4(),
  organizer_id  uuid        not null references public.organizers(id) on delete cascade,
  user_id       uuid        not null references public.profiles(id) on delete cascade,
  name          text        not null,
  is_active     boolean     not null default true,
  created_at    timestamptz not null default now(),
  unique (organizer_id, user_id)
);

-- ================================================================
-- TICKET SCANS
-- ================================================================
create table if not exists public.ticket_scans (
  id            uuid        primary key default uuid_generate_v4(),
  ticket_id     uuid        references public.tickets(id),
  event_id      uuid        not null references public.events(id),
  staff_id      uuid        references public.profiles(id),
  scanner_name  text,
  status        text        not null
                  check (status in ('valid','already_used','invalid')),
  scanned_at    timestamptz not null default now(),
  synced        boolean     not null default true,
  device_id     text
);

-- ================================================================
-- FAVORITES (looga-client)
-- ================================================================
create table if not exists public.favorites (
  id          uuid        primary key default uuid_generate_v4(),
  user_id     uuid        not null references public.profiles(id) on delete cascade,
  event_id    uuid        not null references public.events(id) on delete cascade,
  created_at  timestamptz not null default now(),
  unique (user_id, event_id)
);

-- ================================================================
-- NOTIFICATIONS (looga-client)
-- ================================================================
create table if not exists public.notifications (
  id          uuid        primary key default uuid_generate_v4(),
  user_id     uuid        not null references public.profiles(id) on delete cascade,
  type        text        not null
                check (type in ('ticket_purchase','event_reminder','event_cancelled','system')),
  title       text        not null,
  body        text        not null,
  data        jsonb,
  is_read     boolean     not null default false,
  created_at  timestamptz not null default now()
);

-- ================================================================
-- ADMIN — Looga backoffice
-- Tables supplémentaires pour looga-admin
-- ================================================================

-- Journal des actions admin (audit log)
create table if not exists public.admin_actions (
  id          uuid        primary key default uuid_generate_v4(),
  admin_id    uuid        not null references public.profiles(id),
  action      text        not null,  -- 'approve_organizer', 'suspend_event', 'ban_user', etc.
  target_type text        not null,  -- 'organizer', 'event', 'user', 'payment'
  target_id   uuid        not null,
  note        text,
  created_at  timestamptz not null default now()
);

-- Signalements (utilisateurs → admin Looga)
create table if not exists public.reports (
  id            uuid        primary key default uuid_generate_v4(),
  reporter_id   uuid        not null references public.profiles(id),
  target_type   text        not null check (target_type in ('event','user','organizer')),
  target_id     uuid        not null,
  reason        text        not null,
  status        text        not null default 'pending'
                  check (status in ('pending','reviewed','dismissed')),
  reviewed_by   uuid        references public.profiles(id),
  reviewed_at   timestamptz,
  created_at    timestamptz not null default now()
);

-- ================================================================
-- RLS (Row Level Security)
-- ================================================================

alter table public.profiles      enable row level security;
alter table public.organizers    enable row level security;
alter table public.events        enable row level security;
alter table public.ticket_types  enable row level security;
alter table public.tickets       enable row level security;
alter table public.payments      enable row level security;
alter table public.staff_accounts enable row level security;
alter table public.ticket_scans  enable row level security;
alter table public.favorites     enable row level security;
alter table public.notifications  enable row level security;
alter table public.admin_actions  enable row level security;
alter table public.reports        enable row level security;

-- Helpers
drop policy if exists "profiles_select_own"           on public.profiles;
drop policy if exists "profiles_update_own"           on public.profiles;
drop policy if exists "events_select_published"       on public.events;
drop policy if exists "events_all_organizer"          on public.events;
drop policy if exists "ticket_types_select"           on public.ticket_types;
drop policy if exists "organizers_select_own"         on public.organizers;
drop policy if exists "staff_accounts_select"         on public.staff_accounts;
drop policy if exists "ticket_scans_select"           on public.ticket_scans;
drop policy if exists "tickets_select"                on public.tickets;
drop policy if exists "favorites_own"                 on public.favorites;
drop policy if exists "notifications_own"             on public.notifications;
drop policy if exists "admin_actions_admin_only"      on public.admin_actions;
drop policy if exists "reports_select_own"            on public.reports;

-- PROFILES
create policy "profiles_select_own" on public.profiles
  for select using (auth.uid() = id);
create policy "profiles_update_own" on public.profiles
  for update using (auth.uid() = id);

-- EVENTS : public published + organisateur voit les siens
create policy "events_select_published" on public.events
  for select using (
    status = 'published'
    or organizer_id in (select id from public.organizers where user_id = auth.uid())
  );
create policy "events_all_organizer" on public.events
  for all using (
    organizer_id in (select id from public.organizers where user_id = auth.uid())
  );

-- TICKET TYPES : lecture publique
create policy "ticket_types_select" on public.ticket_types
  for select using (true);

-- ORGANIZERS
create policy "organizers_select_own" on public.organizers
  for select using (user_id = auth.uid());

-- STAFF ACCOUNTS
create policy "staff_accounts_select" on public.staff_accounts
  for select using (
    organizer_id in (select id from public.organizers where user_id = auth.uid())
    or user_id = auth.uid()
  );

-- TICKET SCANS
create policy "ticket_scans_select" on public.ticket_scans
  for select using (
    staff_id = auth.uid()
    or event_id in (
      select e.id from public.events e
      join public.organizers o on o.id = e.organizer_id
      where o.user_id = auth.uid()
    )
  );

-- TICKETS
create policy "tickets_select" on public.tickets
  for select using (
    user_id = auth.uid()
    or event_id in (
      select e.id from public.events e
      join public.organizers o on o.id = e.organizer_id
      where o.user_id = auth.uid()
    )
  );

-- FAVORITES
create policy "favorites_own" on public.favorites
  for all using (user_id = auth.uid());

-- NOTIFICATIONS
create policy "notifications_own" on public.notifications
  for all using (user_id = auth.uid());

-- ADMIN ACTIONS : admin/super_admin seulement
create policy "admin_actions_admin_only" on public.admin_actions
  for all using (
    exists (select 1 from public.profiles where id = auth.uid() and role in ('admin','super_admin'))
  );

-- REPORTS
create policy "reports_select_own" on public.reports
  for select using (
    reporter_id = auth.uid()
    or exists (select 1 from public.profiles where id = auth.uid() and role in ('admin','super_admin'))
  );

-- ================================================================
-- INDEXES (performances)
-- ================================================================
create index if not exists idx_events_status          on public.events(status);
create index if not exists idx_events_organizer        on public.events(organizer_id);
create index if not exists idx_events_date             on public.events(event_date);
create index if not exists idx_tickets_user            on public.tickets(user_id);
create index if not exists idx_tickets_event           on public.tickets(event_id);
create index if not exists idx_tickets_status          on public.tickets(status);
create index if not exists idx_ticket_scans_event      on public.ticket_scans(event_id);
create index if not exists idx_ticket_scans_scanned_at on public.ticket_scans(scanned_at);
create index if not exists idx_notifications_user      on public.notifications(user_id, is_read);
create index if not exists idx_payments_status         on public.payments(status);
