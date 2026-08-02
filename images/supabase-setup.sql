create extension if not exists pgcrypto;

create table if not exists public.toto_posts (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  author_id uuid not null references auth.users(id) on delete cascade,
  author_name text not null check (char_length(author_name) between 1 and 30),
  title text not null check (char_length(title) between 1 and 80),
  body text not null check (char_length(body) between 1 and 2000),
  image_path text,
  published boolean not null default true
);

create index if not exists toto_posts_created_at_idx on public.toto_posts(created_at desc);
create index if not exists toto_posts_author_id_idx on public.toto_posts(author_id);
alter table public.toto_posts enable row level security;

grant select on public.toto_posts to anon, authenticated;
grant insert, update, delete on public.toto_posts to authenticated;

drop policy if exists "public read" on public.toto_posts;
create policy "public read" on public.toto_posts for select to anon, authenticated
using (published = true or (select auth.uid()) = author_id);

drop policy if exists "family insert" on public.toto_posts;
create policy "family insert" on public.toto_posts for insert to authenticated
with check ((select auth.uid()) = author_id);

drop policy if exists "owner update" on public.toto_posts;
create policy "owner update" on public.toto_posts for update to authenticated
using ((select auth.uid()) = author_id)
with check ((select auth.uid()) = author_id);

drop policy if exists "owner delete" on public.toto_posts;
create policy "owner delete" on public.toto_posts for delete to authenticated
using ((select auth.uid()) = author_id);

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('toto-photos','toto-photos',true,10485760,array['image/jpeg','image/png','image/webp','image/heic','image/heif'])
on conflict (id) do update set public=true, file_size_limit=10485760,
allowed_mime_types=array['image/jpeg','image/png','image/webp','image/heic','image/heif'];

drop policy if exists "family photo upload" on storage.objects;
create policy "family photo upload" on storage.objects for insert to authenticated
with check (bucket_id='toto-photos' and (storage.foldername(name))[1]=(select auth.uid())::text);

drop policy if exists "owner photo delete" on storage.objects;
create policy "owner photo delete" on storage.objects for delete to authenticated
using (bucket_id='toto-photos' and owner_id=(select auth.uid())::text);
