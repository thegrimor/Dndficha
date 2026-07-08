alter table public.profiles enable row level security;
alter table public.characters enable row level security;

-- profiles: cada usuario ve y edita solo su propio perfil
create policy "profiles: select own"
  on public.profiles for select
  using (auth.uid() = id);

create policy "profiles: update own"
  on public.profiles for update
  using (auth.uid() = id);

-- characters: el dueño tiene acceso total a sus fichas
create policy "characters: owner full access"
  on public.characters for all
  using (auth.uid() = owner_id)
  with check (auth.uid() = owner_id);

-- characters: lectura pública solo si is_public=true y se conoce el share_slug
create policy "characters: public read via slug"
  on public.characters for select
  using (is_public = true and share_slug is not null);
