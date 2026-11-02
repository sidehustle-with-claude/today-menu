// 사이트 주소와 공통 문구. 실제 주소가 생기면 환경변수 NEXT_PUBLIC_SITE_URL 로 넣는다.
// 아래 기본값은 가짜 예시 주소다.
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://today-menu.example.com").replace(/\/+$/, "");

export const SITE_NAME = "오늘 뭐 먹지";
export const SITE_DESCRIPTION = "동네와 메뉴를 고르면 오늘 갈 만한 곳 3곳을 골라 드려요.";

// 사이트맵 lastmod 에 쓰는 날짜. 가게 데이터나 글이 실제로 바뀐 날에만 직접 고친다.
// 빌드할 때마다 오늘 날짜를 넣으면 구글이 lastmod 를 믿지 않게 된다.
export const CONTENT_UPDATED = "2026-11-01";

export function absoluteUrl(path: string): string {
  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

// title 은 60자 안쪽으로 맞춘다.
export function clampTitle(title: string, max = 60): string {
  return title.length <= max ? title : `${title.slice(0, max - 1)}…`;
}
