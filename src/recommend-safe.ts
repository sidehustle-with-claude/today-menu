// 예제 19-2: src/recommend-safe.ts
// AI가 실패해도 서비스가 멈추지 않게 한다: 한도 오류에서는 재시도하지 않고 코드 기반 추천으로 내려간다.
import { complete, type LlmResult, type Provider } from "./llm";
import { redactPersonalInfo } from "./redact";
import { recommend, type Filter, type Place, type Weather } from "./recommend";

export type UserInput = { tasteText: string };

export const SYSTEM = `사용자의 한 줄 음식 취향을 JSON 하나로 바꿉니다.
키: category(한식|분식|카페|양식|중식|일식 중 하나, 모르면 생략),
avoid(피할 맛이나 재료 문자열 배열), solo(혼자 먹기면 true).
JSON 외의 글자는 쓰지 않습니다.`;

export type Completer = (p: Provider, system: string, user: string) => Promise<LlmResult>;

export async function recommendSafe(input: UserInput, run: Completer = complete) {
  try {
    const r = await run("claude", SYSTEM, redactPersonalInfo(input.tasteText).slice(0, 100));
    return { mode: "ai" as const, filter: JSON.parse(r.text) as Filter };
  } catch (e: any) {
    // 월 상한(400, 429 enforced_spend_limit_reached)과 일시 429를 구분하는 일은 SDK 버전별 오류 모양을 보고 완성한다.
    const spendLimit = e?.status === 400 || e?.status === 429;
    console.warn("llm failed", e?.status, spendLimit);
    return { mode: "rules" as const, filter: null };
  }
}

// 화면이 쓰는 함수: AI가 되면 AI 필터로, 안 되면 코드 기반 기본 추천으로 3곳을 돌려준다.
export async function recommendWithFallback<T extends Place>(
  places: T[], input: UserInput, weather: Weather, run: Completer = complete,
) {
  const r = await recommendSafe(input, run);
  const picks = recommend(places, r.filter ?? {}, weather);
  return {
    mode: r.mode,
    places: picks,
    notice: r.mode === "rules" ? "AI 설명 없이 기본 추천이에요" : "",
  };
}
