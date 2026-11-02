import type { Metadata } from "next";
import Link from "next/link";
import Checkout from "./checkout";
import { LiveKeyError, paymentMode, type PaymentMode } from "../../src/payments/mode";
import { PRODUCT } from "../../src/payments/products";

// 연습용 화면이라 검색에 넣지 않는다. 키를 읽으므로 요청 때마다 만든다.
export const metadata: Metadata = { title: "프리미엄 이용권 | 오늘 뭐 먹지", robots: { index: false } };
export const dynamic = "force-dynamic";

export default function PremiumPage() {
  let mode: PaymentMode = "off";
  let blocked = false;
  try {
    mode = paymentMode();
  } catch (e) {
    if (e instanceof LiveKeyError) blocked = true;
  }
  // 클라이언트 키는 화면에 드러나도 되는 값이다. 시크릿 키는 이 파일 어디에도 없다.
  const clientKey = mode === "test" ? (process.env.TOSS_CLIENT_KEY ?? "").trim() : "";
  return (
    <main>
      <h1>프리미엄 이용권</h1>
      <p className="hint">
        {PRODUCT.name} {PRODUCT.amount.toLocaleString("ko-KR")}원(연습용 가격). 테스트 결제만 되고 실제 돈은 오가지 않습니다.
      </p>
      {blocked && <p role="alert">실서비스 키가 설정돼 있어 결제를 막았습니다. 테스트 키로 바꿔 주세요.</p>}
      {mode === "off" && !blocked && <p>결제 기능이 꺼져 있습니다.</p>}
      {mode !== "off" && <Checkout mode={mode} clientKey={clientKey} amount={PRODUCT.amount} />}
      <p>
        <Link href="/menu">오늘 뭐 먹지로 돌아가기</Link>
      </p>
    </main>
  );
}
