begin;

create type public.profile_block_type as enum (
  'link', 'heading', 'text', 'image', 'gallery', 'separator', 'socials',
  'youtube', 'spotify', 'video', 'discord', 'product', 'contact',
  'countdown', 'faq'
);

create table public.templates (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug extensions.citext not null unique,
  description text not null,
  thumbnail_url text,
  theme_config jsonb not null default '{}'::jsonb,
  initial_blocks jsonb not null default '[]'::jsonb,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint templates_name_length check (char_length(name) between 2 and 80),
  constraint templates_slug_format check (slug::text ~ '^[a-z0-9][a-z0-9-]{1,39}$'),
  constraint templates_theme_object check (jsonb_typeof(theme_config) = 'object'),
  constraint templates_blocks_array check (jsonb_typeof(initial_blocks) = 'array')
);

alter table public.profiles
  add column professional_title text,
  add column location text,
  add column is_published boolean not null default false,
  add column selected_template_id uuid references public.templates(id) on delete set null;

alter table public.profiles
  add constraint profiles_professional_title_length check (
    professional_title is null or char_length(professional_title) <= 100
  ),
  add constraint profiles_location_length check (
    location is null or char_length(location) <= 100
  );

alter table public.profile_settings
  add column background_type text not null default 'gradient',
  add column background_value text not null default 'aurora',
  add column button_style text not null default 'glass',
  add column link_layout text not null default 'stack',
  add column show_nivo_branding boolean not null default true,
  add constraint profile_settings_background_type check (
    background_type in ('solid', 'gradient', 'image')
  ),
  add constraint profile_settings_button_style check (
    button_style in ('glass', 'solid', 'outline', 'soft')
  ),
  add constraint profile_settings_link_layout check (
    link_layout in ('stack', 'grid')
  );

create table public.profile_blocks (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  type public.profile_block_type not null,
  position integer not null default 0,
  title text not null default '',
  content jsonb not null default '{}'::jsonb,
  is_visible boolean not null default true,
  is_enabled boolean not null default true,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint profile_blocks_position_nonnegative check (position >= 0),
  constraint profile_blocks_title_length check (char_length(title) <= 120),
  constraint profile_blocks_content_object check (jsonb_typeof(content) = 'object')
);

create index templates_active_created_idx on public.templates(is_active, created_at desc);
create index profiles_public_username_idx on public.profiles(username) where is_published;
create index profile_blocks_profile_position_idx on public.profile_blocks(profile_id, position);
create index profile_blocks_publication_idx on public.profile_blocks(profile_id, is_visible, is_enabled, published_at);

create trigger templates_set_updated_at before update on public.templates
for each row execute function public.set_updated_at();
create trigger profile_blocks_set_updated_at before update on public.profile_blocks
for each row execute function public.set_updated_at();

insert into public.templates (name, slug, description, theme_config, initial_blocks)
values
  (
    'Aurora', 'aurora', 'Verde aurora, vidro fosco e uma órbita leve.',
    '{"theme_key":"aurora","accent_color":"#72f7bd","background_color":"#060a0f","background_type":"gradient","background_value":"aurora","button_style":"glass"}',
    '[{"type":"heading","title":"Bem-vindo ao meu universo","content":{"level":2}},{"type":"text","title":"","content":{"text":"Este é o começo da minha órbita digital."}},{"type":"link","title":"Meu link principal","content":{"url":"","description":"Adicione seu destino no editor"}}]'
  ),
  (
    'Nebulosa', 'nebulosa', 'Roxo profundo, ciano e uma presença mais ousada.',
    '{"theme_key":"nebula","accent_color":"#9a7cff","background_color":"#090713","background_type":"gradient","background_value":"nebula","button_style":"soft"}',
    '[{"type":"heading","title":"Explore minha nebulosa","content":{"level":2}},{"type":"link","title":"Portfólio","content":{"url":"","description":"Adicione seu destino no editor"}},{"type":"separator","title":"","content":{"style":"stars"}},{"type":"socials","title":"Onde me encontrar","content":{"items":[]}}]'
  ),
  (
    'Órbita Minimal', 'orbita-minimal', 'Contraste limpo para destacar conteúdo e conversão.',
    '{"theme_key":"minimal","accent_color":"#5dd9ff","background_color":"#070b10","background_type":"solid","background_value":"#070b10","button_style":"outline"}',
    '[{"type":"heading","title":"Olá, eu sou…","content":{"level":1}},{"type":"text","title":"","content":{"text":"Conte em poucas palavras o que torna seu trabalho especial."}},{"type":"link","title":"Vamos conversar","content":{"url":"","description":"Adicione seu destino no editor"}}]'
  )
on conflict (slug) do update set
  name = excluded.name,
  description = excluded.description,
  theme_config = excluded.theme_config,
  initial_blocks = excluded.initial_blocks,
  is_active = true;

insert into public.profiles (id, display_name, avatar_url)
select
  users.id,
  coalesce(nullif(trim(users.raw_user_meta_data ->> 'display_name'), ''), nullif(trim(users.raw_user_meta_data ->> 'full_name'), ''), 'Explorador'),
  nullif(users.raw_user_meta_data ->> 'avatar_url', '')
