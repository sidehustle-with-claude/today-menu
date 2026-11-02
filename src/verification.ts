// 검색 엔진 소유권 확인용 메타 태그. 값이 있을 때만 <head> 에 들어간다.
// 값은 비밀이 아니지만 코드에 쓰지 않고 환경변수로 받는다. 도메인 속성은 DNS TXT 로 확인하므로 보통은 필요 없다.
import type { Metadata } from "next";

export function verificationMeta(env: Record<string, string | undefined> = process.env): Metadata["verification"] | undefined {
  const google = (env.GOOGLE_SITE_VERIFICATION ?? "").trim();
  if (!google) return undefined;
  return { google };
}
