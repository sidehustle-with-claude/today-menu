import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { parseTaste } from "./parse-taste";

// 이 테스트는 항상 목업으로 돈다. 유료 API를 호출하지 않는다.
describe("parseTaste (MOCK_LLM=1)", () => {
  const saved = process.env.MOCK_LLM;
  beforeEach(() => {
    process.env.MOCK_LLM = "1";
  });
  afterEach(() => {
    if (saved === undefined) delete process.env.MOCK_LLM;
    else process.env.MOCK_LLM = saved;
  });

  it("목업은 avoid 와 solo 를 채운 필터를 돌려준다", async () => {
    const f = await parseTaste("매운 거 말고, 혼밥");
    expect(f.avoid).toEqual(["매운"]);
    expect(f.solo).toBe(true);
    expect(f.category).toBeUndefined();
  });
});
