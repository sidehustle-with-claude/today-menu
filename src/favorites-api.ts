// 26장: 즐겨찾기를 Workers API(workers/favorites)에도 저장한다.
// API 주소는 환경변수 NEXT_PUBLIC_API_BASE 에서 온다(공개돼도 되는 주소). 없으면 localStorage 만 쓴다.
// 서버가 실패해도 화면은 localStorage 로 계속 동작한다.

export type FetchLike = (input: string, init?: RequestInit) => Promise<Response>;

export function apiBase(): string {
  return (process.env.NEXT_PUBLIC_API_BASE ?? "").replace(/\/$/, "");
}

export async function pushFavorite(
  base: string, placeId: string, placeName: string, f: FetchLike = fetch,
): Promise<boolean> {
  if (!base) return false;
  try {
    const res = await f(`${base}/api/favorites`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ place_id: placeId, place_name: placeName }),
    });
    return res.ok;
  } catch {
    return false;
  }
}

export async function pullFavorites(base: string, f: FetchLike = fetch): Promise<string[] | null> {
  if (!base) return null;
  try {
    const res = await f(`${base}/api/favorites`);
    if (!res.ok) return null;
    const data = (await res.json()) as { favorites?: { place_id: string }[] };
    return (data.favorites ?? []).map((x) => x.place_id);
  } catch {
    return null;
  }
}
