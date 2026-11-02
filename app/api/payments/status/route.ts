import { getRuntime } from "../../../../src/payments/http";

export async function GET(req: Request) {
  const r = getRuntime();
  if ("error" in r) return r.error;
  const orderId = new URL(req.url).searchParams.get("orderId") ?? "";
  const o = await r.rt.store.find(orderId);
  if (!o) return Response.json({ error: "없는 주문입니다." }, { status: 404 });
  return Response.json({ status: o.status, premium: o.status === "paid" });
}
