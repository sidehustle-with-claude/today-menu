// 로그인한 사용자의 즐겨찾기를 Supabase favorites 표에서 읽고 쓴다. 보호는 RLS(db/002_rls.sql)가 한다.
// 쓰는 만큼만 적은 최소 모양이라 가짜로 바꿔 단위 테스트할 수 있다.
export interface FavoritesDb {
  from(table: "favorites"): {
    select(cols: string): PromiseLike<{ data: { place_id: string }[] | null; error: unknown }>;
    insert(row: { user_id: string; place_id: string; place_name: string }): PromiseLike<{ error: unknown }>;
    delete(): { eq(col: string, value: string): PromiseLike<{ error: unknown }> };
  };
}

export async function loadFavoriteIds(db: FavoritesDb): Promise<string[] | null> {
  const { data, error } = await db.from("favorites").select("place_id");
  if (error || !data) return null;
  return data.map((r) => r.place_id);
}

export async function addFavorite(db: FavoritesDb, userId: string, placeId: string, placeName: string): Promise<boolean> {
  const { error } = await db.from("favorites").insert({ user_id: userId, place_id: placeId, place_name: placeName });
  return !error;
}

export async function removeFavorite(db: FavoritesDb, placeId: string): Promise<boolean> {
  const { error } = await db.from("favorites").delete().eq("place_id", placeId);
  return !error;
}
