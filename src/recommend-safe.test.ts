import { describe, expect, it } from "vitest";
import { recommendSafe, recommendWithFallback, type Completer } from "./recommend-safe";
import { costUsd, fieldMatches, parseJsonOrNull } from "./compare-lib";
import type { Place } from "./recommend";

const places: Place[] = [
  { id: "a", name: "가상 분식 하나", category: "분식", distanceM: 500, indoor: true, soupy: false, solo: true },
  { id: "b", name: "가상 한식 둘", category: "한식", distanceM: 800, indoor: true, soupy: true, solo: false },
  { id: "c", name: "가상 카페 셋", category: "카페", distanceM: 300, indoor: true, soupy: false, solo: true },
];
const weather = { rain: false, tempC: 20 };

const okRun: Completer = async () => ({ text: '{"category":"한식"}', ms: 1 });
const limitRun: Completer = async () => {
  throw Object.assign(new Error("spend limit"), { status: 429 });
};

describe("recommendSafe", () => {
  it("AI가 되면 mode 가 ai 이고 필터를 돌려준다", async () => {
    const r = await recommendSafe({ tasteText: "한식" }, okRun);
    expect(r).toEqual({ mode: "ai", filter: { category: "한식" } });
  });

  it("한도 오류가 나도 멈추지 않고 rules 로 내려간다", async () => {
    const r = await recommendSafe({ tasteText: "한식" }, limitRun);
    expect(r.mode).toBe("rules");
    expect(r.filter).toBeNull();
  });

  it("JSON 이 깨져도 rules 로 내려간다", async () => {
    const r = await recommendSafe({ tasteText: "x" }, async () => ({ text: "죄송합니다", ms: 1 }));
    expect(r.mode).toBe("rules");
  });

  it("rules 모드의 추천에는 기본 추천 안내가 붙고 3곳이 나온다", async () => {
    const r = await recommendWithFallback(places, { tasteText: "한식" }, weather, limitRun);
    expect(r.notice).toBe("AI 설명 없이 기본 추천이에요");
    expect(r.places).toHaveLength(3);
  });

  it("전화번호가 든 입력은 지운 뒤에 보낸다", async () => {
    let sent = "";
    await recommendSafe({ tasteText: "매운 거 말고 010-1234-5678" }, async (_p, _s, u) => {
      sent = u;
      return { text: "{}", ms: 1 };
    });
    expect(sent).not.toContain("010");
  });
});

describe("compare-lib", () => {
  it("필드별 일치를 센다", () => {
    expect(fieldMatches({ category: "한식", avoid: [], solo: true }, { category: "한식", avoid: [], solo: true })).toBe(3);
    expect(fieldMatches({ avoid: ["매운"] }, { category: "한식", avoid: [], solo: false })).toBe(1);
  });
  it("코드 블록으로 감싼 JSON 도 읽고, 깨진 글은 null", () => {
    expect(parseJsonOrNull('```json\n{"solo":true}\n```')).toEqual({ solo: true });
    expect(parseJsonOrNull("아님")).toBeNull();
  });
  it("비용은 토큰 x 단가", () => {
    expect(costUsd(600, 100, 0.1, 0.5)).toBeCloseTo(0.00011, 8);
  });
});
