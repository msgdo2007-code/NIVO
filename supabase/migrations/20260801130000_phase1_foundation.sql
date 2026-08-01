begin;

create extension if not exists citext with schema extensions;

create type public.account_role as enum ('user', 'admin');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username extensions.citext unique,
  display_name text not null default 'Explorador',
  avatar_url text,
  bio text,
  onboarding_completed boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint profiles_username_format check (
    username is null or username::text ~ '^[a-z0-9][a-z0-9_-]{2,29}$'
  ),
  constraint profiles_username_reserved check (
    username is null or lower(username::text) not in (
      'admin', 'api', 'login', 'cadastro', 'dashboard', 'configuracoes',
      'marketplace', 'explorar', 'suporte', 'termos', 'privacidade',
      'contato', 'blog', 'templates', 'recursos', 'precos', 'auth'
    )
  ),
  constraint profiles_display_name_length check (char_length(display_name) between 1 and 80),
  constraint profiles_bio_length check (bio is null or char_length(bio) <= 300)
);

create index profiles_created_at_idx on public.profiles(created_at desc);

create table public.profile_settings (
  profile_id uuid primary key references public.profiles(id) on delete cascade,
  theme_key text not null default 'aurora',
  accent_color text not null default '#72f7bd',
  background_color text not null default '#060a0f',
  font_family text not null default 'system',
  button_radius smallint not null default 14,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint profile_settings_accent_hex check (accent_color ~ '^#[0-9A-Fa-f]{6}$'),
  constraint profile_settings_background_hex check (background_color ~ '^#[0-9A-Fa-f]{6}$'),
  constraint profile_settings_radius_range check (button_radius between 0 and 32)
);

create table public.account_roles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  role public.account_role not null default 'user',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index account_roles_role_idx on public.account_roles(role);

create table public.audit_logs (
  id bigint generated always as identity primary key,
  actor_id uuid references auth.users(id) on delete set null,
  action text not null,
  target_type text not null,
  target_id text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  constraint audit_logs_action_length check (char_length(action) between 1 and 120),
  constraint audit_logs_target_type_length check (char_length(target_type) between 1 and 80)
);

create index audit_logs_actor_created_idx on public.audit_logs(actor_id, created_at desc);
create index audit_logs_target_idx on public.audit_logs(target_type, target_id);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_set_updated_at before update on public.profiles
for each row execute function public.set_updated_at();
create trigger profile_settings_set_updated_at before update on public.profile_settings
for each row execute function public.set_updated_at();
create trigger account_roles_set_updated_at before update on public.account_roles
for each row execute function public.set_updated_at();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, display_name, avatar_url)
  values (
    new.id,
    coalesce(nullif(trim(new.raw_user_meta_data ->> 'display_name'), ''), nullif(trim(new.raw_user_meta_data ->> 'full_name'), ''), 'Explorador'),
    nullif(new.raw_user_meta_data ->> 'avatar_url', '')
  );
  insert into public.profile_settings (profile_id) values (new.id);
  insert into public.account_roles (user_id) values (new.id);
  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

create or replace function public.is_admin(candidate_id uuid default auth.uid())
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.account_roles
    where user_id = candidate_id and role = 'admin'
  );
$$;

revoke all on function public.is_admin(uuid) from public;
grant execute on function public.is_admin(uuid) to authenticated;

alter table public.profiles enable row level security;
alter table public.profile_settings enable row level security;
alter table public.account_roles enable row level security;
alter table public.audit_logs enable row level security;

create policy "Public profiles are readable"
on public.profiles for select
using (true);

create policy "Users update their own profile"
on public.profiles for update to authenticated
using ((select auth.uid()) = id)
with check ((select auth.uid()) = id);

create policy "Users read their own profile settings"
on public.profile_settings for select to authenticated
using ((select auth.uid()) = profile_id);

create policy "Users update their own profile settings"
on public.profile_settings for update to authenticated
using ((select auth.uid()) = profile_id)
with check ((select auth.uid()) = profile_id);

create policy "Users read their own role"
on public.account_roles for select to authenticated
using ((select auth.uid()) = user_id or public.is_admin());

create policy "Admins read audit logs"
on public.audit_logs for select to authenticated
using (public.is_admin());

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('avatars', 'avatars', true, 5242880, array['image/jpeg', 'image/png', 'image/webp', 'image/gif'])
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

create policy "Avatar images are publicly readable"
on storage.objects for select
using (bucket_id = 'avatars');

create policy "Users upload avatars into their own folder"
on storage.objects for insert to authenticated
with check (bucket_id = 'avatars' and (storage.foldername(name))[1] = (select auth.uid())::text);

create policy "Users update avatars in their own folder"
on storage.objects for update to authenticated
using (bucket_id = 'avatars' and (storage.foldername(name))[1] = (select auth.uid())::text)
with check (bucket_id = 'avatars' and (storage.foldername(name))[1] = (select auth.uid())::text);

create policy "Users delete avatars in their own folder"
on storage.objects for delete to authenticated
using (bucket_id = 'avatars' and (storage.foldername(name))[1] = (select auth.uid())::text);

commit;
