begin;

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
        'day', days.day::date,
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

commit;
