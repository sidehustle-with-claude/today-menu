// ask() 를 한 번 실행하고 모델이 부른 툴 이름과 입력을 출력한다.
// 실제 호출은 요금이 듭니다: ANTHROPIC_API_KEY, DATA_GO_KR_KEY(또는 MOCK_TOOLS=1)를 .env 에 넣고
//   npx tsx --env-file=.env scripts/try-ask.ts
import type Anthropic from "@anthropic-ai/sdk";
import Client from "@anthropic-ai/sdk";
import { ask, type CreateMessage } from "../src/ask";

const client = new Client();
const create: CreateMessage = async (params) => {
  const res = await client.messages.create(params);
  for (const b of res.content as Anthropic.ContentBlock[]) {
    if (b.type === "tool_use") console.log("툴 호출:", b.name, JSON.stringify(b.input));
  }
  return res;
};

async function main() {
  if (!process.env.ANTHROPIC_API_KEY) {
    console.error("ANTHROPIC_API_KEY 가 없어서 실제 호출을 하지 않습니다. 목업 흐름은 npm test 로 확인합니다.");
    process.exit(1);
  }
  const answer = await ask("비 오는 날 망원동에서 혼밥하기 좋은 한식집 알려 줘", 5, create);
  console.log(answer);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
