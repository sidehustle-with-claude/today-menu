// 서버에서 쓰는 저장소와 결제 서비스를 한 번만 만든다(개발 서버가 다시 읽혀도 주문이 사라지지 않게 globalThis 에 둔다).
import { MockGateway, tossGateway, type PaymentGateway } from "./gateway";
import { paymentMode } from "./mode";
import { MemoryOrderStore, type OrderStore } from "./store";

const g = globalThis as unknown as { __orders?: OrderStore; __mock?: MockGateway };

export function runtime(env: Record<string, string | undefined> = process.env): { store: OrderStore; gateway: PaymentGateway } | null {
  const mode = paymentMode(env);
  if (mode === "off") return null;
  g.__orders ??= new MemoryOrderStore();
  g.__mock ??= new MockGateway();
  const gateway = mode === "test" ? tossGateway((env.TOSS_SECRET_KEY ?? "").trim()) : g.__mock;
  return { store: g.__orders, gateway };
}
