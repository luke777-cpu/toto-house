-- ============================================================
-- 토토의 집 · 가족 앨범 기능 Supabase 설정
-- Supabase 대시보드 → SQL Editor 에서 전체를 한 번에 실행하세요.
-- ============================================================

-- 1) 관리자 목록 테이블
--    여기 등록된 계정은 모든 앨범/사진을 수정·삭제할 수 있습니다.
create table if not exists public.app_admins (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

alter table public.app_admins enable row level security;

-- 관리자 목록 자체는 로그인한 가족이면 조회만 가능(누가 관리자인지 확인용)
drop policy if exists "app_admins_select_authenticated" on public.app_admins;
create policy "app_admins_select_authenticated"
  on public.app_admins for select
  to authenticated
  using (true);

-- 현재 관리자를 확인하는 함수 (RLS 정책에서 재사용)
create or replace function public.is_app_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.app_admins where user_id = auth.uid()
  );
$$;

-- ⚠️ 형(ypark1416@gmail.com) 계정을 관리자로 등록합니다.
--    다른 가족을 관리자로 추가하려면 아래 이메일을 바꿔서 한 번 더 실행하세요.
insert into public.app_admins (user_id)
select id from auth.users where email = 'ypark1416@gmail.com'
on conflict (user_id) do nothing;


-- 2) albums 테이블
create table if not exists public.albums (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  cover_photo_url text,
  event_date date,
  event_date_end date,          -- 기간으로 촬영일을 남길 때 사용(선택 입력)
  created_by uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 3) album_photos 테이블
create table if not exists public.album_photos (
  id uuid primary key default gen_random_uuid(),
  album_id uuid not null references public.albums(id) on delete cascade,
  storage_path text not null,
  thumbnail_path text,
  original_name text,
  caption text,
  taken_at date,
  sort_order integer not null default 0,
  is_hero boolean not null default false,   -- 홈 화면 대표 사진 슬라이드에 쓸지 여부
  uploaded_by uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

create index if not exists album_photos_album_id_idx on public.album_photos(album_id, sort_order);
create index if not exists album_photos_hero_idx on public.album_photos(is_hero) where is_hero = true;
create index if not exists albums_updated_at_idx on public.albums(updated_at desc);

-- updated_at 자동 갱신
create or replace function public.touch_albums_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists albums_touch_updated_at on public.albums;
create trigger albums_touch_updated_at
  before update on public.albums
  for each row execute function public.touch_albums_updated_at();

-- 사진이 추가/삭제될 때 앨범의 updated_at도 갱신 (최근 업데이트 정렬용)
create or replace function public.touch_album_on_photo_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.albums
    set updated_at = now()
    where id = coalesce(new.album_id, old.album_id);
  return coalesce(new, old);
end;
$$;

drop trigger if exists album_photos_touch_album on public.album_photos;
create trigger album_photos_touch_album
  after insert or delete on public.album_photos
  for each row execute function public.touch_album_on_photo_change();


-- 4) RLS 활성화
alter table public.albums enable row level security;
alter table public.album_photos enable row level security;

-- 테이블 자체 접근 권한 부여 (RLS는 "행" 단위 필터링만 하고, 이 GRANT가 있어야
-- authenticated 역할이 테이블에 아예 접근할 수 있습니다. 이게 빠지면 403이 납니다.)
grant usage on schema public to authenticated;
grant select, insert, update, delete on public.albums to authenticated;
grant select, insert, update, delete on public.album_photos to authenticated;
grant select on public.app_admins to authenticated;

-- 조회: 로그인한 가족만
drop policy if exists "albums_select_authenticated" on public.albums;
create policy "albums_select_authenticated"
  on public.albums for select
  to authenticated
  using (true);

drop policy if exists "album_photos_select_authenticated" on public.album_photos;
create policy "album_photos_select_authenticated"
  on public.album_photos for select
  to authenticated
  using (true);

-- 생성: 로그인한 가족이면 누구나, 단 created_by/uploaded_by는 본인이어야 함
drop policy if exists "albums_insert_own" on public.albums;
create policy "albums_insert_own"
  on public.albums for insert
  to authenticated
  with check (created_by = auth.uid());

drop policy if exists "album_photos_insert_own" on public.album_photos;
create policy "album_photos_insert_own"
  on public.album_photos for insert
  to authenticated
  with check (uploaded_by = auth.uid());

-- 수정: 본인이 만든 것이거나 관리자
drop policy if exists "albums_update_own_or_admin" on public.albums;
create policy "albums_update_own_or_admin"
  on public.albums for update
  to authenticated
  using (created_by = auth.uid() or public.is_app_admin())
  with check (created_by = auth.uid() or public.is_app_admin());

drop policy if exists "album_photos_update_own_or_admin" on public.album_photos;
create policy "album_photos_update_own_or_admin"
  on public.album_photos for update
  to authenticated
  using (uploaded_by = auth.uid() or public.is_app_admin())
  with check (uploaded_by = auth.uid() or public.is_app_admin());

-- 삭제: 본인이 만든 것이거나 관리자
drop policy if exists "albums_delete_own_or_admin" on public.albums;
create policy "albums_delete_own_or_admin"
  on public.albums for delete
  to authenticated
  using (created_by = auth.uid() or public.is_app_admin());

drop policy if exists "album_photos_delete_own_or_admin" on public.album_photos;
create policy "album_photos_delete_own_or_admin"
  on public.album_photos for delete
  to authenticated
  using (uploaded_by = auth.uid() or public.is_app_admin());


-- 5) Storage 버킷 정책
--    버킷 자체(family-albums)는 Supabase 대시보드에서 먼저 만들어야 합니다.
--    (Storage → New bucket → 이름: family-albums → Public bucket: 체크)
--    "Public bucket"을 켜면 사진 주소를 아는 사람만 볼 수 있고, 목록이 검색엔진에
--    노출되지는 않습니다. 기존 toto-photos 버킷과 동일한 방식입니다.

-- 업로드: 로그인한 가족만, 본인 user_id 폴더 아래에만 쓰기 가능
drop policy if exists "family_albums_insert_own_folder" on storage.objects;
create policy "family_albums_insert_own_folder"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'family-albums'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- 수정(덮어쓰기): 본인 폴더 또는 관리자
drop policy if exists "family_albums_update_own_or_admin" on storage.objects;
create policy "family_albums_update_own_or_admin"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'family-albums'
    and ((storage.foldername(name))[1] = auth.uid()::text or public.is_app_admin())
  );

-- 삭제: 본인 폴더 또는 관리자
drop policy if exists "family_albums_delete_own_or_admin" on storage.objects;
create policy "family_albums_delete_own_or_admin"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'family-albums'
    and ((storage.foldername(name))[1] = auth.uid()::text or public.is_app_admin())
  );

-- 조회: 버킷을 Public으로 만들었다면 누구나 URL로 볼 수 있어 별도 정책이 필요 없지만,
-- 혹시 Public을 껐다면 아래 정책으로 "로그인한 가족만 조회" 가능하게 합니다.
drop policy if exists "family_albums_select_authenticated" on storage.objects;
create policy "family_albums_select_authenticated"
  on storage.objects for select
  to authenticated
  using (bucket_id = 'family-albums');

-- ============================================================
-- 실행 끝. 아래 순서대로 확인하세요.
-- 1. Storage에서 family-albums 버킷이 있는지 확인 (없으면 위 안내대로 생성)
-- 2. Table Editor에서 albums, album_photos, app_admins 테이블 생성 확인
-- 3. Authentication → Policies에서 정책들이 보이는지 확인
-- ============================================================
