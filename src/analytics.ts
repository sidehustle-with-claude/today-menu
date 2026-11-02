// 방문 통계(GA4). 측정 ID 가 없거나 개발 환경이면 아무것도 보내지 않는다.
// 이벤트 이름과 매개변수를 이 파일에서만 정해 두어, 개인정보가 섞여 들어가지 않게 한다.

// 책에 나오는 가짜 값(G-XXXXXXXXXX)은 형식이 맞아도 켜지 않는다.
export function gaId(raw: string | undefined = process.env.NEXT_PUBLIC_GA_ID): string | null {
  const id = (raw ?? "").trim();
  if (!/^G-[A-Z0-9]{6,}$/.test(id)) return null;
  if (/^G-X+$/.test(id)) return null;
  return id;
}

export function gaEnabled(nodeEnv: string | undefined = process.env.NODE_ENV, raw?: string): boolean {
  return nodeEnv === "production" && gaId(raw ?? process.env.NEXT_PUBLIC_GA_ID) !== null;
}

// 보낼 수 있는 이벤트와 매개변수. 가게 이름, 이메일, 위치는 여기에 없다.
const ALLOWED: Record<string, readonly string[]> = {
  favorite_add: ["menu_category"],
};

type GtagWindow = { gtag?: (...args: unknown[]) => void };

export function track(
  name: string,
  params: Record<string, string> = {},
  w: GtagWindow | undefined = typeof window === "undefined" ? undefined : (window as unknown as GtagWindow),
): boolean {
  const allowed = ALLOWED[name];
  if (!allowed || !w || typeof w.gtag !== "function") return false; // 개발·광고 차단 환경에서도 에러가 나지 않는다
  const clean: Record<string, string> = {};
  for (const k of allowed) if (typeof params[k] === "string") clean[k] = params[k].slice(0, 40);
  w.gtag("event", name, clean);
  return true;
}
