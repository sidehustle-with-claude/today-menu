"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

// failUrl 로 돌아오면 주문 상태를 남긴다. 창을 닫은 경우(PAY_PROCESS_CANCELED)에는 orderId 가 오지 않아 브라우저에 적어 둔 값을 쓴다.
export default function FailResult({ code, message, orderId }: { code: string; message: string; orderId: string }) {
  const [status, setStatus] = useState("");
  const sent = useRef(false);

  useEffect(() => {
    if (sent.current) return;
    sent.current = true;
    let id = orderId;
    if (!id) {
      try {
        id = sessionStorage.getItem("lastOrderId") ?? "";
      } catch {}
    }
    fetch("/api/payments/fail", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ orderId: id, code }),
    })
      .then((r) => r.json())
      .then((d) => setStatus(d.status ?? ""))
      .catch(() => {});
  }, [code, orderId]);

  const canceled = code === "PAY_PROCESS_CANCELED";
  return (
    <div role="status">
      <p>{canceled ? "결제를 취소했습니다." : message || "결제가 거절됐습니다."} 프리미엄은 켜지지 않았습니다.</p>
      {status && <p className="hint">주문 상태: {status}</p>}
      <p>
        <Link href="/premium">이용권 화면으로</Link>
      </p>
    </div>
  );
}
