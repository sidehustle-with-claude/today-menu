// 웹 광고(애드센스). 게시자 ID 는 환경변수에서만 읽고, 형식이 틀리거나 책의 가짜 값이면 켜지 않는다.
// 광고 코드는 운영(production)에서만 붙는다. 개발과 테스트에서는 아무것도 붙지 않는다.
export function adsensePub(raw: string | undefined = process.env.NEXT_PUBLIC_ADSENSE_PUB): string | null {
  const id = (raw ?? "").trim();
  if (!/^pub-\d{16}$/.test(id)) return null;
  if (/^pub-0+$/.test(id)) return null; // 책에 나오는 가짜 값
  return id;
}

export function adsenseEnabled(nodeEnv: string | undefined = process.env.NODE_ENV, raw?: string): boolean {
  return nodeEnv === "production" && adsensePub(raw ?? process.env.NEXT_PUBLIC_ADSENSE_PUB) !== null;
}

// ads.txt 는 내 줄 하나만 둔다. ID 가 없으면 null 을 돌려 파일을 만들지 않는다.
export function adsTxt(raw: string | undefined = process.env.NEXT_PUBLIC_ADSENSE_PUB): string | null {
  const id = adsensePub(raw);
  return id ? `google.com, ${id}, DIRECT, f08c47fec0942fa0\n` : null;
}
