import type { MetadataRoute } from "next";
import { listPosts } from "../src/content";
import { restaurants } from "../src/places";
import { absoluteUrl, CONTENT_UPDATED } from "../src/site";

// 공개해도 되는 페이지만 넣는다. priority, changeFrequency 는 쓰지 않는다.
// 글의 lastModified 는 글 머리말의 날짜(실제 작성일)를 쓴다.
export default function sitemap(): MetadataRoute.Sitemap {
  const posts = [
    ...listPosts("updates").map((p) => ({ url: absoluteUrl(`/updates/${p.slug}`), lastModified: p.date })),
    ...listPosts("guides").map((p) => ({ url: absoluteUrl(`/guides/${p.slug}`), lastModified: p.date })),
  ];
  return [
    { url: absoluteUrl("/"), lastModified: CONTENT_UPDATED },
    { url: absoluteUrl("/menu"), lastModified: CONTENT_UPDATED },
    { url: absoluteUrl("/privacy"), lastModified: CONTENT_UPDATED },
    { url: absoluteUrl("/support"), lastModified: CONTENT_UPDATED },
    ...posts,
    ...restaurants.map((r) => ({ url: absoluteUrl(`/place/${r.id}`), lastModified: CONTENT_UPDATED })),
  ];
}
