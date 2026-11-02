import { beforeEach, describe, expect, it } from "vitest";
import type Anthropic from "@anthropic-ai/sdk";
import { readFileSync } from "node:fs";
import { ask, type CreateMessage } from "./ask";
import { parsePlaces, parseWeather } from "./tools-impl";

// 모두 가짜 응답으로 돈다. 유료 API도 공공 API도 부르지 않는다.
function msg(content: Anthropic.ContentBlock[], stop_reason: "tool_use" | "end_turn"): Anthropic.Message {
  return { id: "m", type: "message", role: "assistant", model: "fake", content, stop_reason, stop_sequence: null, usage: { input_tokens: 0, output_tokens: 0 } } as unknown as Anthropic.Message;
}
const toolUse = (id: string, name: string, input: unknown) => ({ type: "tool_use", id, name, input }) as Anthropic.ContentBlock;
const text = (t: string) => ({ type: "text", text: t }) as Anthropic.ContentBlock;

beforeEach(() => {
  process.env.MOCK_TOOLS = "1";
});

describe("ask 루프", () => {
  it("툴을 부른 뒤 결과를 붙여 다시 묻고, 마지막 글을 돌려준다", async () => {
    const seen: Anthropic.MessageParam[][] = [];
    let turn = 0;
    const create: CreateMessage = async (p) => {
      seen.push(JSON.parse(JSON.stringify(p.messages)));
      turn++;
      if (turn === 1) return msg([toolUse("t1", "get_weather", { dong: "새솔동" })], "tool_use");
      return msg([text("비가 와요. (기상청 초단기실황)")], "end_turn");
    };
    const answer = await ask("비 오는 날 추천", 5, create);
    expect(answer).toContain("기상청");
    const second = seen[1];
    const last = second[second.length - 1];
    expect(last.role).toBe("user");
    const block = (last.content as Anthropic.ToolResultBlockParam[])[0];
    expect(block.type).toBe("tool_result");
    expect(block.tool_use_id).toBe("t1");
    expect(block.is_error).toBeUndefined();
    expect(String(block.content)).toContain("기상청 초단기실황");
  });

  it("툴이 실패하면 is_error 와 다음 행동을 담은 문장을 돌려준다", async () => {
    process.env.MOCK_TOOLS = "0";
    let sent: Anthropic.ToolResultBlockParam | undefined;
    let turn = 0;
    const create: CreateMessage = async (p) => {
      turn++;
      if (turn === 1) return msg([toolUse("t1", "get_places", { dong: "없는동" })], "tool_use");
      const last = p.messages[p.messages.length - 1];
      sent = (last.content as Anthropic.ToolResultBlockParam[])[0];
      return msg([text("정보 없음")], "end_turn");
    };
    await ask("가게", 5, create);
    expect(sent?.is_error).toBe(true);
    expect(String(sent?.content)).toContain("다시 시도");
  });

  it("maxTurns 를 넘으면 멈춘다", async () => {
    let calls = 0;
    const create: CreateMessage = async () => {
      calls++;
      return msg([toolUse(`t${calls}`, "get_weather", { dong: "새솔동" })], "tool_use");
    };
    const answer = await ask("끝없는 질문", 3, create);
    expect(calls).toBe(3);
    expect(answer).toContain("답을 만들지 못했습니다");
  });
});

describe("툴 결과 추리기", () => {
  it("날씨는 기온·비 여부·출처만 돌려준다", () => {
    const raw = JSON.parse(readFileSync("samples/weather.mock.json", "utf8"));
    expect(parseWeather(raw)).toEqual({ tempC: 8.2, rain: true, source: "기상청 초단기실황" });
  });

  it("가게는 이름·주소·전화번호만 남긴다", () => {
    const raw = JSON.parse(readFileSync("samples/places.mock.json", "utf8"));
    const r = parsePlaces(raw);
    expect(r.places[0]).toEqual({ name: "가상 국밥집 하나", addr: "가상시 새솔동 1번지", tel: "000-0000-0001" });
    expect(Object.keys(r.places[0]).sort()).toEqual(["addr", "name", "tel"]);
  });

  it("빈 응답은 빈 배열이 아니라 '결과 없음' 오류를 던진다", () => {
    expect(() => parsePlaces({ response: { body: { items: "" } } })).toThrow("결과 없음");
    expect(() => parseWeather({})).toThrow("결과 없음");
  });

  it("정보 없음 점검 질문이 10개 있다", () => {
    const qs = JSON.parse(readFileSync("eval/no-info-questions.json", "utf8"));
    expect(qs).toHaveLength(10);
  });
});
