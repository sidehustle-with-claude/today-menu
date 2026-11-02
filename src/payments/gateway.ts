// 결제 서비스와 말하는 부분. 진짜(토스페이먼츠 테스트 키)와 가짜(mock) 두 가지가 같은 모양이다.
// 공식 문서: https://docs.tosspayments.com/guides/v2/payment-widget/integration (2026년 11월 확인)

export type ConfirmQuery = { paymentKey: string; orderId: string; amount: number };
export type PaymentInfo = { orderId: string; status: string; totalAmount: number };

export interface PaymentGateway {
  confirm(q: ConfirmQuery): Promise<{ ok: boolean }>;
  // 결제 조회. 웹훅 내용을 믿지 않고 결제 서비스에 직접 다시 묻는 데 쓴다. 없는 결제면 null.
  lookup(paymentKey: string): Promise<PaymentInfo | null>;
}

const API = "https://api.tosspayments.com/v1/payments";

function basicAuth(secret: string): string {
  return `Basic ${Buffer.from(`${secret}:`).toString("base64")}`;
}

// 토스페이먼츠 테스트 키(test_...)로만 만든다. 시크릿 키는 서버에서만 읽는다.
export function tossGateway(secret: string, fetchFn: typeof fetch = fetch): PaymentGateway {
  return {
    async confirm(q) {
      const res = await fetchFn(`${API}/confirm`, {
        method: "POST",
        headers: { Authorization: basicAuth(secret), "Content-Type": "application/json" },
        body: JSON.stringify(q),
      });
      return { ok: res.ok };
    },
    async lookup(paymentKey) {
      const res = await fetchFn(`${API}/${encodeURIComponent(paymentKey)}`, {
        headers: { Authorization: basicAuth(secret) },
      });
      if (res.status === 404) return null;
      if (!res.ok) throw new Error(`결제 조회 실패 (${res.status})`);
      const p = (await res.json()) as { orderId: string; status: string; totalAmount: number };
      return { orderId: p.orderId, status: p.status, totalAmount: p.totalAmount };
    },
  };
}

// 가짜 결제 서비스. 외부에 아무것도 보내지 않는다.
// paymentKey 가 mock_ok_ 로 시작하면 승인되고, mock_fail_ 로 시작하면 거절된다.
export class MockGateway implements PaymentGateway {
  private payments = new Map<string, PaymentInfo>();

  async confirm(q: ConfirmQuery): Promise<{ ok: boolean }> {
    if (!q.paymentKey.startsWith("mock_ok_")) return { ok: false };
    this.payments.set(q.paymentKey, { orderId: q.orderId, status: "DONE", totalAmount: q.amount });
    return { ok: true };
  }

  async lookup(paymentKey: string): Promise<PaymentInfo | null> {
    const p = this.payments.get(paymentKey);
    return p ? { ...p } : null;
  }

  // 테스트에서 환불·취소를 흉내 낸다.
  cancel(paymentKey: string, status = "CANCELED"): void {
    const p = this.payments.get(paymentKey);
    if (p) p.status = status;
  }
}
