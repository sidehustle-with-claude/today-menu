import { describe, expect, it } from "vitest";
import { getPost, listPosts, parsePost } from "./content";

describe("content", () => {
  it("글 머리말을 읽는다", () => {
    const p = parsePost("x", "---\ntitle: 제목\ndate: 2026-11-01\ndescription: 설명\n---\n본문");
    expect(p).toMatchObject({ slug: "x", title: "제목", date: "2026-11-01", description: "설명", body: "본문" });
  });

  it("업데이트 글과 사용법 글이 각각 1편 이상 있다", () => {
    expect(listPosts("updates").length).toBeGreaterThan(0);
    expect(getPost("guides", "neighborhood-not-found")?.title).toContain("동네");
  });

  it("모든 글에 날짜와 설명이 있다", () => {
    for (const kind of ["updates", "guides"] as const) {
      for (const p of listPosts(kind)) {
        expect(p.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
        expect(p.description.length).toBeGreaterThan(0);
      }
    }
  });
});
