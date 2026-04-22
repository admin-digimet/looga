-- ================================================================
-- LOOGA — Migration safe (ne supprime rien)
-- Ajoute ce qui manque sans toucher aux tables existantes
-- Les Edge Functions ne seront pas affectées
-- ================================================================

-- ----------------------------------------------------------------
-- 1. FIX TRIGGER (cause du "Database error saving new user")
-- ----------------------------------------------------------------
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

-- ----------------------------------------------------------------
-- 2. NOUVELLES TABLES (admin Looga)
-- ----------------------------------------------------------------

-- Journal des actions admin
create table if not exists public.admin_actions (
  id          uuid        primary key default uuid_generate_v4(),
  admin_id    uuid        not null references public.profiles(id),
  action      text        not null,
  target_type text        not null,
  target_id   uuid        not null,
  note        text,
  created_at  timestamptz not null default now()
);

-- Signalements utilisateurs
create table if not exists public.reports (
  id           uuid        primary key default uuid_generate_v4(),
  reporter_id  uuid        not null references public.profiles(id),
  target_type  text        not null check (target_type in ('event','user','organizer')),
  target_id    uuid        not null,
  reason       text        not null,
  status       text        not null default 'pending'
                 check (status in ('pending','reviewed','dismissed')),
  reviewed_by  uuid        references public.profiles(id),
  reviewed_at  timestamptz,
  created_at   timestamptz not null default now()
);

-- ----------------------------------------------------------------
-- 3. RLS sur les nouvelles tables
-- ----------------------------------------------------------------
alter table public.admin_actions enable row level security;
alter table public.reports        enable row level security;

drop policy if exists "admin_actions_admin_only" on public.admin_actions;
create policy "admin_actions_admin_only" on public.admin_actions
  for all using (
    exists (select 1 from public.profiles where id = auth.uid() and role in ('admin','super_admin'))
  );

drop policy if exists "reports_own" on public.reports;
create policy "reports_own" on public.reports
  for all using (
    reporter_id = auth.uid()
    or exists (select 1 from public.profiles where id = auth.uid() and role in ('admin','super_admin'))
  );

-- ----------------------------------------------------------------
-- 4. RLS manquantes sur les tables existantes
-- (drop if exists pour éviter les conflits)
-- ----------------------------------------------------------------
drop policy if exists "profiles_select_own"      on public.profiles;
drop policy if exists "profiles_update_own"       on public.profiles;
drop policy if exists "events_select_published"   on public.events;
drop policy if exists "events_all_organizer"      on public.events;
drop policy if exists "ticket_types_select"       on public.ticket_types;
drop policy if exists "organizers_select_own"     on public.organizers;
drop policy if exists "staff_accounts_select"     on public.staff_accounts;
drop policy if exists "ticket_scans_select"       on public.ticket_scans;
drop policy if exists "tickets_select"            on public.tickets;
drop policy if exists "favorites_own"             on public.favorites;
drop policy if exists "notifications_own"         on public.notifications;

create policy "profiles_select_own" on public.profiles
  for select using (auth.uid() = id);
create policy "profiles_update_own" on public.profiles
  for update using (auth.uid() = id);

create policy "events_select_published" on public.events
  for select using (
    status = 'published'
    or organizer_id in (select id from public.organizers where user_id = auth.uid())
  );
create policy "events_all_organizer" on public.events
  for all using (
    organizer_id in (select id from public.organizers where user_id = auth.uid())
  );

create policy "ticket_types_select" on public.ticket_types
  for select using (true);

create policy "organizers_select_own" on public.organizers
  for select using (user_id = auth.uid());

create policy "staff_accounts_select" on public.staff_accounts
  for select using (
    organizer_id in (select id from public.organizers where user_id = auth.uid())
    or user_id = auth.uid()
  );

create policy "ticket_scans_select" on public.ticket_scans
  for select using (
    staff_id = auth.uid()
    or event_id in (
      select e.id from public.events e
      join public.organizers o on o.id = e.organizer_id
      where o.user_id = auth.uid()
    )
  );

create policy "tickets_select" on public.tickets
  for select using (
    user_id = auth.uid()
    or event_id in (
      select e.id from public.events e
      join public.organizers o on o.id = e.organizer_id
      where o.user_id = auth.uid()
    )
  );

create policy "favorites_own" on public.favorites
  for all using (user_id = auth.uid());

create policy "notifications_own" on public.notifications
  for all using (user_id = auth.uid());

-- ----------------------------------------------------------------
-- 5. INDEX pour les performances
-- ----------------------------------------------------------------
create index if not exists idx_events_status           on public.events(status);
create index if not exists idx_events_organizer         on public.events(organizer_id);
create index if not exists idx_events_date              on public.events(event_date);
create index if not exists idx_tickets_user             on public.tickets(user_id);
create index if not exists idx_tickets_event            on public.tickets(event_id);
create index if not exists idx_tickets_status           on public.tickets(status);
create index if not exists idx_ticket_scans_event       on public.ticket_scans(event_id);
create index if not exists idx_ticket_scans_scanned_at  on public.ticket_scans(scanned_at);
create index if not exists idx_notifications_user       on public.notifications(user_id, is_read);
create index if not exists idx_payments_status          on public.payments(status);
