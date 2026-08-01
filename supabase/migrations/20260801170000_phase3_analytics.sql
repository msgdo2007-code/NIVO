begin;

create type public.analytics_event_type as enum ('profile_view', 'block_click');
create type public.analytics_device_type as enum ('desktop', 'mobile', 'tablet', 'other');

create table public.analytics_events (
  id bigint generated always as identity primary key,
  profile_id uuid not null references public.profiles(id) on delete cascade,
  block_id uuid references public.profile_blocks(id) on delete set null,
  event_type public.analytics_event_type not null,
  visitor_hash text not null,
  network_hash text not null,
  anonymous_hash text not null,
  dedupe_key text not null unique,
  referrer_host text,
  device_type public.analytics_device_type not null default 'other',
  country_code text,
  occurred_at timestamptz not null default now(),
  constraint analytics_events_visitor_hash check (visitor_hash ~ '^[a-f0-9]{64}$'),
  constraint analytics_events_network_hash check (network_hash ~ '^[a-f0-9]{64}$'),
  constraint analytics_events_anonymous_hash check (anonymous_hash ~ '^[a-f0-9]{64}$'),
  constraint analytics_events_dedupe_key check (dedupe_key ~ '^[a-f0-9]{64}$'),
  constraint analytics_events_referrer_length check (referrer_host is null or char_length(referrer_host) <= 253),
  constraint analytics_events_country_code check (country_code is null or country_code ~ '^[A-Z]{2}$'),
  constraint analytics_events_block_consistency check (
    (event_type = 'profile_view' and block_id is null)
    or (event_type = 'block_click' and block_id is not null)
  )
);

create table public.analytics_daily_visitors (
  profile_id uuid not null references public.profiles(id) on delete cascade,
  day date not null,
  visitor_hash text not null,
  created_at timestamptz not null default now(),
  primary key (profile_id, day, visitor_hash),
  constraint analytics_daily_visitors_hash check (visitor_hash ~ '^[a-f0-9]{64}$')
);

create table public.daily_analytics (
  profile_id uuid not null references public.profiles(id) on delete cascade,
  day date not null,
  views integer not null default 0,
  unique_visitors integer not null default 0,
  clicks integer not null default 0,
  updated_at timestamptz not null default now(),
  primary key (profile_id, day),
  constraint daily_analytics_nonnegative check (
    views >= 0 and unique_visitors >= 0 and clicks >= 0
  )
);

create index analytics_events_profile_time_idx
  on public.analytics_events(profile_id, occurred_at desc);
create index analytics_events_profile_type_time_idx
  on public.analytics_events(profile_id, event_type, occurred_at desc);
create index analytics_events_network_rate_idx
  on public.analytics_events(network_hash, event_type, occurred_at desc);
create index analytics_events_block_time_idx
  on public.analytics_events(block_id, occurred_at desc)
  where block_id is not null;
create index daily_analytics_profile_day_idx
  on public.daily_analytics(profile_id, day desc);

create trigger daily_analytics_set_updated_at before update on public.daily_analytics
for each row execute function public.set_updated_at();

alter table public.analytics_events enable row level security;
alter table public.analytics_daily_visitors enable row level security;
alter table public.daily_analytics enable row level security;

create policy "Users read their own daily analytics"
on public.daily_analytics for select to authenticated
using ((select auth.uid()) = profile_id or public.is_admin());

revoke all on table public.analytics_events from anon, authenticated;
revoke all on table public.analytics_daily_visitors from anon, authenticated;
revoke all on table public.daily_analytics from anon, authenticated;
grant select on table public.daily_analytics to authenticated;

create or replace function public.record_analytics_event(
  requested_profile_id uuid,
  requested_block_id uuid,
  requested_event_type public.analytics_event_type,
  requested_visitor_hash text,
  requested_network_hash text,
  requested_anonymous_hash text,
  requested_dedupe_key text,
  requested_referrer_host text default null,
  requested_device_type public.analytics_device_type default 'other',
  requested_country_code text default null
)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  inserted_count integer := 0;
  new_visitor_count integer := 0;
  event_day date := (now() at time zone 'UTC')::date;
  recent_events integer := 0;
