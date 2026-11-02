import type { Metadata } from "next";
import FailResult from "./fail-result";

export const metadata: Metadata = { title: "결제 실패 | 오늘 뭐 먹지", robots: { index: false } };

export default async function FailPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const q = await searchParams;
  const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) ?? "";
  return (
    <main>
      <h1>결제가 끝나지 않았습니다</h1>
      <FailResult code={one(q.code)} message={one(q.message)} orderId={one(q.orderId)} />
    </main>
  );
}
