import type { MetadataRoute } from "next";
import { restaurants } from "../src/places";
import { absoluteUrl, CONTENT_UPDATED } from "../src/site";

// 공개해도 되는 페이지만 넣는다. 즐겨찾기·로그인 화면은 주소가 따로 없어서 들어갈 것이 없다.
// priority, changeFrequency 는 구글이 무시하므로 쓰지 않는다. lastModified 는 실제로 바뀐 날짜만 쓴다.
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: absoluteUrl("/"), lastModified: CONTENT_UPDATED },
    ...restaurants.map((r) => ({
      url: absoluteUrl(`/place/${r.id}`),
      lastModified: CONTENT_UPDATED,
    })),
  ];
}
