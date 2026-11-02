// 예제 18-1: src/tools.ts (정의 부분)
import type Anthropic from "@anthropic-ai/sdk";

export const tools: Anthropic.Tool[] = [
  {
    name: "get_weather",
    description:
      "한국 동네의 현재 날씨(기온, 강수 여부)를 기상청 초단기실황으로 " +
      "조회한다. 날씨나 비·추위에 맞춰 메뉴를 고르려 할 때 쓴다. " +
      "내일 예보는 돌려주지 않는다. dong은 '망원동'처럼 등록된 " +
      "동 이름이다.",
    input_schema: {
      type: "object",
      properties: {
        dong: { type: "string", description: "동네 이름. 예: 망원동" },
      },
      required: ["dong"],
    },
  },
  {
    name: "get_places",
    description:
      "한국관광공사 TourAPI에서 동네의 음식점 목록을 찾는다. " +
      "가게 이름, 주소, 전화번호만 돌려주고 영업시간·메뉴·가격·평점은 " +
      "돌려주지 않는다. category는 한식·분식·카페 같은 말이다.",
    input_schema: {
      type: "object",
      properties: {
        dong: { type: "string", description: "동네 이름. 예: 망원동" },
        category: { type: "string", description: "예: 한식, 분식" },
      },
      required: ["dong"],
    },
  },
];
