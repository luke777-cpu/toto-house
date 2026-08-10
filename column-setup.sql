-- 칼럼(글) 공간 — 형님(아빠, ypark1416@gmail.com)만 쓸 수 있는 별도 게시판.
-- 기존 toto_posts(가족 게시판)와 완전히 분리된 테이블/정책을 씁니다.

create table if not exists public.toto_columns (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  author_id uuid not null references auth.users(id) on delete cascade,
  author_name text not null default '아빠',
  title text not null check (char_length(title) between 1 and 100),
  body text not null check (char_length(body) between 1 and 20000),
  cover_image_path text,
  published boolean not null default true
);

create index if not exists toto_columns_created_at_idx on public.toto_columns(created_at desc);
alter table public.toto_columns enable row level security;

grant select on public.toto_columns to anon, authenticated;
grant insert, update, delete on public.toto_columns to authenticated;

-- 읽기: 가족 누구나(로그인 안 해도) 볼 수 있게 공개
drop policy if exists "public read" on public.toto_columns;
create policy "public read" on public.toto_columns for select to anon, authenticated
using (published = true);

-- 쓰기/수정/삭제: 오직 형님(ypark1416@gmail.com) 계정만
drop policy if exists "author only insert" on public.toto_columns;
create policy "author only insert" on public.toto_columns for insert to authenticated
with check ((select auth.jwt() ->> 'email') = 'ypark1416@gmail.com' and (select auth.uid()) = author_id);

drop policy if exists "author only update" on public.toto_columns;
create policy "author only update" on public.toto_columns for update to authenticated
using ((select auth.jwt() ->> 'email') = 'ypark1416@gmail.com')
with check ((select auth.jwt() ->> 'email') = 'ypark1416@gmail.com');

drop policy if exists "author only delete" on public.toto_columns;
create policy "author only delete" on public.toto_columns for delete to authenticated
using ((select auth.jwt() ->> 'email') = 'ypark1416@gmail.com');

-- 사진(표지 이미지)은 기존 toto-photos 버킷을 columns/ 폴더로 나눠 재사용합니다.
drop policy if exists "column cover upload" on storage.objects;
create policy "column cover upload" on storage.objects for insert to authenticated
with check (
  bucket_id = 'toto-photos'
  and (storage.foldername(name))[1] = 'columns'
  and (select auth.jwt() ->> 'email') = 'ypark1416@gmail.com'
);

drop policy if exists "column cover delete" on storage.objects;
create policy "column cover delete" on storage.objects for delete to authenticated
using (
  bucket_id = 'toto-photos'
  and (storage.foldername(name))[1] = 'columns'
  and (select auth.jwt() ->> 'email') = 'ypark1416@gmail.com'
);
