// 브라우저는 이 주소만 부른다. API 키는 서버(이 파일 쪽)에서만 읽는다.
import { parseTaste } from "../../../src/parse-taste";

const MAX_LEN = 100;

export async function POST(req: Request) {
  let text = "";
  try {
    const body = await req.json();
    text = typeof body?.text === "string" ? body.text : "";
  } catch {
    return Response.json({ error: "요청 형식이 맞지 않아요." }, { status: 400 });
  }
  if (!text.trim()) {
    return Response.json({ error: "취향을 한 줄 적어 주세요." }, { status: 400 });
  }
  if (text.length > MAX_LEN) {
    return Response.json({ error: `${MAX_LEN}자 안으로 적어 주세요.` }, { status: 400 });
  }
  // 키도 목업 설정도 없으면 LLM을 부르지 않는다. 화면은 코드 규칙(필터 버튼)으로 계속 동작한다.
  if (process.env.MOCK_LLM !== "1" && !process.env.ANTHROPIC_API_KEY) {
    return Response.json({ error: "취향 해석을 켜지 않았어요." }, { status: 503 });
  }
  try {
    const filter = await parseTaste(text);
    return Response.json({ filter });
  } catch {
    return Response.json({ error: "취향을 읽지 못했어요. 잠시 뒤 다시 해 주세요." }, { status: 502 });
  }
}
