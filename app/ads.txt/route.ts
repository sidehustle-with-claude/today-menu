import { adsTxt } from "../../src/adsense";

export const dynamic = "force-dynamic";

// 내도메인/ads.txt. 게시자 ID 가 없으면 404 로 둔다(빈 파일이나 다른 회사 줄을 만들지 않는다).
export function GET() {
  const body = adsTxt();
  if (!body) return new Response("Not Found", { status: 404 });
  return new Response(body, { headers: { "content-type": "text/plain; charset=utf-8" } });
}
