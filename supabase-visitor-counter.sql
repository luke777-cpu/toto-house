-- 토토하우스 방문자 카운터
-- 서울 날짜 기준으로 같은 브라우저에서 하루 한 번 호출합니다.

create table if not exists public.toto_visit_days (
  visit_date date primary key,
  visits bigint not null default 0 check (visits >= 0)
);

alter table public.toto_visit_days enable row level security;
revoke all on table public.toto_visit_days from public, anon, authenticated;

create or replace function public.toto_visit_stats(p_increment boolean default false)
returns table(today_visits bigint, total_visits bigint)
language plpgsql
security definer
set search_path = ''
as $$
begin
  if p_increment then
    insert into public.toto_visit_days (visit_date, visits)
    values ((now() at time zone 'Asia/Seoul')::date, 1)
    on conflict (visit_date)
    do update set visits = public.toto_visit_days.visits + 1;
  end if;

  return query
  select
    coalesce(sum(v.visits) filter (
      where v.visit_date = (now() at time zone 'Asia/Seoul')::date
    ), 0)::bigint,
    coalesce(sum(v.visits), 0)::bigint
  from public.toto_visit_days as v;
end;
$$;

revoke all on function public.toto_visit_stats(boolean) from public;
grant execute on function public.toto_visit_stats(boolean) to anon, authenticated;
