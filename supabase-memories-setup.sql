-- ============================================================
-- 토토의 집 · 어린 시절 타임캡슐(memories) 반응·댓글 설정
-- Supabase 대시보드 → SQL Editor 에서 전체를 한 번에 실행하세요.
-- (가족 앨범 설정: supabase-albums-setup.sql 을 먼저 실행해 두어야
--  is_app_admin() 함수를 재사용할 수 있습니다.)
-- ============================================================

create table if not exists public.memory_reactions (
  id uuid primary key default gen_random_uuid(),
  photo_id text not null,
  emoji text not null check (emoji in ('😂','❤️','😮')),
  user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (photo_id, user_id, emoji)
);

create table if not exists public.memory_comments (
  id uuid primary key default gen_random_uuid(),
  photo_id text not null,
  user_id uuid not null references auth.users(id) on delete cascade,
  author_name text not null default '가족',
  body text not null,
  created_at timestamptz not null default now()
);

create index if not exists memory_reactions_photo_idx on public.memory_reactions(photo_id);
create index if not exists memory_comments_photo_idx on public.memory_comments(photo_id, created_at);

alter table public.memory_reactions enable row level security;
alter table public.memory_comments enable row level security;

-- 테이블 접근 권한 (RLS와 별개로 반드시 필요합니다)
grant usage on schema public to authenticated;
grant select, insert, delete on public.memory_reactions to authenticated;
grant select, insert, delete on public.memory_comments to authenticated;

-- 조회: 로그인한 가족만
drop policy if exists "memory_reactions_select" on public.memory_reactions;
create policy "memory_reactions_select"
  on public.memory_reactions for select
  to authenticated
  using (true);

drop policy if exists "memory_comments_select" on public.memory_comments;
create policy "memory_comments_select"
  on public.memory_comments for select
  to authenticated
  using (true);

-- 생성: 로그인한 가족이면 누구나, 단 본인 이름으로만
drop policy if exists "memory_reactions_insert_own" on public.memory_reactions;
create policy "memory_reactions_insert_own"
  on public.memory_reactions for insert
  to authenticated
  with check (user_id = auth.uid());

drop policy if exists "memory_comments_insert_own" on public.memory_comments;
create policy "memory_comments_insert_own"
  on public.memory_comments for insert
  to authenticated
  with check (user_id = auth.uid());

-- 삭제: 본인 것이거나 관리자 (is_app_admin()은 supabase-albums-setup.sql에서 생성됨)
drop policy if exists "memory_reactions_delete_own_or_admin" on public.memory_reactions;
create policy "memory_reactions_delete_own_or_admin"
  on public.memory_reactions for delete
  to authenticated
  using (user_id = auth.uid() or public.is_app_admin());

drop policy if exists "memory_comments_delete_own_or_admin" on public.memory_comments;
create policy "memory_comments_delete_own_or_admin"
  on public.memory_comments for delete
  to authenticated
  using (user_id = auth.uid() or public.is_app_admin());

-- 실행 끝. Table Editor에서 memory_reactions, memory_comments 생성 확인하세요.
