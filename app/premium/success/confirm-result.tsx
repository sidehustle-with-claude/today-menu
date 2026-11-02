"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

// successUrl 로 돌아오면 서버에 승인을 요청한다. 인증이 끝난 것만으로는 결제가 끝난 것이 아니다.
export default function ConfirmResult({ paymentKey, orderId, amount }: { paymentKey: string; orderId: string; amount: string }) {
  const [state, setState] = useState<"working" | "paid" | "error">("working");
  const [message, setMessage] = useState("");
  const sent = useRef(false);

  useEffect(() => {
    if (sent.current) return;
    sent.current = true;
    fetch("/api/payments/confirm", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ paymentKey, orderId, amount: Number(amount) }),
    })
      .then(async (res) => {
        const data = await res.json();
        if (res.ok && data.premium) setState("paid");
        else {
          setState("error");
          setMessage(data.error ?? "결제를 확인하지 못했습니다.");
        }
      })
      .catch(() => {
        setState("error");
        setMessage("결제를 확인하지 못했습니다.");
      });
  }, [paymentKey, orderId, amount]);

  return (
    <div role="status">
      {state === "working" && <p>결제를 확인하고 있습니다.</p>}
      {state === "paid" && <p>결제가 끝났습니다. 프리미엄이 켜졌습니다. (예제라서 상태만 표시합니다)</p>}
      {state === "error" && <p>{message} 프리미엄은 켜지지 않았습니다.</p>}
      <p>
        <Link href="/premium">이용권 화면으로</Link>
      </p>
    </div>
  );
}