begin
  if requested_visitor_hash !~ '^[a-f0-9]{64}$'
    or requested_network_hash !~ '^[a-f0-9]{64}$'
    or requested_anonymous_hash !~ '^[a-f0-9]{64}$'
    or requested_dedupe_key !~ '^[a-f0-9]{64}$' then
    raise exception 'invalid_analytics_hash' using errcode = '22023';
  end if;

  if requested_referrer_host is not null and char_length(requested_referrer_host) > 253 then
    raise exception 'invalid_referrer' using errcode = '22023';
  end if;

  if requested_country_code is not null and requested_country_code !~ '^[A-Z]{2}$' then
    raise exception 'invalid_country' using errcode = '22023';
  end if;

  if not exists (
    select 1 from public.profiles
    where id = requested_profile_id
      and is_published
      and username is not null
  ) then
    return false;
  end if;

  if requested_event_type = 'profile_view' and requested_block_id is not null then
    return false;
  end if;

  if requested_event_type = 'block_click' and not exists (
    select 1 from public.profile_blocks
    where id = requested_block_id
      and profile_id = requested_profile_id
      and is_visible
      and is_enabled
      and (published_at is null or published_at <= now())
  ) then
    return false;
  end if;

  select count(*) into recent_events
  from public.analytics_events
  where network_hash = requested_network_hash
    and event_type = requested_event_type
    and occurred_at >= now() - interval '1 minute';

  if recent_events >= (case when requested_event_type = 'profile_view' then 20 else 30 end) then
    return false;
  end if;

  insert into public.analytics_events (
    profile_id, block_id, event_type, visitor_hash, network_hash,
    anonymous_hash, dedupe_key, referrer_host, device_type, country_code
  ) values (
    requested_profile_id, requested_block_id, requested_event_type,
    requested_visitor_hash, requested_network_hash, requested_anonymous_hash,
    requested_dedupe_key, nullif(lower(trim(requested_referrer_host)), ''),
    requested_device_type, requested_country_code
  )
  on conflict (dedupe_key) do nothing;
  get diagnostics inserted_count = row_count;

  if inserted_count = 0 then
    return false;
  end if;

  if requested_event_type = 'profile_view' then
    insert into public.analytics_daily_visitors (profile_id, day, visitor_hash)
    values (requested_profile_id, event_day, requested_visitor_hash)
    on conflict do nothing;
    get diagnostics new_visitor_count = row_count;
  end if;

  insert into public.daily_analytics (profile_id, day, views, unique_visitors, clicks)
  values (
    requested_profile_id,
    event_day,
    case when requested_event_type = 'profile_view' then 1 else 0 end,
    new_visitor_count,
    case when requested_event_type = 'block_click' then 1 else 0 end
  )
  on conflict (profile_id, day) do update set
    views = public.daily_analytics.views + excluded.views,
    unique_visitors = public.daily_analytics.unique_visitors + excluded.unique_visitors,
    clicks = public.daily_analytics.clicks + excluded.clicks;

  return true;
end;
$$;

create or replace function public.get_analytics_summary(requested_days integer default 30)
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  current_user_id uuid := auth.uid();
  safe_days integer := least(greatest(coalesce(requested_days, 30), 7), 90);
  start_day date;
  result jsonb;
begin
  if current_user_id is null then
    raise exception 'authentication_required' using errcode = '42501';
  end if;

  start_day := (now() at time zone 'UTC')::date - (safe_days - 1);

  select jsonb_build_object(
    'period_days', safe_days,
    'totals', jsonb_build_object(
      'views', coalesce(sum(d.views), 0),
      'unique_visitors', coalesce(sum(d.unique_visitors), 0),
      'clicks', coalesce(sum(d.clicks), 0)
    ),
    'series', (
      select coalesce(jsonb_agg(jsonb_build_object(
        'day', days.day,
        'views', coalesce(series.views, 0),
        'unique_visitors', coalesce(series.unique_visitors, 0),
        'clicks', coalesce(series.clicks, 0)
      ) order by days.day), '[]'::jsonb)
      from generate_series(start_day, (now() at time zone 'UTC')::date, interval '1 day') as days(day)
      left join public.daily_analytics as series
        on series.profile_id = current_user_id and series.day = days.day::date
    ),
    'devices', (
      select coalesce(jsonb_agg(jsonb_build_object('name', device_type, 'value', amount) order by amount desc), '[]'::jsonb)
      from (
        select device_type::text, count(*)::integer as amount
        from public.analytics_events
        where profile_id = current_user_id
          and event_type = 'profile_view'
          and occurred_at >= start_day::timestamptz
        group by device_type
      ) as device_counts
    ),
    'sources', (
      select coalesce(jsonb_agg(jsonb_build_object('name', source, 'value', amount) order by amount desc), '[]'::jsonb)
      from (
        select coalesce(referrer_host, 'Direto') as source, count(*)::integer as amount
        from public.analytics_events
        where profile_id = current_user_id
          and event_type = 'profile_view'
          and occurred_at >= start_day::timestamptz
        group by coalesce(referrer_host, 'Direto')
        order by amount desc
        limit 6
      ) as source_counts
    ),
    'top_links', (
      select coalesce(jsonb_agg(jsonb_build_object(
        'block_id', block_id,
        'title', title,
        'clicks', amount
      ) order by amount desc), '[]'::jsonb)
      from (
        select blocks.id as block_id, coalesce(nullif(blocks.title, ''), 'Link sem título') as title, count(*)::integer as amount
        from public.analytics_events as events
        join public.profile_blocks as blocks on blocks.id = events.block_id
        where events.profile_id = current_user_id
          and events.event_type = 'block_click'
          and events.occurred_at >= start_day::timestamptz
        group by blocks.id, blocks.title
        order by amount desc
        limit 6
      ) as link_counts
    ),
    'recent_activity', (
      select coalesce(jsonb_agg(jsonb_build_object(
        'id', id,
        'type', event_type,
        'title', title,
        'occurred_at', occurred_at
      ) order by occurred_at desc), '[]'::jsonb)
      from (
        select events.id, events.event_type::text, blocks.title, events.occurred_at
        from public.analytics_events as events
        left join public.profile_blocks as blocks on blocks.id = events.block_id
        where events.profile_id = current_user_id
          and events.occurred_at >= start_day::timestamptz
        order by events.occurred_at desc
        limit 12
      ) as recent
    )
  ) into result
  from public.daily_analytics as d
  where d.profile_id = current_user_id and d.day >= start_day;

  return result;
end;
$$;

revoke all on function public.record_analytics_event(
  uuid, uuid, public.analytics_event_type, text, text, text, text,
  text, public.analytics_device_type, text
) from public;
revoke all on function public.get_analytics_summary(integer) from public;
grant execute on function public.record_analytics_event(
  uuid, uuid, public.analytics_event_type, text, text, text, text,
  text, public.analytics_device_type, text
) to service_role;
grant execute on function public.get_analytics_summary(integer) to authenticated;

commit;
