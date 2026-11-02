import { describe, expect, it } from "vitest";
import { pullFavorites, pushFavorite, type FetchLike } from "./favorites-api";

const ok = (body: unknown): FetchLike => async () =>
  new Response(JSON.stringify(body), { status: 200, headers: { "content-type": "application/json" } });
const down: FetchLike = async () => {
  throw new Error("network");
};

describe("favorites-api", () => {
  it("주소가 없으면 아무것도 부르지 않는다", async () => {
    expect(await pushFavorite("", "r001", "가상", down)).toBe(false);
    expect(await pullFavorites("", down)).toBeNull();
  });
  it("성공하면 true, 목록은 place_id 배열", async () => {
    expect(await pushFavorite("http://x", "r001", "가상", ok({ ok: true }))).toBe(true);
    expect(await pullFavorites("http://x", ok({ favorites: [{ place_id: "r001" }, { place_id: "r002" }] }))).toEqual(["r001", "r002"]);
  });
  it("네트워크가 실패해도 던지지 않고 실패로 돌려준다", async () => {
    expect(await pushFavorite("http://x", "r001", "가상", down)).toBe(false);
    expect(await pullFavorites("http://x", down)).toBeNull();
  });
});
