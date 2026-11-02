// 두 문장으로 parseTaste 를 한 번씩 부른다.
// 목업(키 필요 없음):  MOCK_LLM=1 npx tsx scripts/try-taste.ts
// 실제 호출(요금 발생): ANTHROPIC_API_KEY 를 .env 에 넣고 npx tsx --env-file=.env scripts/try-taste.ts
import { parseTaste } from "../src/parse-taste";

const sentences = ["매운 거 말고, 혼밥", "비 오는데 국물 있는 한식"];

async function main() {
  for (const s of sentences) {
    const filter = await parseTaste(s);
    console.log(JSON.stringify(s), "->", JSON.stringify(filter));
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
