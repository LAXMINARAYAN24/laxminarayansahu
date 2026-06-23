
-- Roles enum + table
create type public.app_role as enum ('admin', 'user');

create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  role public.app_role not null,
  created_at timestamptz not null default now(),
  unique (user_id, role)
);
grant select on public.user_roles to authenticated;
grant all on public.user_roles to service_role;
alter table public.user_roles enable row level security;

create policy "Users can view their own roles"
  on public.user_roles for select to authenticated
  using (auth.uid() = user_id);

create or replace function public.has_role(_user_id uuid, _role public.app_role)
returns boolean
language sql stable security definer set search_path = public
as $$
  select exists (select 1 from public.user_roles where user_id = _user_id and role = _role)
$$;

-- Profiles
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select on public.profiles to anon, authenticated;
grant insert, update on public.profiles to authenticated;
grant all on public.profiles to service_role;
alter table public.profiles enable row level security;

create policy "Profiles are viewable by everyone"
  on public.profiles for select to anon, authenticated using (true);
create policy "Users can update own profile"
  on public.profiles for update to authenticated using (auth.uid() = id);
create policy "Users can insert own profile"
  on public.profiles for insert to authenticated with check (auth.uid() = id);

-- Site settings (single-row key/value store, public read, admin write)
create table public.site_settings (
  key text primary key,
  value jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users(id) on delete set null
);
grant select on public.site_settings to anon, authenticated;
grant insert, update, delete on public.site_settings to authenticated;
grant all on public.site_settings to service_role;
alter table public.site_settings enable row level security;

create policy "Settings are viewable by everyone"
  on public.site_settings for select to anon, authenticated using (true);
create policy "Admins can insert settings"
  on public.site_settings for insert to authenticated
  with check (public.has_role(auth.uid(), 'admin'));
create policy "Admins can update settings"
  on public.site_settings for update to authenticated
  using (public.has_role(auth.uid(), 'admin'));
create policy "Admins can delete settings"
  on public.site_settings for delete to authenticated
  using (public.has_role(auth.uid(), 'admin'));

insert into public.site_settings(key, value) values ('profile_photo', '{"url": null}'::jsonb);

-- updated_at trigger
create or replace function public.tg_set_updated_at()
returns trigger language plpgsql set search_path = public as $$
begin new.updated_at = now(); return new; end; $$;

create trigger profiles_updated_at before update on public.profiles
  for each row execute function public.tg_set_updated_at();
create trigger site_settings_updated_at before update on public.site_settings
  for each row execute function public.tg_set_updated_at();

-- Auto-create profile + bootstrap first user as admin
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
declare admin_count int;
begin
  insert into public.profiles(id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'display_name', new.email));

  select count(*) into admin_count from public.user_roles where role = 'admin';
  if admin_count = 0 then
    insert into public.user_roles(user_id, role) values (new.id, 'admin');
  else
    insert into public.user_roles(user_id, role) values (new.id, 'user');
  end if;
  return new;
end; $$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Storage policies for profile-photos bucket (bucket created via tool)
create policy "Public can read profile photos"
  on storage.objects for select to anon, authenticated
  using (bucket_id = 'profile-photos');
create policy "Admins can upload profile photos"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'profile-photos' and public.has_role(auth.uid(), 'admin'));
create policy "Admins can update profile photos"
  on storage.objects for update to authenticated
  using (bucket_id = 'profile-photos' and public.has_role(auth.uid(), 'admin'));
create policy "Admins can delete profile photos"
  on storage.objects for delete to authenticated
  using (bucket_id = 'profile-photos' and public.has_role(auth.uid(), 'admin'));
