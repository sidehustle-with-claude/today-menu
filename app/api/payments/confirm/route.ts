import { errorResponse, getRuntime, readJson } from "../../../../src/payments/http";
import { confirmPayment, PaymentError } from "../../../../src/payments/service";

// successUrl 로 돌아온 값(paymentKey, orderId, amount)을 받아 서버가 승인한다.
export async function POST(req: Request) {
  const r = getRuntime();
  if ("error" in r) return r.error;
  const b = await readJson(req);
  const amount = Number(b?.amount);
  if (!b || typeof b.paymentKey !== "string" || typeof b.orderId !== "string" || !Number.isFinite(amount)) {
    return Response.json({ error: "요청 형식이 맞지 않습니다." }, { status: 400 });
  }
  try {
    const o = await confirmPayment(r.rt, { paymentKey: b.paymentKey, orderId: b.orderId, amount });
    return Response.json({ status: o.status, premium: o.status === "paid" });
  } catch (e) {
    return e instanceof PaymentError ? errorResponse(e) : errorResponse(e);
  }
}
