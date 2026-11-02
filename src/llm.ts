// 예제 19-1: src/llm.ts (공급자 어댑터)
// 호출부는 이 파일 한 곳이다. 모델 이름은 llm.config.json 에 있고, 클라이언트는 실제로 부를 때 만든다.
import Anthropic from "@anthropic-ai/sdk";
import { GoogleGenAI } from "@google/genai";
import config from "../llm.config.json";

export type Provider = "claude" | "gemini";
export interface LlmResult { text: string; ms: number; inTok?: number;
  outTok?: number; }

let claude: Anthropic | undefined;
let gemini: GoogleGenAI | undefined;

export async function complete(
  provider: Provider, system: string, user: string,
): Promise<LlmResult> {
  const t0 = Date.now();
  if (provider === "claude") {
    claude ??= new Anthropic();
    const r = await claude.messages.create({
      model: config.claudeModel, max_tokens: 400, system,
      messages: [{ role: "user", content: user }],
    });
    const b = r.content.find((x) => x.type === "text");
    return { text: b && b.type === "text" ? b.text : "",
      ms: Date.now() - t0,
      inTok: r.usage.input_tokens, outTok: r.usage.output_tokens };
  }
  gemini ??= new GoogleGenAI({});
  const r = await gemini.interactions.create({
    model: config.geminiModel, input: `${system}\n\n${user}`,
  });
  return { text: r.output_text ?? "", ms: Date.now() - t0 };
}
