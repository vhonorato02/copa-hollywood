-- Estrutura original, criada antes do versionamento. Nao execute sobre a base existente sem verificar.
create table if not exists public.copa_profiles (
 id text primary key check (id ~ '^[a-z0-9-]{2,40}$'),
 name text not null check (char_length(name) between 2 and 30),
 avatar smallint not null default 0 check (avatar between 0 and 7),
 drive_url text not null check (drive_url like 'https://drive.google.com/drive/folders/%'),
 state jsonb not null default '{}'::jsonb check (jsonb_typeof(state) = 'object' and pg_column_size(state) <= 100000),
 updated_at timestamptz not null default now()
);
create or replace function public.copa_touch_updated_at() returns trigger language plpgsql set search_path = public as $$
begin new.updated_at=now();return new;end; $$;
revoke all on function public.copa_touch_updated_at() from public,anon,authenticated;
drop trigger if exists copa_profiles_touch on public.copa_profiles;
create trigger copa_profiles_touch before update on public.copa_profiles for each row execute function public.copa_touch_updated_at();
alter table public.copa_profiles enable row level security;
revoke all on public.copa_profiles from public,anon,authenticated;
grant select (id,name,avatar,drive_url,state) on public.copa_profiles to anon;
grant update (state) on public.copa_profiles to anon;
drop policy if exists copa_profiles_roster_read on public.copa_profiles;
create policy copa_profiles_roster_read on public.copa_profiles for select to anon using (true);
drop policy if exists copa_profiles_state_update on public.copa_profiles;
create policy copa_profiles_state_update on public.copa_profiles for update to anon using (true) with check(true);
-- Populacao inicial foi feita pela integracao; veja o banco para os 8 registros.
