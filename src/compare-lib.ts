// 비교 스크립트가 쓰는 계산 함수. 호출 없이 계산만 하므로 테스트할 수 있다.
import type { TasteFilter } from "./parse-taste";

export type Sample = { id: string; level: string; text: string; answer: Partial<TasteFilter> };

function sameSet(a: string[] = [], b: string[] = []): boolean {
  return JSON.stringify([...a].sort()) === JSON.stringify([...b].sort());
}

// 필드별 일치: category, avoid, solo 중 몇 개가 정답과 같은가 (0~3)
export function fieldMatches(got: Partial<TasteFilter>, answer: Partial<TasteFilter>): number {
  let n = 0;
  if ((got.category ?? null) === (answer.category ?? null)) n++;
  if (sameSet(got.avoid ?? [], answer.avoid ?? [])) n++;
  if ((got.solo ?? false) === (answer.solo ?? false)) n++;
  return n;
}

export function parseJsonOrNull(text: string): Partial<TasteFilter> | null {
  const cleaned = text.trim().replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "");
  try {
    const v = JSON.parse(cleaned);
    return v && typeof v === "object" ? v : null;
  } catch {
    return null;
  }
}

// 토큰으로 계산한 비용(달러). 단가는 100만 토큰당 달러.
export function costUsd(inTok: number, outTok: number, inPrice: number, outPrice: number): number {
  return (inTok * inPrice + outTok * outPrice) / 1_000_000;
}
