import type { MetadataRoute } from "next";
import { absoluteUrl } from "../src/site";

// 전체 허용 + 사이트맵 한 줄. 개발 중에 넣어 둔 `Disallow: /` 는 여기 없어야 한다.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/" },
    sitemap: absoluteUrl("/sitemap.xml"),
  };
}
