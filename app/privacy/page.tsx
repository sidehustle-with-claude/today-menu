import type { Metadata } from "next";
import SiteFooter from "../site-footer";
import { readDoc } from "../../src/content";
import { renderMarkdown } from "../../src/markdown";

// 심사 담당자와 사용자가 읽는 페이지이므로 noindex 를 넣지 않는다.
export const metadata: Metadata = {
  title: "개인정보처리방침 | 오늘 뭐 먹지",
  description: "오늘 뭐 먹지가 어떤 정보를 받고, 어디에 쓰고, 언제 지우는지 안내합니다.",
  alternates: { canonical: "/privacy" },
};

export default function Privacy() {
  const html = renderMarkdown(readDoc("docs/privacy-policy.md"));
  return (
    <main className="wide doc">
      {/* 문서는 우리 저장소의 docs/privacy-policy.md 이고 변환기가 HTML 을 이스케이프한다. */}
      <div dangerouslySetInnerHTML={{ __html: html }} />
      <SiteFooter />
    </main>
  );
}
