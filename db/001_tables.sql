-- 27장: 즐겨찾기와 후기 표 (Supabase SQL Editor 에 붙여 실행합니다. 처음 만드는 표라 drop, delete, truncate 는 없습니다.)
-- RLS 는 일부러 여기서 켜지 않습니다. 켜기 전과 후를 비교하려고 db/002_rls.sql 에 따로 적었습니다.
-- 연습용 프로젝트에서만 실행하고, 실제 사용자 정보는 넣지 않습니다.

create table public.favorites (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users (id) on delete cascade,
  place_id   text not null,
  place_name text not null,
  created_at timestamptz not null default now(),
  -- 같은 사용자가 같은 가게를 두 번 못 넣게 한다.
  unique (user_id, place_id)
);

create table public.reviews (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users (id) on delete cascade,
  place_id   text not null,
  rating     integer not null check (rating between 1 and 5),
  body       text not null check (char_length(body) <= 500),
  created_at timestamptz not null default now()
);

create index favorites_user_id_idx on public.favorites (user_id);
create index reviews_place_id_idx on public.reviews (place_id);
