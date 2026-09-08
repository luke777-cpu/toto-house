-- Supabase SQL Editor에서 한 번 실행
create table if not exists public.game_scores (
  id bigint generated always as identity primary key,
  game text not null,
  name text not null check (char_length(name) between 1 and 10),
  score integer not null check (score >= 0 and score < 1000000),
  level integer not null default 1,
  created_at timestamptz not null default now()
);
create index if not exists game_scores_game_score on public.game_scores (game, score desc);
alter table public.game_scores enable row level security;
create policy "anyone can read scores" on public.game_scores for select using (true);
create policy "anyone can add score"   on public.game_scores for insert with check (true);
