import { errorResponse, getRuntime, readJson } from "../../../../src/payments/http";
import { handleWebhook } from "../../../../src/payments/service";

// 토스페이먼츠는 10초 안에 200 을 받지 못하면 다시 보낸다. 받은 내용은 믿지 않고 결제 조회로 다시 확인한다.
export async function POST(req: Request) {
  const r = getRuntime();
  if ("error" in r) return r.error;
  const body = await readJson(req);
  if (!body) return Response.json({ error: "요청 형식이 맞지 않습니다." }, { status: 400 });
  try {
    const result = await handleWebhook(r.rt, body);
    return Response.json({ ok: true, ...result });
  } catch (e) {
    return errorResponse(e); // 확인하지 못했으면 5xx 를 돌려 다시 받게 한다
  }
}
