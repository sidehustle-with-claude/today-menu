// 주문 저장소. 책 예제 37-1 의 `db.orders` 자리다.
// 여기서는 서버 메모리에 둔다(재시작하면 사라진다). 실제 서비스에서는 26~27장의 D1 이나 Supabase 로 바꾼다.
export type OrderStatus = "pending" | "paid" | "failed" | "canceled" | "amount_mismatch";

export type Order = {
  orderId: string;
  orderName: string;
  amount: number;
  status: OrderStatus;
  paymentKey?: string;
};

export interface OrderStore {
  create(order: Omit<Order, "status">): Promise<Order>;
  find(orderId: string): Promise<Order | undefined>;
  mark(orderId: string, status: OrderStatus, paymentKey?: string): Promise<void>;
  // 같은 웹훅 이벤트를 두 번 처리하지 않기 위한 표시. 처음이면 true, 이미 있으면 false.
  claimEvent(key: string): Promise<boolean>;
}

export class MemoryOrderStore implements OrderStore {
  private orders = new Map<string, Order>();
  private events = new Set<string>();

  async create(order: Omit<Order, "status">): Promise<Order> {
    const created: Order = { ...order, status: "pending" };
    this.orders.set(order.orderId, created);
    return { ...created };
  }

  async find(orderId: string): Promise<Order | undefined> {
    const o = this.orders.get(orderId);
    return o ? { ...o } : undefined;
  }

  async mark(orderId: string, status: OrderStatus, paymentKey?: string): Promise<void> {
    const o = this.orders.get(orderId);
    if (!o) return;
    o.status = status;
    if (paymentKey) o.paymentKey = paymentKey;
  }

  async claimEvent(key: string): Promise<boolean> {
    if (this.events.has(key)) return false;
    this.events.add(key);
    return true;
  }
}
