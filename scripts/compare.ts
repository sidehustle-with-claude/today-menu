// 같은 입력 10개를 Claude 와 Gemini 로 한 번씩 돌려 일치율, 깨짐, 시간, 비용을 표로 낸다.
// 실제 호출입니다(Claude 는 요금, Gemini 는 무료 한도). 키가 없는 쪽은 건너뜁니다.
//   npx tsx --env-file=.env scripts/compare.ts
import { readFileSync } from "node:fs";
import { complete, type Provider } from "../src/llm";
import { SYSTEM } from "../src/recommend-safe";
import { costUsd, fieldMatches, parseJsonOrNull, type Sample } from "../src/compare-lib";

const HAIKU_IN = 0.10; // 달러 / 100만 토큰 (2026년 11월 공식 가격 문서 기준)
const HAIKU_OUT = 0.50;

async function runOne(provider: Provider, samples: Sample[]) {
  let matched = 0, broken = 0, totalMs = 0, inTok = 0, outTok = 0;
  for (const s of samples) {
    try {
      const r = await complete(provider, SYSTEM, s.text);
      totalMs += r.ms; inTok += r.inTok ?? 0; outTok += r.outTok ?? 0;
      const got = parseJsonOrNull(r.text);
      if (!got) { broken++; continue; }
      matched += fieldMatches(got, s.answer);
    } catch (e: any) {
      broken++;
      console.warn(provider, s.id, "실패:", e?.status ?? e?.message);
    }
  }
  const ok = samples.length - broken;
  return {
    provider,
    "필드 일치(30칸 중)": matched,
    "JSON 깨짐/실패(10개 중)": broken,
    "평균 응답(ms)": ok ? Math.round(totalMs / ok) : null,
    "비용(달러)": provider === "claude" ? costUsd(inTok, outTok, HAIKU_IN, HAIKU_OUT) : 0,
  };
}

async function main() {
  const samples: Sample[] = JSON.parse(readFileSync("data/taste-samples.json", "utf8"));
  const rows = [];
  if (process.env.ANTHROPIC_API_KEY) rows.push(await runOne("claude", samples));
  else console.log("ANTHROPIC_API_KEY 가 없어 Claude 는 건너뜁니다.");
  if (process.env.GEMINI_API_KEY) rows.push(await runOne("gemini", samples));
  else console.log("GEMINI_API_KEY 가 없어 Gemini 는 건너뜁니다.");
  if (rows.length) console.table(rows);
  console.log("10건은 작은 표본입니다. 어느 모델이 더 좋다고 단정하지 말고, 어려운 3개의 차이를 눈으로 확인합니다.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
