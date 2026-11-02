// 예제 18-2: src/ask.ts
import Anthropic from "@anthropic-ai/sdk";
import { tools } from "./tools";
import { getPlaces, getWeather } from "./tools-impl";

let client: Anthropic | undefined;
const MODEL = process.env.TOOL_MODEL ?? "claude-sonnet-5-5";

const SYSTEM = `당신은 동네 음식점 추천 도우미입니다.
규칙: 날씨와 가게 정보는 툴 결과에 있는 것만 말합니다.
툴 결과에 없는 정보(영업시간, 가격, 맛, 평점)는 '정보 없음'이라고
답합니다. 말한 사실마다 출처(source)를 괄호로 붙입니다.`;

// 테스트에서는 실제 API 대신 가짜 호출 함수를 넣는다.
export type CreateMessage = (
  params: Anthropic.MessageCreateParamsNonStreaming,
) => Promise<Anthropic.Message>;

const realCreate: CreateMessage = (params) => {
  client ??= new Anthropic();
  return client.messages.create(params);
};

async function run(name: string, input: any): Promise<string> {
  if (name === "get_weather") return JSON.stringify(await getWeather(input.dong));
  if (name === "get_places")
    return JSON.stringify(await getPlaces(input.dong, input.category));
  throw new Error(`알 수 없는 툴: ${name}`);
}

export async function ask(
  question: string,
  maxTurns = 5,
  create: CreateMessage = realCreate,
): Promise<string> {
  const messages: Anthropic.MessageParam[] = [
    { role: "user", content: question },
  ];
  for (let turn = 0; turn < maxTurns; turn++) {
    const res = await create({
      model: MODEL, max_tokens: 1024, system: SYSTEM, tools, messages,
    });
    if (res.stop_reason !== "tool_use") {
      const t = res.content.find((b) => b.type === "text");
      return t && t.type === "text" ? t.text : "";
    }
    messages.push({ role: "assistant", content: res.content });
    const results: Anthropic.ToolResultBlockParam[] = [];
    for (const b of res.content) {
      if (b.type !== "tool_use") continue;
      try {
        results.push({
          type: "tool_result", tool_use_id: b.id,
          content: await run(b.name, b.input),
        });
      } catch (e) {
        results.push({
          type: "tool_result", tool_use_id: b.id, is_error: true,
          content: `실패: ${(e as Error).message}. 다른 동네나 카테고리로 `
            + `다시 시도하거나, 정보가 없다고 답하세요.`,
        });
      }
    }
    messages.push({ role: "user", content: results });
  }
  return "답을 만들지 못했습니다. 잠시 뒤 다시 시도해 주세요.";
}
