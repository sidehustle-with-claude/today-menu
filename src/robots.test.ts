import { describe, expect, it } from "vitest";
import robots from "../app/robots";

describe("robots", () => {
  const r = robots();
  const rules = Array.isArray(r.rules) ? r.rules : [r.rules];
  const byAgent = (a: string) => rules.find((x) => x.userAgent === a);

  it("OAI-SearchBot 은 허용하고 GPTBot 은 막는다", () => {
    expect(byAgent("OAI-SearchBot")?.allow).toBe("/");
    expect(byAgent("GPTBot")?.disallow).toBe("/");
  });

  it("나머지 로봇은 전체 허용이고 사이트 전체를 막는 규칙이 없다", () => {
    expect(byAgent("*")?.allow).toBe("/");
    expect(byAgent("*")?.disallow).toBeUndefined();
  });

  it("사이트맵 한 줄이 있다", () => {
    expect(String(r.sitemap)).toMatch(/\/sitemap\.xml$/);
  });
});
