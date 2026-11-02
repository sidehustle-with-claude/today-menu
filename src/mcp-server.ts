// 같은 툴 함수를 MCP 서버로 감싸 클로드 코드에서도 쓴다. 함수는 tools-impl.ts 한 곳에만 있다.
// 등록: claude mcp add --env DATA_GO_KR_KEY=여기에-키 --transport stdio today-menu -- npx tsx src/mcp-server.ts
// 키 없이 흐름만 보려면 --env MOCK_TOOLS=1 을 같이 줍니다.
import { McpServer } from "@modelcontextprotocol/server";
import { StdioServerTransport } from "@modelcontextprotocol/server/stdio";
import { z } from "zod";
import { getPlaces, getWeather } from "./tools-impl";

const server = new McpServer({ name: "today-menu", version: "1.0.0" });

server.registerTool(
  "get_weather",
  {
    description: "한국 동네의 현재 날씨(기온, 강수 여부)를 조회한다. 내일 예보는 돌려주지 않는다.",
    inputSchema: z.object({ dong: z.string() }),
  },
  async ({ dong }) => ({
    content: [{ type: "text", text: JSON.stringify(await getWeather(dong)) }],
  }),
);

server.registerTool(
  "get_places",
  {
    description:
      "동네의 음식점 목록을 찾는다. 가게 이름, 주소, 전화번호만 돌려주고 영업시간·메뉴·가격·평점은 돌려주지 않는다.",
    inputSchema: z.object({ dong: z.string(), category: z.string().optional() }),
  },
  async ({ dong, category }) => ({
    content: [{ type: "text", text: JSON.stringify(await getPlaces(dong, category)) }],
  }),
);

server.connect(new StdioServerTransport()).catch((e) => {
  console.error(e);
  process.exit(1);
});
