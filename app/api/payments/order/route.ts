import { errorResponse, getRuntime } from "../../../../src/payments/http";
import { createOrder } from "../../../../src/payments/service";

// 결제창을 열기 전에 서버가 주문과 금액을 저장한다. 금액은 서버가 정한 값만 쓴다.
export async function POST() {
  const r = getRuntime();
  if ("error" in r) return r.error;
  try {
    const o = await createOrder(r.rt.store);
    return Response.json({ orderId: o.orderId, orderName: o.orderName, amount: o.amount });
  } catch (e) {
    return errorResponse(e);
  }
}
