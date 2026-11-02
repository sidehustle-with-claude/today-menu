import type { MetadataRoute } from "next";
import { absoluteUrl } from "../src/site";

// 36장의 선택: ChatGPT 검색에는 보이되(OAI-SearchBot 허용) 학습 수집은 거부한다(GPTBot 차단).
// 두 설정은 서로 독립이다. 다른 회사 크롤러는 각 회사 공식 문서를 확인한 뒤 추가한다.
// robots.txt 는 정중한 요청일 뿐 강제 차단이 아니다. 숨겨야 하는 정보는 로그인으로 지킨다.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: "OAI-SearchBot", allow: "/" },
      { userAgent: "GPTBot", disallow: "/" },
      { userAgent: "*", allow: "/" },
    ],
    sitemap: absoluteUrl("/sitemap.xml"),
  };
}
