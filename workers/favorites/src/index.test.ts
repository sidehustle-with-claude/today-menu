import { describe, expect, it } from "vitest";
import worker, { type Env } from "./index";

// 진짜 D1 대신 쓰는 가짜. 어떤 SQL 과 값이 왔는지 기록하고, 정해 둔 결과를 돌려준다.
function fakeEnv(rows: unknown[] = []) {
  const calls: { sql: string; values: unknown[] }[] = [];
  const env: Env = {
    ALLOWED_ORIGIN: "https://example.com",
    DB: {
      prepare(sql: string) {
        return {
          bind(...values: unknown[]) {
            calls.push({ sql, values });
            return {
              run: async () => ({}),
              all: async <T>() => ({ results: rows as T[] }),
            };
          },
        };
      },
    },
  };
  return { env, calls };
}

const post = (body: unknown) =>
  new Request("http://x/api/favorites", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: typeof body === "string" ? body : JSON.stringify(body),
  });

describe("favorites API", () => {
  it("POST 는 값을 bind 로 넣고 201", async () => {
    const { env, calls } = fakeEnv();
    const res = await worker.fetch(post({ place_id: "p1", place_name: "가상 식당" }), env);
    expect(res.status).toBe(201);
    expect(calls[0].sql).toContain("INSERT OR IGNORE");
    expect(calls[0].sql).not.toContain("p1");
    expect(calls[0].values).toEqual(["p1", "가상 식당"]);
  });

  it("비었거나 100자를 넘으면 400", async () => {
    const { env, calls } = fakeEnv();
    expect((await worker.fetch(post({ place_id: "", place_name: "a" }), env)).status).toBe(400);
    expect((await worker.fetch(post({ place_id: "p", place_name: "가".repeat(101) }), env)).status).toBe(400);
    expect((await worker.fetch(post("{깨짐"), env)).status).toBe(400);
    expect(calls).toHaveLength(0);
  });

  it("SQL 주입 문자열도 값으로만 들어간다", async () => {
    const { env, calls } = fakeEnv();
    await worker.fetch(post({ place_id: "p1", place_name: "x'); DROP TABLE favorites;--" }), env);
    expect(calls[0].sql).not.toContain("DROP");
  });

  it("GET 은 목록을 돌려준다", async () => {
    const { env } = fakeEnv([{ id: 1, place_id: "p1", place_name: "가상 식당", created_at: "2026-11-01" }]);
    const res = await worker.fetch(new Request("http://x/api/favorites"), env);
    expect(res.status).toBe(200);
    expect((await res.json() as any).favorites).toHaveLength(1);
  });

  it("CORS 는 허용한 주소 하나만 내려가고 별표가 아니다", async () => {
    const { env } = fakeEnv();
    const res = await worker.fetch(new Request("http://x/api/favorites", { method: "OPTIONS" }), env);
    expect(res.status).toBe(204);
    expect(res.headers.get("access-control-allow-origin")).toBe("https://example.com");
  });

  it("다른 주소와 방식은 404, 405", async () => {
    const { env } = fakeEnv();
    expect((await worker.fetch(new Request("http://x/other"), env)).status).toBe(404);
    expect((await worker.fetch(new Request("http://x/api/favorites", { method: "DELETE" }), env)).status).toBe(405);
  });
});
