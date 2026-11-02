import { describe, expect, it } from "vitest";
import { absoluteUrl, clampTitle, CONTENT_UPDATED, SITE_URL } from "./site";

describe("site", () => {
  it("기본 주소는 가짜 예시 주소이고 끝에 슬래시가 없다", () => {
    expect(SITE_URL).toMatch(/^https:\/\/[^/]+$/);
  });

  it("절대 주소를 만든다", () => {
    expect(absoluteUrl("/place/r1")).toBe(`${SITE_URL}/place/r1`);
    expect(absoluteUrl("sitemap.xml")).toBe(`${SITE_URL}/sitemap.xml`);
  });

  it("title 은 60자를 넘기지 않는다", () => {
    expect(clampTitle("가".repeat(100)).length).toBe(60);
    expect(clampTitle("짧은 제목")).toBe("짧은 제목");
  });

  it("lastmod 날짜는 YYYY-MM-DD 모양이다", () => {
    expect(CONTENT_UPDATED).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});
