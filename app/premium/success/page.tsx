import type { Metadata } from "next";
import ConfirmResult from "./confirm-result";

export const metadata: Metadata = { title: "결제 확인 | 오늘 뭐 먹지", robots: { index: false } };

export default async function SuccessPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const q = await searchParams;
  const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) ?? "";
  return (
    <main>
      <h1>결제 확인</h1>
      <ConfirmResult paymentKey={one(q.paymentKey)} orderId={one(q.orderId)} amount={one(q.amount)} />
    </main>
  );
}
