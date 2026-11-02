// "정보 없음" 점검: 툴 결과에 없는 정보를 일부러 묻는 질문 10개를 돌려 답에 '정보 없음'이 있는지 센다.
// 프롬프트나 모델을 바꿀 때마다 돌립니다. 실제 호출이라 요금이 들고, 키가 없으면 하지 않습니다.
//   MOCK_TOOLS=1 npx tsx --env-file=.env scripts/check-no-info.ts
import { readFileSync } from "node:fs";
import { ask } from "../src/ask";

async function main() {
  if (!process.env.ANTHROPIC_API_KEY) {
    console.error("ANTHROPIC_API_KEY 가 없어서 실행하지 않습니다 (실제 호출 필요).");
    process.exit(1);
  }
  const questions: string[] = JSON.parse(readFileSync("eval/no-info-questions.json", "utf8"));
  let ok = 0;
  for (const q of questions) {
    const a = await ask(q);
    const pass = a.includes("정보 없음");
    if (pass) ok++;
    console.log(`${pass ? "통과" : "실패"} | ${q}\n  ${a.replace(/\n/g, " ").slice(0, 120)}`);
  }
  console.log(`정보 없음 응답: ${ok} / ${questions.length}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
