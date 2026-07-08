-- Perfiles de usuario, uno por cada auth.users
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  username text unique,
  avatar_url text,
  created_at timestamptz not null default now()
);

-- Fichas de personaje. El detalle completo de la ficha vive en la columna
-- `sheet` (jsonb); las columnas top-level son las que se necesitan para
-- listar, filtrar y compartir sin tener que leer el jsonb completo.
create table if not exists public.characters (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  race text,
  class text,
  level int not null default 1,
  background text,
  alignment text,
  image_url text,
  is_public boolean not null default false,
  share_slug text unique,
  sheet jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists characters_owner_id_idx on public.characters (owner_id);
create index if not exists characters_sheet_gin_idx on public.characters using gin (sheet jsonb_path_ops);

-- Mantiene `updated_at` al día en cada update
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists characters_set_updated_at on public.characters;
create trigger characters_set_updated_at
before update on public.characters
for each row execute function public.set_updated_at();

-- Crea automáticamente un `profile` cuando se registra un usuario nuevo
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, username)
  values (new.id, new.raw_user_meta_data ->> 'username');
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();
