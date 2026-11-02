// 어떤 결제 서비스를 쓸지 정한다. 이 저장소는 테스트 키로만 동작한다.
//  - 시크릿 키가 test_ 로 시작: 토스페이먼츠 테스트 모드
//  - 시크릿 키가 live_ 로 시작: 멈춘다(실서비스 전환은 가맹점 심사 뒤 사람이 직접 한다)
//  - 키가 없을 때: 개발 중이거나 PAYMENTS_MOCK=1 이면 가짜 결제, 아니면 결제 기능을 끈다
export type PaymentMode = "test" | "mock" | "off";

export class LiveKeyError extends Error {
  constructor() {
    super("실서비스 키(live_)가 설정돼 있어 멈춥니다. 이 저장소는 테스트 키로만 동작합니다.");
  }
}

export function isLiveKey(key: string | undefined): boolean {
  return /^live_/.test((key ?? "").trim());
}

export function paymentMode(env: Record<string, string | undefined> = process.env): PaymentMode {
  const secret = (env.TOSS_SECRET_KEY ?? "").trim();
  if (isLiveKey(secret) || isLiveKey(env.TOSS_CLIENT_KEY)) throw new LiveKeyError();
  if (/^test_/.test(secret)) return "test";
  if (secret) return "off"; // 알 수 없는 형식의 키는 쓰지 않는다
  if (env.PAYMENTS_MOCK === "1" || env.NODE_ENV !== "production") return "mock";
  return "off";
}
