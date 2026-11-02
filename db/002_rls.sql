-- 27장 예제 27-1: 행 단위 접근 제어(RLS). 새 표를 만들면 같은 마이그레이션에 RLS 켜기와 정책을 함께 씁니다.
-- 실행은 사람이 SQL Editor 에서 합니다. 켜고 정책을 만들지 않으면 공개 키로는 아무 데이터도 접근할 수 없습니다(안전한 기본값).

-- favorites: 본인 행만 조회, 추가, 삭제
alter table public.favorites enable row level security;

-- 내 즐겨찾기만 보기
create policy "내 즐겨찾기만 보기"
on public.favorites for select
to authenticated
using ( auth.uid() is not null and (select auth.uid()) = user_id );

-- 내 즐겨찾기만 넣기
create policy "내 즐겨찾기만 넣기"
on public.favorites for insert
to authenticated
with check ( auth.uid() is not null and (select auth.uid()) = user_id );

-- 내 즐겨찾기만 지우기
create policy "내 즐겨찾기만 지우기"
on public.favorites for delete
to authenticated
using ( auth.uid() is not null and (select auth.uid()) = user_id );

-- reviews: 누구나 조회, 본인만 추가와 삭제
alter table public.reviews enable row level security;

-- 후기는 로그인하지 않아도 읽을 수 있다
create policy "후기는 누구나 보기"
on public.reviews for select
to anon, authenticated
using ( true );

-- 내 후기만 쓰기
create policy "내 후기만 쓰기"
on public.reviews for insert
to authenticated
with check ( auth.uid() is not null and (select auth.uid()) = user_id );

-- 내 후기만 지우기
create policy "내 후기만 지우기"
on public.reviews for delete
to authenticated
using ( auth.uid() is not null and (select auth.uid()) = user_id );
