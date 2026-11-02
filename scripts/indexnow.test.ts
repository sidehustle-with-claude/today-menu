import { describe, expect, it } from "vitest";
import { execFileSync } from "node:child_process";

describe("scripts/indexnow.mjs", () => {
  it("기본은 보내지 않고 내용만 보여 주며 키 값은 출력하지 않는다", () => {
    const out = execFileSync("node", ["scripts/indexnow.mjs", "/updates/2026-11", "/guides/neighborhood-not-found"], {
      encoding: "utf8",
      env: { ...process.env, SITE_URL: "https://today-menu.example.com" },
    });
    expect(out).toContain("보내지 않음");
    expect(out).toContain("주소 2개, 요청 1번");
    expect(out).toContain("https://today-menu.example.com/updates/2026-11");
    expect(out).not.toMatch(/[a-z0-9]{32}/);
  });

  it("주소가 11개면 요청을 두 번으로 나눈다", () => {
    const paths = Array.from({ length: 11 }, (_, i) => `/p/${i}`);
    const out = execFileSync("node", ["scripts/indexnow.mjs", ...paths], { encoding: "utf8" });
    expect(out).toContain("요청 2번");
  });

  it("주소가 없으면 실패한다", () => {
    expect(() => execFileSync("node", ["scripts/indexnow.mjs"], { stdio: "pipe" })).toThrow();
  });
});
