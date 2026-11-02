import { describe, expect, it } from "vitest";
import { renderMarkdown } from "./markdown";
import { readFileSync } from "node:fs";

describe("renderMarkdown", () => {
  it("제목과 문단과 목록을 바꾼다", () => {
    const html = renderMarkdown("# 제목\n\n문장 하나\n이어지는 문장\n\n- 가\n- 나");
    expect(html).toContain("<h1>제목</h1>");
    expect(html).toContain("<p>문장 하나 이어지는 문장</p>");
    expect(html).toContain("<ul><li>가</li><li>나</li></ul>");
  });

  it("표를 바꾼다", () => {
    const html = renderMarkdown("| 이름 | 값 |\n| --- | --- |\n| a | b |");
    expect(html).toContain("<th>이름</th>");
    expect(html).toContain("<td>b</td>");
  });

  it("문서 안의 HTML 은 글자로만 보인다", () => {
    const html = renderMarkdown("<script>alert(1)</script>");
    expect(html).not.toContain("<script>");
    expect(html).toContain("&lt;script&gt;");
  });

  it("처리방침 문서의 9개 항목 제목이 모두 나온다", () => {
    const md = readFileSync("docs/privacy-policy.md", "utf8");
    const html = renderMarkdown(md);
    expect((html.match(/<h2>/g) ?? []).length).toBe(9);
    expect(html).toContain("<h1>개인정보처리방침</h1>");
  });
});
