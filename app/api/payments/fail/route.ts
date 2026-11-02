import { getRuntime, readJson } from "../../../../src/payments/http";
import { recordFailure } from "../../../../src/payments/service";

// failUrl 로 돌아왔을 때 주문 상태를 남긴다. 창을 닫은 경우(PAY_PROCESS_CANCELED)는 canceled 이다.
export async function POST(req: Request) {
  const r = getRuntime();
  if ("error" in r) return r.error;
  const b = await readJson(req);
  const orderId = typeof b?.orderId === "string" ? b.orderId : undefined;
  const code = typeof b?.code === "string" ? b.code : undefined;
  const o = await recordFailure(r.rt.store, { orderId, code });
  return Response.json({ status: o?.status ?? "unknown" });
}
