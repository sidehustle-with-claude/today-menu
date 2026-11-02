import { describe, expect, it } from "vitest";
import { addFavorite, loadFavoriteIds, removeFavorite, type FavoritesDb } from "./favorites-supabase";

function fakeDb(opts: { rows?: { place_id: string }[]; error?: unknown } = {}) {
  const log: string[] = [];
  const db: FavoritesDb = {
    from: () => ({
      select: async (cols) => {
        log.push(`select ${cols}`);
        return { data: opts.error ? null : (opts.rows ?? []), error: opts.error ?? null };
      },
      insert: async (row) => {
        log.push(`insert ${row.user_id}/${row.place_id}`);
        return { error: opts.error ?? null };
      },
      delete: () => ({
        eq: async (col, value) => {
          log.push(`delete ${col}=${value}`);
          return { error: opts.error ?? null };
        },
      }),
    }),
  };
  return { db, log };
}

describe("favorites-supabase", () => {
  it("목록은 place_id 배열", async () => {
    const { db } = fakeDb({ rows: [{ place_id: "r001" }, { place_id: "r002" }] });
    expect(await loadFavoriteIds(db)).toEqual(["r001", "r002"]);
  });
  it("오류면 null 이나 false", async () => {
    const { db } = fakeDb({ error: { message: "rls" } });
    expect(await loadFavoriteIds(db)).toBeNull();
    expect(await addFavorite(db, "u1", "r001", "가상")).toBe(false);
    expect(await removeFavorite(db, "r001")).toBe(false);
  });
  it("추가와 삭제는 사용자와 가게로 요청한다", async () => {
    const { db, log } = fakeDb();
    expect(await addFavorite(db, "u1", "r001", "가상")).toBe(true);
    expect(await removeFavorite(db, "r001")).toBe(true);
    expect(log).toEqual(["insert u1/r001", "delete place_id=r001"]);
  });
});
