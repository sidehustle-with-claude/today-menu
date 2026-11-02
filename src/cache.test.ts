import { describe, expect, it } from "vitest";
import { existsSync, rmSync } from "node:fs";
import { cacheKey, cached } from "./cache";

describe("cache", () => {
  it("키에 든 값이 하나라도 다르면 다른 키가 나온다", () => {
    const a = cacheKey("매운 거 말고", "v1", "model-a");
    expect(cacheKey("매운 거 말고", "v1", "model-a")).toBe(a);
    expect(cacheKey("매운 거 말고", "v2", "model-a")).not.toBe(a);
    expect(cacheKey("매운 거 말고", "v1", "model-b")).not.toBe(a);
  });

  it("같은 키로 두 번 부르면 만드는 함수는 한 번만 실행된다", async () => {
    const key = cacheKey("test-cache-once", String(Date.now()));
    let calls = 0;
    const make = async () => ({ n: ++calls });
    const first = await cached(key, make);
    const second = await cached(key, make);
    expect(first).toEqual({ n: 1 });
    expect(second).toEqual({ n: 1 });
    expect(calls).toBe(1);
    rmSync(`.cache/${key}.json`);
    expect(existsSync(`.cache/${key}.json`)).toBe(false);
  });
});
