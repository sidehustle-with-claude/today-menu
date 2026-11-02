"use client";

import { useState } from "react";

type TossWidgets = {
  setAmount(a: { currency: string; value: number }): Promise<void>;
  renderPaymentMethods(o: { selector: string }): Promise<unknown>;
  renderAgreement(o: { selector: string }): Promise<unknown>;
  requestPayment(o: { orderId: string; orderName: string; successUrl: string; failUrl: string }): Promise<void>;
};
type TossFactory = ((clientKey: string) => { widgets(o: { customerKey: string }): TossWidgets }) & { ANONYMOUS: string };

function loadTossScript(): Promise<TossFactory> {
  const w = window as unknown as { TossPayments?: TossFactory };
  if (w.TossPayments) return Promise.resolve(w.TossPayments);
  return new Promise((resolve, reject) => {
    const s = document.createElement("script");
    s.src = "https://js.tosspayments.com/v2/standard";
    s.onload = () => (w.TossPayments ? resolve(w.TossPayments) : reject(new Error("결제창을 불러오지 못했습니다.")));
    s.onerror = () => reject(new Error("결제창을 불러오지 못했습니다."));
    document.head.appendChild(s);
  });
}

type Order = { orderId: string; orderName: string; amount: number };

export default function Checkout({ mode, clientKey, amount }: { mode: "test" | "mock"; clientKey: string; amount: number }) {
  const [order, setOrder] = useState<Order | null>(null);
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);

  async function start() {
    setMsg("");
    setBusy(true);
    try {
      const res = await fetch("/api/payments/order", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "주문을 만들지 못했습니다.");
      try {
        sessionStorage.setItem("lastOrderId", data.orderId); // 창을 닫으면 failUrl 에 orderId 가 오지 않는다
      } catch {}
      setOrder(data);
      if (mode === "test") await openTossWidget(data);
    } catch (e) {
      setMsg(e instanceof Error ? e.message : "결제를 시작하지 못했습니다.");
    } finally {
      setBusy(false);
    }
  }

  // 토스페이먼츠 결제위젯(테스트 키). 공식 문서: https://docs.tosspayments.com/guides/v2/payment-widget/integration
  async function openTossWidget(o: Order) {
    const Toss = await loadTossScript();
    const widgets = Toss(clientKey).widgets({ customerKey: Toss.ANONYMOUS });
    await widgets.setAmount({ currency: "KRW", value: o.amount });
    await widgets.renderPaymentMethods({ selector: "#payment-method" });
    await widgets.renderAgreement({ selector: "#agreement" });
    (window as unknown as { __pay?: () => Promise<void> }).__pay = () =>
      widgets.requestPayment({
        orderId: o.orderId,
        orderName: o.orderName,
        successUrl: `${window.location.origin}/premium/success`,
        failUrl: `${window.location.origin}/premium/fail`,
      });
  }

  function go(kind: "ok" | "fail" | "cancel") {
    if (!order) return;
    const base = window.location.origin;
    if (kind === "ok") {
      const p = new URLSearchParams({ paymentKey: `mock_ok_${crypto.randomUUID()}`, orderId: order.orderId, amount: String(order.amount) });
      window.location.assign(`${base}/premium/success?${p}`);
    } else if (kind === "fail") {
      const p = new URLSearchParams({ code: "PAY_REJECT_CARD_COMPANY", message: "카드사가 결제를 거절했습니다.", orderId: order.orderId });
      window.location.assign(`${base}/premium/fail?${p}`);
    } else {
      const p = new URLSearchParams({ code: "PAY_PROCESS_CANCELED", message: "사용자가 결제를 취소했습니다." });
      window.location.assign(`${base}/premium/fail?${p}`);
    }
  }

  return (
    <section>
      {!order && (
        <button type="button" className="search" onClick={start} disabled={busy}>
          프리미엄 1개월 결제 ({amount.toLocaleString("ko-KR")}원)
        </button>
      )}
      {msg && <p role="alert">{msg}</p>}

      {order && mode === "mock" && (
        <div aria-label="가짜 결제창">
          <p className="hint">가짜 결제창입니다. 외부로 아무것도 보내지 않습니다. 주문 {order.orderName}, {order.amount.toLocaleString("ko-KR")}원.</p>
          <div className="auth-actions">
            <button type="button" onClick={() => go("ok")}>결제 성공</button>
            <button type="button" onClick={() => go("fail")}>카드 거절</button>
          </div>
          <div className="auth-actions">
            <button type="button" onClick={() => go("cancel")}>결제창 닫기</button>
          </div>
        </div>
      )}

      {order && mode === "test" && (
        <div>
          <div id="payment-method" />
          <div id="agreement" />
          <button type="button" className="search" onClick={() => (window as unknown as { __pay?: () => Promise<void> }).__pay?.()}>
            결제하기
          </button>
        </div>
      )}
    </section>
  );
}