from auth.users as users
on conflict (id) do nothing;

insert into public.profile_settings (profile_id)
select id from public.profiles
on conflict (profile_id) do nothing;

insert into public.account_roles (user_id)
select id from public.profiles
on conflict (user_id) do nothing;

drop policy "Public profiles are readable" on public.profiles;
create policy "Published profiles are publicly readable"
on public.profiles for select
using (
  (is_published and username is not null)
  or (select auth.uid()) = id
  or public.is_admin()
);

create policy "Published profile settings are publicly readable"
on public.profile_settings for select
using (
  exists (
    select 1 from public.profiles
    where profiles.id = profile_settings.profile_id
      and profiles.is_published
      and profiles.username is not null
  )
);

alter table public.templates enable row level security;
alter table public.profile_blocks enable row level security;

create policy "Active templates are publicly readable"
on public.templates for select
using (is_active or public.is_admin());

create policy "Owners and visitors read permitted blocks"
on public.profile_blocks for select
using (
  (select auth.uid()) = profile_id
  or public.is_admin()
  or (
    is_visible
    and is_enabled
    and (published_at is null or published_at <= now())
    and exists (
      select 1 from public.profiles
      where profiles.id = profile_blocks.profile_id
        and profiles.is_published
        and profiles.username is not null
    )
  )
);

create policy "Users insert their own blocks"
on public.profile_blocks for insert to authenticated
with check ((select auth.uid()) = profile_id);

create policy "Users update their own blocks"
on public.profile_blocks for update to authenticated
using ((select auth.uid()) = profile_id)
with check ((select auth.uid()) = profile_id);

create policy "Users delete their own blocks"
on public.profile_blocks for delete to authenticated
using ((select auth.uid()) = profile_id);

create or replace function public.complete_onboarding(
  requested_username text,
  requested_display_name text,
  requested_template_slug text
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_user_id uuid := auth.uid();
  chosen_template public.templates%rowtype;
  already_completed boolean;
begin
  if current_user_id is null then
    raise exception 'authentication_required' using errcode = '42501';
  end if;

  select onboarding_completed into already_completed
  from public.profiles where id = current_user_id for update;

  if already_completed then
    return;
  end if;

  select * into chosen_template
  from public.templates
  where slug = lower(trim(requested_template_slug)) and is_active
  limit 1;

  if chosen_template.id is null then
    raise exception 'invalid_template' using errcode = '22023';
  end if;

  update public.profiles
  set username = lower(trim(requested_username)),
      display_name = trim(requested_display_name),
      selected_template_id = chosen_template.id,
      onboarding_completed = true,
      is_published = true
  where id = current_user_id;

  update public.profile_settings
  set theme_key = coalesce(chosen_template.theme_config ->> 'theme_key', theme_key),
      accent_color = coalesce(chosen_template.theme_config ->> 'accent_color', accent_color),
      background_color = coalesce(chosen_template.theme_config ->> 'background_color', background_color),
      background_type = coalesce(chosen_template.theme_config ->> 'background_type', background_type),
      background_value = coalesce(chosen_template.theme_config ->> 'background_value', background_value),
      button_style = coalesce(chosen_template.theme_config ->> 'button_style', button_style)
  where profile_id = current_user_id;

  if not exists (select 1 from public.profile_blocks where profile_id = current_user_id) then
    insert into public.profile_blocks (profile_id, type, position, title, content)
    select
      current_user_id,
      (item.value ->> 'type')::public.profile_block_type,
      (item.ordinality - 1)::integer,
      coalesce(item.value ->> 'title', ''),
      coalesce(item.value -> 'content', '{}'::jsonb)
    from jsonb_array_elements(chosen_template.initial_blocks) with ordinality as item(value, ordinality);
  end if;
end;
$$;

create or replace function public.reorder_profile_blocks(block_ids uuid[])
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_user_id uuid := auth.uid();
  owned_count integer;
begin
  if current_user_id is null then
    raise exception 'authentication_required' using errcode = '42501';
  end if;

  select count(*) into owned_count
  from public.profile_blocks where profile_id = current_user_id;

  if cardinality(block_ids) <> owned_count
    or (select count(distinct id) from unnest(block_ids) as id) <> owned_count
    or exists (
      select 1 from unnest(block_ids) as requested(id)
      where not exists (
        select 1 from public.profile_blocks
        where profile_blocks.id = requested.id
          and profile_blocks.profile_id = current_user_id
      )
    ) then
    raise exception 'invalid_block_order' using errcode = '22023';
  end if;

  update public.profile_blocks as blocks
  set position = requested.ordinality - 1
  from unnest(block_ids) with ordinality as requested(id, ordinality)
  where blocks.id = requested.id and blocks.profile_id = current_user_id;
end;
$$;

revoke all on function public.complete_onboarding(text, text, text) from public;
revoke all on function public.reorder_profile_blocks(uuid[]) from public;
grant execute on function public.complete_onboarding(text, text, text) to authenticated;
grant execute on function public.reorder_profile_blocks(uuid[]) to authenticated;

commit;
