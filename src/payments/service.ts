import type { PaymentGateway } from "./gateway";
import { PRODUCT } from "./products";
import type { Order, OrderStore } from "./store";

export class PaymentError extends Error {
  constructor(
    message: string,
    public status = 400,
  ) {
    super(message);
  }
}

export type Deps = { store: OrderStore; gateway: PaymentGateway };

// 결제 요청 전에 서버가 주문과 금액을 먼저 저장한다.
export async function createOrder(store: OrderStore, newId: () => string = () => `order_${crypto.randomUUID()}`): Promise<Order> {
  return store.create({ orderId: newId(), orderName: PRODUCT.name, amount: PRODUCT.amount });
}

// 예제 37-1: 결제 승인. 순서는 주문 찾기 -> 금액 비교 -> 승인 호출 -> 상태 저장이다.
export async function confirmPayment(deps: Deps, q: { paymentKey: string; orderId: string; amount: number }): Promise<Order> {
  const order = await deps.store.find(q.orderId);
  if (!order) throw new PaymentError("없는 주문입니다", 404);
  if (order.status === "paid" && order.paymentKey === q.paymentKey) return order; // 같은 요청이 다시 와도 한 번만 승인한다
  if (order.status !== "pending") throw new PaymentError("이미 끝난 주문입니다", 409);

  if (order.amount !== q.amount) {
    await deps.store.mark(q.orderId, "amount_mismatch");
    throw new PaymentError("금액이 다릅니다");
  }
  const res = await deps.gateway.confirm(q);
  if (!res.ok) {
    await deps.store.mark(q.orderId, "failed");
    throw new PaymentError("승인 실패", 402);
  }
  await deps.store.mark(q.orderId, "paid", q.paymentKey);
  return (await deps.store.find(q.orderId))!;
}

// 결제창이 실패 주소(failUrl)로 돌아왔을 때. 사용자가 창을 닫으면 PAY_PROCESS_CANCELED 가 온다.
export async function recordFailure(store: OrderStore, f: { orderId?: string; code?: string }): Promise<Order | undefined> {
  if (!f.orderId) return undefined;
  const order = await store.find(f.orderId);
  if (!order || order.status !== "pending") return order;
  await store.mark(f.orderId, f.code === "PAY_PROCESS_CANCELED" ? "canceled" : "failed");
  return store.find(f.orderId);
}

export type WebhookResult = { handled: boolean; reason?: "duplicate" | "unverified" | "unknown_order" | "amount_mismatch" | "ignored_status" | "malformed" };

const WEBHOOK_EVENTS = new Set(["PAYMENT_STATUS_CHANGED", "CANCEL_STATUS_CHANGED"]);

// 웹훅 처리. 받은 내용은 믿지 않고 paymentKey 로 결제 서비스에 직접 다시 물어본 값만 쓴다.
export async function handleWebhook(deps: Deps, body: unknown): Promise<WebhookResult> {
  const b = body as { eventType?: unknown; createdAt?: unknown; data?: { paymentKey?: unknown; status?: unknown } } | null;
  const paymentKey = b?.data?.paymentKey;
  if (!b || typeof b.eventType !== "string" || !WEBHOOK_EVENTS.has(b.eventType) || typeof paymentKey !== "string" || !paymentKey) {
    return { handled: false, reason: "malformed" };
  }

  const info = await deps.gateway.lookup(paymentKey); // 실패하면 예외 -> 호출한 쪽이 5xx 를 돌려 다시 받게 한다
  if (!info) return { handled: false, reason: "unverified" };

  const order = await deps.store.find(info.orderId);
  if (!order) return { handled: false, reason: "unknown_order" };
  if (order.amount !== info.totalAmount) return { handled: false, reason: "amount_mismatch" };

  // 같은 이벤트는 한 번만 처리한다. 확인이 끝난 뒤에 표시하므로, 확인에 실패한 이벤트는 다시 받을 수 있다.
  const key = `${b.eventType}:${paymentKey}:${info.status}:${String(b.createdAt ?? "")}`;
  if (!(await deps.store.claimEvent(key))) return { handled: false, reason: "duplicate" };

  switch (info.status) {
    case "DONE":
      if (order.status === "pending") await deps.store.mark(order.orderId, "paid", paymentKey);
      return { handled: true };
    case "CANCELED":
    case "PARTIAL_CANCELED":
      if (order.status === "paid" || order.status === "pending") await deps.store.mark(order.orderId, "canceled", paymentKey);
      return { handled: true };
    case "ABORTED":
    case "EXPIRED":
      if (order.status === "pending") await deps.store.mark(order.orderId, "failed");
      return { handled: true };
    default:
      return { handled: false, reason: "ignored_status" };
  }
}

export const isPremium = (o: Order | undefined) => o?.status === "paid";
